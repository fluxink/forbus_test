import { useMemo } from 'react';
import { useAppSelector } from '../../app/hooks';
import { createSelectIsJokeSaved } from './selectors';

export const useIsJokeSaved = (jokeId: number) => {
    // Create a memoized selector for this specific joke ID
    const selectIsJokeSaved = useMemo(() => createSelectIsJokeSaved(jokeId), [jokeId]);
    
    return useAppSelector(selectIsJokeSaved);
};