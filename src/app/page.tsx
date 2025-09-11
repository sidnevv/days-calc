'use client';

import { ErrorHandler } from '@/components/common/ErrorHandler';
import ThemeToggle from '@/components/common/ThemeToggle';
import { UserCard } from '@/components/layout/UserCard';
import { useGetCurrentUserQuery } from '@/lib/api/authApi';
import { useGetEmployeesQuery } from '@/lib/api/employeeApi';
import { calculateVacationDaysSimple } from '@/lib/utils/calculations';
import { Employee } from '@/types';

import EmployeeTable from '../components/employees/EmployeeTable';

export default function Home() {
  const { data, error, isLoading, refetch } = useGetEmployeesQuery();
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
        <EmployeeTable employees={employees} currentUserId={user!.id} />
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
