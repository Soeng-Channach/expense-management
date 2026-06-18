import { cn } from '@/lib/cn';

interface ProgressBarProps {
  /** 0–100+; values above 100 are clamped for the bar width. */
  value: number;
  className?: string;
  /** Override the auto color (which goes green → amber → red as usage rises). */
  tone?: 'brand' | 'income' | 'expense' | 'auto';
}

export function ProgressBar({ value, className, tone = 'auto' }: ProgressBarProps) {
  const width = Math.min(Math.max(value, 0), 100);

  const autoColor =
    value >= 100
      ? 'bg-expense'
      : value >= 80
        ? 'bg-amber-500'
        : 'bg-income';

  const color =
    tone === 'auto'
      ? autoColor
      : tone === 'income'
        ? 'bg-income'
        : tone === 'expense'
          ? 'bg-expense'
          : 'bg-brand-500';

  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-surface-muted', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', color)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
