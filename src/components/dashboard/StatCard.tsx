import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tone = 'brand' | 'income' | 'expense' | 'neutral';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
  subtitle?: string;
}

const toneMap: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  income: 'bg-income/10 text-income',
  expense: 'bg-expense/10 text-expense',
  neutral: 'bg-surface-muted text-content-muted',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  subtitle,
}: StatCardProps) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-content-muted">{label}</span>
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl',
            toneMap[tone]
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-content tabular-nums">
        {value}
      </p>
      {subtitle && <p className="mt-1 text-xs text-content-muted">{subtitle}</p>}
    </div>
  );
}
