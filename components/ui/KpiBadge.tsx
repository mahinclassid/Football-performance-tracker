import { cn } from '@/lib/utils';

interface KpiBadgeProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function KpiBadge({ label, value, variant = 'default', className }: KpiBadgeProps) {
  const variantStyles = {
    default: 'bg-club-primary text-white',
    success: 'bg-lime-500 text-white',
    warning: 'bg-amber-500 text-white',
    danger: 'bg-rose-500 text-white',
  };

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center px-4 py-2 rounded-lg',
        variantStyles[variant],
        className
      )}
    >
      <span className="text-xs font-medium opacity-90">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}




