import { useCallback, useEffect } from 'react';
import { Box, Button, Container, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import { JokeCard } from './JokeCard';
import { useGetTenJokesQuery, useLazyGetTenJokesQuery } from './jokesApiSlice';
import { setJokes, addJokes, setError } from './jokesSlice';
import { type RootState } from '../../app/store';
import { type Joke } from './types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

export const Jokes = () => {
    const dispatch = useAppDispatch();
    const { jokes, userJokes, error } = useAppSelector((state: RootState) => state.jokes);

    // Получаем первые 10 шуток при загрузке
    const { data: initialJokes, isLoading, error: apiError } = useGetTenJokesQuery(undefined);
    const [loadMoreJokes, { isLoading: isLoadingMore }] = useLazyGetTenJokesQuery();

    // Инициализация при загрузке компонента
    useEffect(() => {
        if (initialJokes && jokes.length === 0) {
            // Объединяем пользовательские шутки с полученными из API
            const combinedJokes = [...userJokes];
            const remainingSlots = Math.max(0, 10 - userJokes.length);

            if (remainingSlots > 0) {
                const apiJokesToAdd = initialJokes.slice(0, remainingSlots);
                combinedJokes.push(...apiJokesToAdd);
            }

            dispatch(setJokes(combinedJokes));
        }
    }, [initialJokes, jokes.length, userJokes, dispatch]);

    // Обработка ошибок
    useEffect(() => {
        if (apiError) {
            dispatch(setError('Ошибка при загрузке шуток'));
        }
    }, [apiError, dispatch]);

    const handleLoadMore = useCallback(async () => {
        try {
            dispatch(setError(null));

            const existingIds = new Set(jokes.map(joke => joke.id));
            const newUniqueJokes: Joke[] = [];
            let attempts = 0;
            const maxAttempts = 5; // Ограничиваем количество попыток

            // Продолжаем делать запросы пока не получим достаточно уникальных шуток
            while (newUniqueJokes.length < 10 && attempts < maxAttempts) {
                attempts++;
                
                const result = await loadMoreJokes(undefined).unwrap();
                
                // Фильтруем дубликаты из текущего запроса
                const uniqueFromCurrentRequest = result.filter(
                    (joke: Joke) => !existingIds.has(joke.id) && 
                    !newUniqueJokes.some(newJoke => newJoke.id === joke.id)
                );

                // Добавляем уникальные шутки
                newUniqueJokes.push(...uniqueFromCurrentRequest);
                
                // Обновляем set существующих ID для следующих итераций
                uniqueFromCurrentRequest.forEach(joke => existingIds.add(joke.id));

                console.log(
                    `Попытка ${attempts.toString()}: получено ${result.length.toString()} шуток, ` +
                    `из них уникальных: ${uniqueFromCurrentRequest.length.toString()}, ` +
                    `всего уникальных: ${newUniqueJokes.length.toString()}`
                );
            }

            if (newUniqueJokes.length > 0) {
                dispatch(addJokes(newUniqueJokes));
            } else {
                dispatch(setError('Не удалось загрузить новые уникальные шутки'));
            }

        } catch (error) {
            dispatch(setError('Ошибка при загрузке дополнительных шуток'));
            console.error('Ошибка загрузки:', error);
        }
    }, [dispatch, jokes, loadMoreJokes]);

    if (isLoading && jokes.length === 0) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box py={4}>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    Коллекция шуток
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {jokes.map((joke) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={joke.id}>
                            <JokeCard joke={joke} />
                        </Grid>
                    ))}
                </Grid>

                <Box display="flex" justifyContent="center" mt={4}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => void handleLoadMore()}
                        disabled={isLoadingMore}
                    >
                        {isLoadingMore ? <CircularProgress size={24} /> : 'Загрузить еще'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};