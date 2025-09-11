'use client';

import { useRouter } from 'next/navigation';

import { Menu, Settings, User } from 'lucide-react';

import { ErrorHandler } from '@/components/common/ErrorHandler';
import { UserCard } from '@/components/layout/UserCard';
import { useGetCurrentUserQuery } from '@/lib/api/authApi';
import { useGetEmployeesQuery } from '@/lib/api/employeeApi';
import { calculateVacationDaysSimple } from '@/lib/utils/calculations';
import { Employee } from '@/types';
import { DropdownButton, DropdownItem } from '@/ui/DropdownButton';

import EmployeeTable from '../components/employees/EmployeeTable';

export default function Home() {
  const { data, error, isLoading } = useGetEmployeesQuery();
  const { data: user } = useGetCurrentUserQuery();
  const router = useRouter();

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

  const menuItems: DropdownItem[] = [
    {
      id: 'profile',
      label: 'Сотрудники',
      icon: <User size={16} />,
      onClick: () => router.push('/employees'),
    },
    { id: 'divider-1', divider: true },
    {
      id: 'settings',
      label: 'Настройки',
      icon: <Settings size={16} />,
      onClick: () => console.log('Настройки'),
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-3">
      <ErrorHandler error={error} />
      <div className="flex item-center justify-between mb-4 gap-2">
        <div>
          <DropdownButton label={<Menu size={20} />} items={menuItems} />
        </div>
        <div className="flex justify-end">
          <UserCard user={user!} />
        </div>
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
