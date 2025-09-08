import { apiSlice } from './apiSlice';
import { User } from '@/types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth',
    }),
  }),
});

export const { useGetCurrentUserQuery } = authApi;
