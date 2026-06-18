import { AlertTriangle, CheckCircle2, TriangleAlert } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency, formatPercent } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { BudgetStatus } from '@/hooks/useBudgets';

interface BudgetProgressCardProps {
  status: BudgetStatus;
  currency: string;
}

export function BudgetProgressCard({ status, currency }: BudgetProgressCardProps) {
  const { amount, spent, remaining, usage, isOver, isNearLimit } = status;

  const alert = isOver
    ? {
        icon: AlertTriangle,
        text: `You're ${formatCurrency(-remaining, currency)} over budget this month.`,
        cls: 'bg-expense/10 text-expense',
      }
    : isNearLimit
      ? {
          icon: TriangleAlert,
          text: `Heads up — you've used ${formatPercent(usage)} of your budget.`,
          cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        }
      : {
          icon: CheckCircle2,
          text: `${formatCurrency(remaining, currency)} left to spend this month.`,
          cls: 'bg-income/10 text-income',
        };

  const Icon = alert.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-content-muted">Spent</p>
          <p className="text-2xl font-bold tabular-nums text-content">
            {formatCurrency(spent, currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-content-muted">Budget</p>
          <p className="text-lg font-semibold tabular-nums text-content-muted">
            {formatCurrency(amount, currency)}
          </p>
        </div>
      </div>

      <ProgressBar value={usage} />

      <div className={cn('flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium', alert.cls)}>
        <Icon className="h-4.5 w-4.5 shrink-0" />
        <span>{alert.text}</span>
      </div>
    </div>
  );
}
