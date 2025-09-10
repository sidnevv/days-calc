import { User } from '@/types';

import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth',
    }),
  }),
});

export const { useGetCurrentUserQuery } = authApi;
