import { apiSlice } from './apiSlice';

export const holidaysApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHolidays: builder.query<string[], void>({
      query: () => '/public-holidays',
    }),
  }),
});

export const { useGetHolidaysQuery } = holidaysApi;
