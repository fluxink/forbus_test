import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { type Joke } from "./types"

export const jokesApiSlice = createApi({
    reducerPath: 'jokesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://official-joke-api.appspot.com'
    }),
    endpoints: (build) => ({
        getRandomJoke: build.query<Joke, undefined>({
            query: () => '/jokes/random'
        }),
        getTenJokes: build.query<Joke[], undefined>({
            query: () => '/jokes/ten'
        })
    })
});

export const { 
    useGetRandomJokeQuery, 
    useGetTenJokesQuery,
    useLazyGetRandomJokeQuery,
    useLazyGetTenJokesQuery
} = jokesApiSlice;
