import React from 'react';

export interface Column<T = string | number | boolean | Date | null | undefined | object> {
  key: keyof T;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface TableProps<T = string | number | boolean | Date | null | undefined | object> {
  data: T[] | undefined;
  columns: Column<T>[];
  keyField: keyof T;
  className?: string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}
