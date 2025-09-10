'use client';

import React from 'react';

import { User } from '@/types';

export type UserCardProps = {
  user: User;
  className?: string;
};

function clsx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export function UserCard({ user, className }: UserCardProps) {
  const initials = user?.displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-2 py-1.5 rounded-xl shadow-md border border-gray-700 bg-gray-800 hover:bg-gray-800/80 transition-all duration-300 hover:shadow-sm text-center text-gray-200 text-sm',
        className,
      )}>
      <div
        aria-hidden="true"
        className={clsx(
          'flex items-center justify-center w-8 h-8 rounded-lg font-medium select-none text-sm',
          'bg-neutral-200 text-neutral-800 dark:bg-gray-500 dark:text-neutral-100',
        )}
        title={initials}>
        {initials}
      </div>

      <div className="leading-tight min-w-0 text-left">
        <div className="font-normal text-neutral-100 truncate uppercase text-xs">
          {user.displayName.replace(/(.) (.).+ (.).+/, '$1 $2. $3.')}
        </div>
        <div className="font-thin text-[10px] text-neutral-400 truncate">
          {user?.samaccountname}
        </div>
      </div>
    </div>
  );
}
