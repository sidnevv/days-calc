import { apiSlice } from './apiSlice';
import { Employee } from '@/types';

export const employeeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], void>({
      query: () => '/employees',
    }),
    getEmployee: builder.query<Employee, number>({
      query: (id) => `/employee/${id}`,
    }),
    addEmployee: builder.mutation<Employee, Omit<Employee, 'id'>>({
      query: (employee) => ({
        url: '/employee',
        method: 'POST',
        body: employee,
      }),
    }),
    updateEmployee: builder.mutation<Employee, { id: number; data: Partial<Employee> }>({
      query: ({ id, data }) => ({
        url: `/employee/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    deleteEmployee: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/employee/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
