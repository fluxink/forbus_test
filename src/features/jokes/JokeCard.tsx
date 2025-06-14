import { Box, Button, Card, CardActions, CardContent, Typography, Chip } from "@mui/material"
import { addUserJoke, removeJoke, replaceJokeWithUnique } from "./jokesSlice"
import { useLazyGetRandomJokeQuery } from "./jokesApiSlice"
import { type Joke } from "./types"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { useState } from "react"
import { type RootState } from "../../app/store"


type JokeCardProps = {
    joke: Joke;
}

export const JokeCard = ({ joke }: JokeCardProps) => {
    const dispatch = useAppDispatch();
    const { userJokes } = useAppSelector((state: RootState) => state.jokes);
    const [getRandomJoke] = useLazyGetRandomJokeQuery();
    const [refreshError, setRefreshError] = useState<string | null>(null);
    const [isReplacing, setIsReplacing] = useState(false);

    // Проверяем, сохранена ли шутка в localStorage
    const isSaved = userJokes.some(userJoke => userJoke.id === joke.id);

    const handleAdd = () => {
        const userJoke: Joke = {
            ...joke,
        };
        dispatch(addUserJoke(userJoke));
    };

    const handleDelete = () => {
        dispatch(removeJoke(joke.id));
    };

    const handleRefresh = async () => {
        if (isReplacing) return;

        setRefreshError(null);
        setIsReplacing(true);

        try {
            await dispatch(replaceJokeWithUnique({
                oldId: joke.id,
                apiCall: async () => {
                    const joke = await getRandomJoke(undefined).unwrap();
                    return { data: joke };
                }
            })).unwrap();
        } catch (error) {
            const errorMessage = error as string;
            setRefreshError(errorMessage);
        } finally {
            setIsReplacing(false);
        }
    };

    return (
        <Card
            sx={{
                height: '310px',
                display: 'flex',
                flexDirection: 'column',
                border: isSaved ? '2px solid #4caf50' : '1px solid rgba(0, 0, 0, 0.12)',
                boxShadow: isSaved ? '0 4px 8px rgba(76, 175, 80, 0.2)' : 1,
                '& .card-actions': {
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out'
                },
                '&:hover .card-actions': {
                    opacity: 1
                },
                filter: isReplacing ? 'blur(2px)' : 'none',
                transition: 'filter 0.3s ease-in-out'
            }}
        >
            <CardContent sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} >
                            Type:
                        </Typography>
                        <Typography variant="subtitle1" >
                            {`${joke.type.charAt(0).toUpperCase()}${joke.type.slice(1)}`}
                        </Typography>
                        {isSaved && (
                            <Chip 
                                label="Saved" 
                                size="small" 
                                color="success" 
                                sx={{ ml: 1 }}
                            />
                        )}
                    </Box>
                    <Typography variant="subtitle2" component="div">
                        ID: {joke.id}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        Setup:
                    </Typography>
                    <Box sx={{
                        height: '80px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis'
                    }}>
                        <Typography variant="body1">
                            {joke.setup}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        Punchline:
                    </Typography>
                    <Box sx={{
                        flexGrow: 1,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis'
                    }}>
                        <Typography variant="body2" color="textSecondary">
                            {joke.punchline}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
            {refreshError && (
                <Box sx={{ mt: 1, px: 2 }}>
                    <Typography variant="caption" color="error">
                        {refreshError}
                    </Typography>
                </Box>
            )}
            <CardActions className="card-actions">
                <Button
                    size="small"
                    color="error"
                    onClick={handleDelete}
                    disabled={isReplacing}
                >
                    Delete
                </Button>
                <Button
                    size="small"
                    color="primary"
                    onClick={handleAdd}
                    disabled={isReplacing || isSaved}
                >
                    {isSaved ? 'Saved' : 'Add'}
                </Button>
                <Button
                    size="small"
                    color="secondary"
                    onClick={() => void handleRefresh()}
                    disabled={isReplacing}
                >
                    {isReplacing ? 'Replacing...' : 'Refresh'}
                </Button>
            </CardActions>
        </Card>
    )
}