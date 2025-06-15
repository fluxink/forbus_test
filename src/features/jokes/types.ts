export type Joke = {
    type: string;
    setup: string;
    punchline: string;
    id: number;
};

export type JokesState = {
    jokes: Joke[];
    userJokes: Joke[];
    loading: boolean;
    error: string | null;
};