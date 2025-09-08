'use client';

import EmployeeTable from '../components/EmployeeTable';
import ThemeToggle from '@/components/ThemeToggle';
import { UserCard } from '@/components/UserCard';
import { useGetEmployeesQuery } from '@/lib/api/employeeApi';
import { calculateVacationDaysSimple } from '@/lib/calculations';
import { ErrorHandler } from '@/components/ui/ErrorHandler';
import { Employee } from '@/types';
import { useGetCurrentUserQuery } from '@/lib/api/authApi';

export default function Home() {
  const { data, error, isLoading } = useGetEmployeesQuery();
  const { data: user } = useGetCurrentUserQuery();

  const employees = data?.map((emp: Employee) => ({
    ...emp,
    vacation: calculateVacationDaysSimple(emp),
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-300 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-3">
      <ErrorHandler error={error} />
      <div className="flex justify-end mb-4  gap-2">
        <ThemeToggle />
        <UserCard user={user!} />
      </div>

      {employees && employees.length > 0 ? (
        <EmployeeTable employees={employees} />
      ) : (
        !error && (
          <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-center">
            <p className="text-gray-600">Нет данных о сотрудниках</p>
          </div>
        )
      )}
    </div>
  );
}
