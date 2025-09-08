'use client';

import { ReactNode } from 'react';
import { useGetCurrentUserQuery } from '@/lib/api/authApi';
import AuthLoader from '@/components/ui/AuthLoader';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface AuthGuardProps {
  children: ReactNode;
  requiredGroups?: string[];
}

export default function AuthGuard({ children, requiredGroups }: AuthGuardProps) {
  const { data: user, isLoading, error } = useGetCurrentUserQuery();

  if (isLoading) return <AuthLoader />;

  if (error) {
    return (
      <ErrorMessage
        title="Ошибка загрузки"
        message="Произошла ошибка при проверке авторизации"
        action={{
          label: 'Попробовать снова',
          onClick: () => window.location.reload(),
          variant: 'danger',
        }}
      />
    );
  }

  if (!user) {
    return (
      <ErrorMessage
        title="Доступ запрещен"
        message="Для просмотра этой страницы необходимо авторизоваться"
        action={{
          label: 'Перейти к входу',
          onClick: () => (window.location.href = '/login'),
          variant: 'primary',
        }}
      />
    );
  }

  if (requiredGroups && !requiredGroups.some((g) => user.groups.includes(g))) {
    return (
      <ErrorMessage
        title="Недостаточно прав"
        message="Ваша учетная запись не имеет необходимых прав для доступа к этой странице"
        action={{
          label: 'На главную',
          onClick: () => (window.location.href = '/'),
          variant: 'secondary',
        }}
      >
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-500">Требуемые группы:</p>
          <div className="flex flex-wrap gap-1 justify-center mt-1">
            {requiredGroups.map((group) => (
              <span
                key={group}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {group}
              </span>
            ))}
          </div>
        </div>
      </ErrorMessage>
    );
  }

  return <>{children}</>;
}
