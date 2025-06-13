import { Button, Card, CardActions, CardContent, Typography } from "@mui/material"
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
        // Генерируем новый ID для пользовательской шутки
        const userJoke: Joke = {
            ...joke,
            id: Date.now() + Math.random() // Простой способ генерации уникального ID
        };
        dispatch(addUserJoke(userJoke));
    };

    const handleDelete = () => {
        dispatch(removeJoke(joke.id));
    };

    const handleRefresh = async () => {
        try {
            // Сначала удаляем текущую шутку
            dispatch(removeJoke(joke.id));

            // Затем получаем новую случайную шутку
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
        <Card>
            <CardContent>
                <Typography variant="h5" >
                    {joke.type}
                </Typography>
                <Typography variant="body1" >
                    {joke.setup}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {joke.punchline}
                </Typography>
            </CardContent>
            <CardActions>
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
                    onClick={void handleRefresh}
                >
                    Refresh
                </Button>
            </CardActions>
        </Card>
    )
}