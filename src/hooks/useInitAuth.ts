'use client';

import { useGetCurrentUserQuery } from '@/lib/api/authApi';

export const useInitAuth = () => {
  const { data: user, isLoading, error } = useGetCurrentUserQuery();

  return { user, isLoading, error };
};
