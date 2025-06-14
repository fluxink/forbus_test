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

// Async thunk для замены шутки с проверкой уникальности
export const replaceJokeWithUnique = createAsyncThunk(
    'jokes/replaceJokeWithUnique',
    async (
        { oldId, apiCall }: { oldId: number; apiCall: () => Promise<{ data: Joke }> },
        { getState, dispatch, rejectWithValue }
    ) => {
        const state = getState() as RootState;
        const allJokes = [...state.jokes.jokes, ...state.jokes.userJokes];
        const maxAttempts = 5;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const result = await apiCall();
                const newJoke = result.data;

                // Проверяем, существует ли уже такая шутка
                const isDuplicate = allJokes.some(existingJoke => existingJoke.id === newJoke.id);

                if (!isDuplicate) {
                    dispatch(replaceJoke({ oldId, newJoke }));
                    return { success: true, joke: newJoke };
                }
            } catch {
                return rejectWithValue('Error fetching new joke');
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
            state.userJokes.push(action.payload);
            saveJokesToStorage(state.userJokes);
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
                state.jokes[jokeIndex] = newJoke;
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
