import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  ChevronRight,
  PieChart,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/StatCard';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { CategoryBreakdownList } from '@/components/CategoryBreakdownList';
import { TransactionList } from '@/components/transactions/TransactionList';
import { EmptyState } from '@/components/ui/EmptyState';
import { BudgetProgressCard } from '@/components/budget/BudgetProgressCard';
import { useStats } from '@/hooks/useStats';
import { useBudget } from '@/hooks/useBudgets';
import { useRecentTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency, formatPercent } from '@/lib/format';

export function Dashboard() {
  const stats = useStats(6);
  const budget = useBudget();
  const recent = useRecentTransactions(5);
  const { lookup } = useCategories();
  const { settings } = useSettings();
  const currency = settings.currency;

  return (
    <div className="space-y-5">
      {/* Hero balance card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-sm font-medium text-white/80">Current Balance</p>
          <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">
            {formatCurrency(stats.balance, currency)}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="flex items-center gap-1 text-white/70">
                <PiggyBank className="h-4 w-4" /> Savings
              </p>
              <p className="mt-0.5 font-semibold tabular-nums">
                {formatCurrency(stats.savings, currency)}
                {stats.totalIncome > 0 && (
                  <span className="ml-1.5 text-xs text-white/70">
                    ({formatPercent(stats.savingsRate)})
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-white/70">
                <ArrowUpRight className="h-4 w-4" /> This month in
              </p>
              <p className="mt-0.5 font-semibold tabular-nums">
                {formatCurrency(stats.monthlyIncome, currency)}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-white/70">
                <ArrowDownRight className="h-4 w-4" /> This month out
              </p>
              <p className="mt-0.5 font-semibold tabular-nums">
                {formatCurrency(stats.monthlyExpense, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary stat grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Income"
          value={formatCurrency(stats.totalIncome, currency)}
          icon={TrendingUp}
          tone="income"
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(stats.totalExpense, currency)}
          icon={TrendingDown}
          tone="expense"
        />
        <StatCard
          label="Monthly Income"
          value={formatCurrency(stats.monthlyIncome, currency)}
          icon={ArrowUpRight}
          tone="income"
        />
        <StatCard
          label="Monthly Expenses"
          value={formatCurrency(stats.monthlyExpense, currency)}
          icon={ArrowDownRight}
          tone="expense"
        />
      </div>

      {!stats.hasData && (
        <Card>
          <EmptyState
            icon={PieChart}
            title="Welcome to TrackExpense"
            description="Add your first transaction with the + button to see your dashboard come to life."
          />
        </Card>
      )}

      {/* Budget snapshot */}
      {budget.amount > 0 && (
        <Card>
          <CardHeader
            title="Monthly Budget"
            action={
              <Link
                to="/budget"
                className="flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Manage <ChevronRight className="h-4 w-4" />
              </Link>
            }
          />
          <BudgetProgressCard status={budget} currency={currency} />
        </Card>
      )}

      {/* Charts */}
      {stats.hasData && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Expenses by Category" subtitle="This month" />
            {stats.expenseByCategory.length > 0 ? (
              <div className="space-y-5">
                <CategoryPieChart data={stats.expenseByCategory} currency={currency} />
                <CategoryBreakdownList
                  data={stats.expenseByCategory}
                  currency={currency}
                  limit={5}
                />
              </div>
            ) : (
              <EmptyState
                icon={PieChart}
                title="No expenses this month"
                description="Spending will appear here once you log expenses."
                compact
              />
            )}
          </Card>

          <Card>
            <CardHeader title="Income vs Expense" subtitle="Last 6 months" />
            <MonthlyTrendChart
              labels={stats.trend.labels}
              income={stats.trend.income}
              expense={stats.trend.expense}
              currency={currency}
            />
          </Card>
        </div>
      )}

      {/* Recent transactions */}
      <Card>
        <CardHeader
          title="Recent Transactions"
          action={
            <Link
              to="/transactions"
              className="flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          }
        />
        <TransactionList
          transactions={recent}
          lookup={lookup}
          currency={currency}
          grouped={false}
        />
      </Card>
    </div>
  );
}
