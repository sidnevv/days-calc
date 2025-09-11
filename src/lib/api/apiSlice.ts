import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    prepareHeaders: (headers) => {
      headers.append('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Employees', 'User', 'Holidays', 'Vacations', 'VacationTypes'],
  endpoints: () => ({}),
});
