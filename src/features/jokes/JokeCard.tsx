import { Box, Button, Card, CardActions, CardContent, Typography } from "@mui/material"
import { addUserJoke, removeJoke, replaceJoke } from "./jokesSlice"
import { useLazyGetRandomJokeQuery } from "./jokesApiSlice"
import { type Joke } from "./types"
import { useAppDispatch } from "../../app/hooks"


type JokeCardProps = {
    joke: Joke;
}

export const JokeCard = ({ joke }: JokeCardProps) => {
    const dispatch = useAppDispatch();
    const [getRandomJoke] = useLazyGetRandomJokeQuery();

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
        try {
            const newJoke = await getRandomJoke(undefined).unwrap();

            // Заменяем старую шутку новой
            dispatch(replaceJoke({ oldId: joke.id, newJoke }));
        } catch (error) {
            console.error('Ошибка при обновлении шутки:', error);
            // Если произошла ошибка, можно вернуть старую шутку обратно
            // или показать уведомление об ошибке
        }
    };

    return (
        <Card
            sx={{
                '& .card-actions': {
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out'
                },
                '&:hover .card-actions': {
                    opacity: 1
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} >
                            Type:
                        </Typography>
                        <Typography variant="subtitle1" >
                            {`${joke.type.charAt(0).toUpperCase()}${joke.type.slice(1)}`}
                        </Typography>
                    </Box>
                    <Typography variant="subtitle2" component="div">
                        ID: {joke.id}
                    </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Setup:</Typography>
                <Box sx={{ mb: 1, height: '70px', overflow: 'hidden' }}>
                    <Typography variant="body1">
                        {joke.setup}
                    </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                    {joke.punchline}
                </Typography>
            </CardContent>
            <CardActions className="card-actions">
                <Button
                    size="small"
                    color="error"
                    onClick={handleDelete}
                >
                    Delete
                </Button>
                <Button
                    size="small"
                    color="primary"
                    onClick={handleAdd}
                >
                    Add
                </Button>
                <Button
                    size="small"
                    color="secondary"
                    onClick={() => void handleRefresh()}
                >
                    Refresh
                </Button>
            </CardActions>
        </Card>
    )
}