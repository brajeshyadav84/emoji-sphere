import { apiSlice } from "./apiSlice";

export const askMeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    askQuestion: builder.mutation({
      query: (body: { question: string; images?: string }) => ({
        url: '/ask-me',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useAskQuestionMutation } = askMeApi;