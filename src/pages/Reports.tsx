import { useState } from 'react';
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  PieChart,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/StatCard';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { CategoryBreakdownList } from '@/components/CategoryBreakdownList';
import { EmptyState } from '@/components/ui/EmptyState';
import { useReport } from '@/hooks/useReport';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency, formatPercent } from '@/lib/format';
import type { ReportPeriod } from '@/types';

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

function shiftAnchor(period: ReportPeriod, anchor: Date, dir: 1 | -1): Date {
  const fns = {
    daily: dir > 0 ? addDays : subDays,
    weekly: dir > 0 ? addWeeks : subWeeks,
    monthly: dir > 0 ? addMonths : subMonths,
    yearly: dir > 0 ? addYears : subYears,
  };
  return fns[period](anchor, 1);
}

export function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [anchor, setAnchor] = useState(new Date());
  const report = useReport(period, anchor);
  const { settings } = useSettings();
  const currency = settings.currency;

  const { summary } = report;
  const max = Math.max(summary.income, summary.expense, 1);

  return (
    <div className="space-y-4">
      <SegmentedControl<ReportPeriod>
        value={period}
        onChange={setPeriod}
        options={PERIODS}
      />

      {/* Period navigator */}
      <Card className="flex items-center justify-between" padded>
        <button
          onClick={() => setAnchor((a) => shiftAnchor(period, a, -1))}
          aria-label="Previous period"
          className="rounded-lg p-2 text-content-muted transition hover:bg-surface-muted hover:text-content"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-center text-sm font-semibold text-content sm:text-base">
          {report.range.label}
        </p>
        <button
          onClick={() => setAnchor((a) => shiftAnchor(period, a, 1))}
          aria-label="Next period"
          className="rounded-lg p-2 text-content-muted transition hover:bg-surface-muted hover:text-content"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </Card>

      {report.count === 0 ? (
        <Card>
          <EmptyState
            icon={PieChart}
            title="Nothing to report"
            description="There are no transactions in this period."
          />
        </Card>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              label="Income"
              value={formatCurrency(summary.income, currency)}
              icon={TrendingUp}
              tone="income"
            />
            <StatCard
              label="Expenses"
              value={formatCurrency(summary.expense, currency)}
              icon={TrendingDown}
              tone="expense"
            />
            <StatCard
              label="Net Savings"
              value={formatCurrency(summary.balance, currency)}
              icon={PiggyBank}
              tone={summary.balance >= 0 ? 'income' : 'expense'}
            />
            <StatCard
              label="Savings Rate"
              value={formatPercent(summary.savingsRate)}
              icon={Percent}
              tone="brand"
            />
          </div>

          {/* Income vs Expense analysis */}
          <Card>
            <CardHeader title="Income vs Expense" />
            <div className="space-y-4">
              {[
                { label: 'Income', value: summary.income, cls: 'bg-income' },
                { label: 'Expense', value: summary.expense, cls: 'bg-expense' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium text-content">{row.label}</span>
                    <span className="tabular-nums text-content-muted">
                      {formatCurrency(row.value, currency)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full ${row.cls} transition-all duration-500`}
                      style={{ width: `${(row.value / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Savings analysis */}
            <div className="mt-5 rounded-xl bg-surface-muted p-4 text-sm leading-relaxed text-content-muted">
              {summary.balance >= 0 ? (
                <>
                  You saved{' '}
                  <span className="font-semibold text-income">
                    {formatCurrency(summary.balance, currency)}
                  </span>{' '}
                  this period — that's {formatPercent(summary.savingsRate)} of your
                  income. Keep it up!
                </>
              ) : (
                <>
                  You spent{' '}
                  <span className="font-semibold text-expense">
                    {formatCurrency(-summary.balance, currency)}
                  </span>{' '}
                  more than you earned this period. Consider trimming top expense
                  categories below.
                </>
              )}
            </div>
          </Card>

          {/* Category breakdowns */}
          {report.expenseByCategory.length > 0 && (
            <Card>
              <CardHeader title="Expense Breakdown" />
              <div className="grid gap-5 lg:grid-cols-2 lg:items-center">
                <CategoryPieChart data={report.expenseByCategory} currency={currency} />
                <CategoryBreakdownList
                  data={report.expenseByCategory}
                  currency={currency}
                />
              </div>
            </Card>
          )}

          {report.incomeByCategory.length > 0 && (
            <Card>
              <CardHeader title="Income Breakdown" />
              <CategoryBreakdownList
                data={report.incomeByCategory}
                currency={currency}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
