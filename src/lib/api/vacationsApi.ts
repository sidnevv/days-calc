import { SaveVacationRangesRequest } from '@/types';

import { apiSlice } from './apiSlice';

export const vacationsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    SaveVacationRanges: builder.mutation<{ success: boolean }, SaveVacationRangesRequest>({
      query: ({ id, year, ranges }) => ({
        url: `/vacations/save`,
        method: 'POST',
        body: { id, year, ranges, status: 'draft' },
      }),
    }),
    DeleteVacationRanges: builder.mutation<
      { success: boolean },
      {
        employeeId: number;
        ranges: {
          startDate: string;
          endDate: string;
        }[];
        year: number;
      }
    >({
      query: ({ employeeId, ranges, year }) => ({
        url: `/vacations/delete`,
        method: 'POST',
        body: { employeeId, ranges, year },
      }),
    }),
  }),
});

export const { useSaveVacationRangesMutation, useDeleteVacationRangesMutation } = vacationsApi;
