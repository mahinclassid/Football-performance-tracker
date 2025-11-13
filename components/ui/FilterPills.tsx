'use client';

import { cn } from '@/lib/utils';
import { themeClasses } from '@/lib/theme-classes';

interface FilterPill {
  value: string;
  label: string;
}

interface FilterPillsProps {
  filters: FilterPill[];
  activeFilter: string | null;
  onFilterChange: (value: string | null) => void;
  className?: string;
}

export function FilterPills({ filters, activeFilter, onFilterChange, className }: FilterPillsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => onFilterChange(null)}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          activeFilter === null
            ? 'bg-club-primary text-white'
            : `bg-gray-100 ${themeClasses.text.primary} hover:bg-gray-200`
        )}
      >
        All
      </button>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            activeFilter === filter.value
              ? 'bg-club-primary text-white'
              : `bg-gray-100 ${themeClasses.text.primary} hover:bg-gray-200`
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

