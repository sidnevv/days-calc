import { SaveVacationRangesRequest } from '@/types';

import { apiSlice } from './apiSlice';

export const vacationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    SaveVacationRanges: builder.mutation<{ success: boolean }, SaveVacationRangesRequest>({
      query: ({ id, year, ranges }) => ({
        url: `/vacations/save`,
        method: 'POST',
        body: { id, year, ranges, status: 'draft' },
      }),
    }),
  }),
});

export const { useSaveVacationRangesMutation } = vacationsApi;
