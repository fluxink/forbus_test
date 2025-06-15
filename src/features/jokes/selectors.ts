import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

export const selectJokes = (state: RootState) => state.jokes.jokes;
export const selectUserJokes = (state: RootState) => state.jokes.userJokes;
export const selectError = (state: RootState) => state.jokes.error;
export const selectLoading = (state: RootState) => state.jokes.loading;

// Create individual selectors for each joke ID to minimize re-renders
export const createSelectIsJokeSaved = (jokeId: number) =>
    createSelector(
        [selectUserJokes],
        (userJokes) => userJokes.some(joke => joke.id === jokeId)
    );