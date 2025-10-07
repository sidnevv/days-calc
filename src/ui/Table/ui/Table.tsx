import React from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { Column, TableProps, useSort } from '@/ui/Table';

function Table<T = string | number | boolean | Date | null | undefined | object>({
  data,
  columns,
  keyField,
  className = '',
  onRowClick,
  loading = false,
  emptyMessage = 'Нет данных для отображения',
}: TableProps<T>) {
  const { sortedData, sortConfig, requestSort } = useSort<T>(data);

  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable && data) {
      // Проверяем наличие данных
      requestSort(key);
    }
  };

  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }

    const value = item[column.key];
    return value !== null && value !== undefined ? String(value) : '-';
  };

  if (loading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto bg-gray-900 rounded-xl shadow-lg border border-gray-700 ${className}`}>
      <table className="min-w-full border-collapse text-gray-200">
        <thead>
          <tr className="bg-gray-800">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={`
                  sticky left-0 z-20 px-3 py-3 text-left text-xs font-semibold text-gray-300 uppercase border-r border-gray-700 bg-gray-800
                  ${column.sortable && data ? 'cursor-pointer hover:bg-gray-700' : ''}
                  ${column.className || ''}
                `}
                onClick={() => handleSort(String(column.key), column.sortable)}>
                <div className="flex items-center">
                  {column.header}
                  {column.sortable && sortConfig?.key === String(column.key) && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr className="hover:bg-gray-800 transition-colors duration-150  ">
              <td
                colSpan={columns.length}
                className="sticky left-0 z-10 px-3 py-3 whitespace-nowrap text-xs uppercase font-normal text-gray-100 bg-gray-900 border-r border-gray-700">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item) => (
              <tr
                key={String((item as any)[keyField])}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-700' : ''}
                  transition-colors duration-150 border border-gray-700
                `}
                onClick={() => onRowClick?.(item)}>
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`
                      px-3 py-3 text-sm font-normal border-r border-gray-700
                      ${column.className || ''}
                    `}>
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
