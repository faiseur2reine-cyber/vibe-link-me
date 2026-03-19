import { cn } from '@/lib/utils';

export type Period = '7d' | '30d' | '90d' | 'all';

const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7j' },
  { value: '30d', label: '30j' },
  { value: '90d', label: '90j' },
  { value: 'all', label: 'Tout' },
];

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
  className?: string;
}

export const PeriodSelector = ({ value, onChange, className }: PeriodSelectorProps) => (
  <div className={cn('inline-flex items-center rounded-xl bg-muted/50 border border-border p-0.5', className)}>
    {PERIODS.map(p => (
      <button
        key={p.value}
        onClick={() => onChange(p.value)}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200',
          value === p.value
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {p.label}
      </button>
    ))}
  </div>
);
