'use client';

import { cn } from '@/lib/utils';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { themeClasses } from '@/lib/theme-classes';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  rowActions?: (item: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  onSort,
  sortKey,
  sortDirection,
  rowActions,
  className,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    if (sortKey === key) {
      onSort(key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={cn(
                  `px-6 py-3 text-left ${themeClasses.table.header}`,
                  column.sortable && 'cursor-pointer hover:bg-gray-100 select-none'
                )}
                onClick={() => column.sortable && handleSort(String(column.key))}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <span className="flex flex-col">
                      {sortKey === column.key && sortDirection === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4 text-club-primary" />
                      ) : (
                        <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                      )}
                      {sortKey === column.key && sortDirection === 'desc' ? (
                        <ChevronDownIcon className="h-4 w-4 text-club-primary -mt-1" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 text-gray-400 -mt-1" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {rowActions && <th scope="col" className={`px-6 py-3 text-right ${themeClasses.table.header}`}>Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (rowActions ? 1 : 0)} className={`px-6 py-4 text-center ${themeClasses.table.empty}`}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={String(column.key)} className={`px-6 py-4 whitespace-nowrap ${themeClasses.table.cell}`}>
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] ?? '')}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {rowActions(item)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

