import { cn } from '@/lib/utils';
import { themeClasses } from '@/lib/theme-classes';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, trend, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        `${themeClasses.card.container} p-6 hover:border-club-primary transition-colors`,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${themeClasses.text.primary}`}>{title}</p>
          <p className={`mt-2 text-3xl font-bold ${themeClasses.text.primary}`}>{value}</p>
          {trend && (
            <p className={`mt-2 text-sm ${themeClasses.text.primary}`}>
              <span className={trend.value >= 0 ? 'text-lime-600' : 'text-rose-600'}>
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>{' '}
              {trend.label}
            </p>
          )}
        </div>
        {icon && <div className="ml-4 text-club-primary">{icon}</div>}
      </div>
    </div>
  );
}

