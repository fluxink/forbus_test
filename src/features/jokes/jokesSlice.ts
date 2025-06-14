import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Joke, type JokesState } from './types';
import type { RootState } from '../../app/store';

// Утилиты для работы с localStorage
const loadJokesFromStorage = (): Joke[] => {
    try {
        const storedJokes = localStorage.getItem('userJokes');
        const parsedJokes = storedJokes ? JSON.parse(storedJokes) as Joke[] : [];
        return parsedJokes;
    } catch {
        return [];
    }
};

const saveJokesToStorage = (jokes: Joke[]) => {
    try {
        localStorage.setItem('userJokes', JSON.stringify(jokes));
    } catch {
        // Игнорируем ошибки localStorage
    }
};

// Set для отслеживания ID шуток, которые сейчас используются в активных заменах
const pendingReplacementIds = new Set<number>();

// Async thunk для замены шутки с проверкой уникальности
export const replaceJokeWithUnique = createAsyncThunk(
    'jokes/replaceJokeWithUnique',
    async (
        { oldId, apiCall }: { oldId: number; apiCall: () => Promise<{ data: Joke }> },
        { getState, dispatch, rejectWithValue }
    ) => {
        const maxAttempts = 5;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const result = await apiCall();
                const newJoke = result.data;

                // Получаем актуальное состояние
                const state = getState() as RootState;
                const allJokes = [...state.jokes.jokes, ...state.jokes.userJokes];

                // Проверяем, существует ли уже такая шутка или используется в другой активной замене
                const isDuplicate = allJokes.some(existingJoke => existingJoke.id === newJoke.id) ||
                    pendingReplacementIds.has(newJoke.id);

                if (!isDuplicate) {
                    // Резервируем ID новой шутки
                    pendingReplacementIds.add(newJoke.id);

                    try {
                        dispatch(replaceJoke({ oldId, newJoke }));
                        return { success: true, joke: newJoke };
                    } finally {
                        // Освобождаем ID после замены
                        pendingReplacementIds.delete(newJoke.id);
                    }
                }
            } catch (error) {

                // Проверяем статус ошибки для API ошибок
                if (error && typeof error === 'object' && 'status' in error && 'error' in error) {
                    const apiError = error as { status: string; error: string };

                    // Обработка FETCH_ERROR
                    if (apiError.status === 'FETCH_ERROR') {
                        return rejectWithValue('Network error. Please check your internet connection.');
                    }
                }

                // Для остальных ошибок продолжаем попытки
                continue;
            }
        }

        return rejectWithValue('Could not find a unique joke after multiple attempts');
    }
);

const initialState: JokesState = {
    jokes: [],
    userJokes: loadJokesFromStorage(),
    loading: false,
    error: null,
};

export const jokesSlice = createSlice({
    name: 'jokes',
    initialState,
    reducers: {
        setJokes: (state, action: PayloadAction<Joke[]>) => {
            state.jokes = action.payload;
        },
        addJokes: (state, action: PayloadAction<Joke[]>) => {
            // Добавляем новые шутки, исключая дубликаты по id
            const existingIds = new Set(state.jokes.map(joke => joke.id));
            const newJokes = action.payload.filter(joke => !existingIds.has(joke.id));
            state.jokes.push(...newJokes);
        },
        addUserJoke: (state, action: PayloadAction<Joke>) => {
            // Проверяем на дубликаты перед добавлением
            const existsInJokes = state.jokes.some(joke => joke.id === action.payload.id);
            const existsInUserJokes = state.userJokes.some(joke => joke.id === action.payload.id);

            if (!existsInJokes && !existsInUserJokes) {
                state.userJokes.push(action.payload);
                saveJokesToStorage(state.userJokes);
            }
        },
        removeJoke: (state, action: PayloadAction<number>) => {
            const jokeId = action.payload;

            // Удаляем из основного списка
            state.jokes = state.jokes.filter(joke => joke.id !== jokeId);

            // Удаляем из пользовательских шуток если есть
            const userJokeIndex = state.userJokes.findIndex(joke => joke.id === jokeId);
            if (userJokeIndex !== -1) {
                state.userJokes.splice(userJokeIndex, 1);
                saveJokesToStorage(state.userJokes);
            }
        },
        replaceJoke: (state, action: PayloadAction<{ oldId: number; newJoke: Joke }>) => {
            const { oldId, newJoke } = action.payload;
            const jokeIndex = state.jokes.findIndex(joke => joke.id === oldId);

            if (jokeIndex !== -1) {
                // Дополнительная проверка на уникальность перед заменой
                const isDuplicate = state.jokes.some((joke, index) =>
                    joke.id === newJoke.id && index !== jokeIndex
                ) || state.userJokes.some(joke => joke.id === newJoke.id);

                if (!isDuplicate) {
                    state.jokes[jokeIndex] = newJoke;
                } else {
                    console.warn(`Попытка замены на дубликат: ${newJoke.id.toString()}`);
                }
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setJokes,
    addJokes,
    addUserJoke,
    removeJoke,
    replaceJoke,
    setLoading,
    setError,
} = jokesSlice.actions;
