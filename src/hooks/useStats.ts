import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import {
  summarize,
  categoryBreakdown,
  monthlyTotals,
} from '@/lib/analytics';
import { currentMonthKey, monthKey, lastMonths } from '@/lib/date';
import { useCategories } from './useCategories';
import type { Transaction } from '@/types';

/** Aggregated figures powering the dashboard summary cards & charts. */
export function useStats(trendMonths = 6) {
  const { lookup } = useCategories();
  const transactions = useLiveQuery(
    () => db.transactions.toArray(),
    [],
    [] as Transaction[]
  );

  return useMemo(() => {
    const month = currentMonthKey();
    const allTime = summarize(transactions);

    const monthTx = transactions.filter((t) => monthKey(t.date) === month);
    const monthSummary = summarize(monthTx);

    const expenseByCategory = categoryBreakdown(monthTx, 'expense', lookup);

    const months = lastMonths(trendMonths);
    const trend = monthlyTotals(
      transactions,
      monthKey,
      months.map((m) => m.key)
    );

    return {
      balance: allTime.balance,
      totalIncome: allTime.income,
      totalExpense: allTime.expense,
      savings: allTime.balance,
      savingsRate: allTime.savingsRate,
      monthlyIncome: monthSummary.income,
      monthlyExpense: monthSummary.expense,
      monthlySavings: monthSummary.balance,
      expenseByCategory,
      trend: {
        labels: months.map((m) => m.label),
        income: trend.income,
        expense: trend.expense,
      },
      hasData: transactions.length > 0,
    };
  }, [transactions, lookup, trendMonths]);
}
