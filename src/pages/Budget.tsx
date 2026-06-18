import { useEffect, useMemo, useState } from 'react';
import { addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Wallet, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BudgetProgressCard } from '@/components/budget/BudgetProgressCard';
import { CategoryBreakdownList } from '@/components/CategoryBreakdownList';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBudget, useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/context/ToastContext';
import { categoryBreakdown } from '@/lib/analytics';
import { currentMonthKey, monthKey, formatMonthLabel } from '@/lib/date';
import { currencySymbol } from '@/lib/format';
import { format } from 'date-fns';

export function Budget() {
  const [month, setMonth] = useState(currentMonthKey());
  const status = useBudget(month);
  const { budgets, setBudget, deleteBudget } = useBudgets();
  const { all } = useTransactions();
  const { lookup } = useCategories();
  const { settings } = useSettings();
  const { toast } = useToast();
  const currency = settings.currency;

  const monthBudget = useMemo(
    () => budgets.find((b) => b.month === month),
    [budgets, month]
  );
  const [amount, setAmount] = useState('');

  // Keep the input in sync with the selected month's saved budget.
  useEffect(() => {
    setAmount(monthBudget ? String(monthBudget.amount) : '');
  }, [monthBudget, month]);

  const breakdown = useMemo(
    () =>
      categoryBreakdown(
        all.filter((t) => monthKey(t.date) === month),
        'expense',
        lookup
      ),
    [all, month, lookup]
  );

  const shift = (delta: number) => {
    const next = delta > 0 ? addMonths(parseISO(`${month}-01`), 1) : subMonths(parseISO(`${month}-01`), 1);
    setMonth(format(next, 'yyyy-MM'));
  };

  const save = async () => {
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value < 0) {
      toast('Enter a valid budget amount', 'error');
      return;
    }
    await setBudget(month, value);
    toast('Budget saved', 'success');
  };

  const remove = async () => {
    if (monthBudget?.id == null) return;
    await deleteBudget(monthBudget.id);
    toast('Budget removed', 'success');
  };

  const isCurrent = month === currentMonthKey();

  return (
    <div className="space-y-4">
      {/* Month navigator */}
      <Card className="flex items-center justify-between" padded>
        <button
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="rounded-lg p-2 text-content-muted transition hover:bg-surface-muted hover:text-content"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-base font-semibold text-content">
            {formatMonthLabel(month)}
          </p>
          {isCurrent && <p className="text-xs text-content-muted">Current month</p>}
        </div>
        <button
          onClick={() => shift(1)}
          aria-label="Next month"
          className="rounded-lg p-2 text-content-muted transition hover:bg-surface-muted hover:text-content"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </Card>

      {/* Set budget */}
      <Card>
        <CardHeader title="Set Monthly Budget" subtitle="Your spending limit for this month" />
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              type="number"
              step="0.01"
              inputMode="decimal"
              prefix={currencySymbol(currency)}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button onClick={save}>Save</Button>
          {monthBudget && (
            <Button variant="ghost" size="icon" onClick={remove} aria-label="Remove budget">
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader title="Budget Usage" />
        {status.amount > 0 ? (
          <BudgetProgressCard status={status} currency={currency} />
        ) : (
          <EmptyState
            icon={Wallet}
            title="No budget set"
            description="Set a monthly budget above to track your spending against it."
            compact
          />
        )}
      </Card>

      {/* Spending breakdown */}
      {breakdown.length > 0 && (
        <Card>
          <CardHeader title="Where it went" subtitle="Expenses by category this month" />
          <CategoryBreakdownList data={breakdown} currency={currency} />
        </Card>
      )}
    </div>
  );
}
