'use client';

import { useRouter } from 'next/navigation';

import { Calendar, Menu, Settings, User } from 'lucide-react';

import { UserCard } from '@/components/layout/UserCard';
import { User as UserType } from '@/types/auth';
import { DropdownButton, DropdownItem } from '@/ui/DropdownButton';

interface HeaderProps {
  user: UserType;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const menuItems: DropdownItem[] = [
    {
      id: 'vacations',
      label: 'Отпуска',
      icon: <Calendar size={16} />,
      onClick: () => router.push('/'),
    },
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
    <div className="flex items-center justify-between mb-4 gap-2">
      <div>
        <DropdownButton label={<Menu size={20} />} items={menuItems} />
      </div>
      <div className="flex justify-end">
        <UserCard user={user} />
      </div>
    </div>
  );
}
