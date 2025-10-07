'use client';

import { useRouter } from 'next/navigation';

import { Menu, Settings, User } from 'lucide-react';

import { ErrorHandler } from '@/components/common/ErrorHandler';
import { Header } from '@/components/layout/Header';
import { PageLayout } from '@/components/layout/PageLayout';
import { UserCard } from '@/components/layout/UserCard';
import VacationsTable from '@/components/vacations/VacationsTable';
import { useGetCurrentUserQuery } from '@/lib/api/authApi';
import { useGetVacationEmployeesQuery } from '@/lib/api/vacationsApi';
import { calculateVacationDaysSimple } from '@/lib/utils/calculations';
import { VacationEmployee } from '@/types/vacation';
import { DropdownButton, DropdownItem } from '@/ui/DropdownButton';

export default function Home() {
  const { data, error, isLoading } = useGetVacationEmployeesQuery();
  const { data: user } = useGetCurrentUserQuery();
  const router = useRouter();

  const vacations = data?.map((emp: VacationEmployee) => ({
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
    <PageLayout user={user!} isLoading={isLoading} error={error}>
      {vacations && vacations.length > 0 ? (
        <VacationsTable vacations={vacations} currentUserId={user!.id} />
      ) : (
        !error && (
          <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-center">
            <p className="text-gray-600">Нет данных о сотрудниках</p>
          </div>
        )
      )}
    </PageLayout>
  );

  // return (
  //   <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-3">
  //     <ErrorHandler error={error} />
  //     <Header user={user!} />
  //
  //     {vacations && vacations.length > 0 ? (
  //       <VacationsTable vacations={vacations} currentUserId={user!.id} />
  //     ) : (
  //       !error && (
  //         <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-center">
  //           <p className="text-gray-600">Нет данных о сотрудниках</p>
  //         </div>
  //       )
  //     )}
  //   </div>
  // );
}
