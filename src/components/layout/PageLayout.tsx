import { ReactNode } from 'react';

import { User } from '@/types/auth';

import { Header } from './Header';

interface PageLayoutProps {
  user: User;
  children: ReactNode;
  isLoading?: boolean;
  error?: any;
}

export function PageLayout({ user, children, isLoading, error }: PageLayoutProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-3">
        <div className="text-xl text-gray-300 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-3">
      <Header user={user} />
      {children}
    </div>
  );
}
