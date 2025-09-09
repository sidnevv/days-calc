'use client';

import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/lib/store/store';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo(() => makeStore(), []);

  return <Provider store={store}>{children}</Provider>;
}
