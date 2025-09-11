'use client';

import { useGetAllEmployeesQuery } from '@/lib/api/employeeApi';

export default function Employees() {
  const { data, isLoading, error } = useGetAllEmployeesQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-300 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-300 animate-pulse">Error...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-3">
      {data?.map((employee) => {
        return (
          <div key={employee.id}>
            {employee.name} | {employee.position} |{' '}
            {new Date(employee.hireDate).toLocaleDateString()}
          </div>
        );
      })}
    </div>
  );
}
