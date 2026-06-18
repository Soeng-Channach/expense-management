import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { summarize, categoryBreakdown } from '@/lib/analytics';
import { getPeriodRange, isDateInRange } from '@/lib/date';
import { useCategories } from './useCategories';
import type { Transaction, ReportPeriod } from '@/types';

/** Builds a full report (summary + breakdowns) for a period anchored on a date. */
export function useReport(period: ReportPeriod, anchor: Date) {
  const { lookup } = useCategories();
  const transactions = useLiveQuery(
    () => db.transactions.toArray(),
    [],
    [] as Transaction[]
  );

  return useMemo(() => {
    const range = getPeriodRange(period, anchor);
    const inRange = transactions.filter((t) => isDateInRange(t.date, range));
    const summary = summarize(inRange);

    return {
      range,
      summary,
      count: inRange.length,
      expenseByCategory: categoryBreakdown(inRange, 'expense', lookup),
      incomeByCategory: categoryBreakdown(inRange, 'income', lookup),
      transactions: inRange.sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt
      ),
    };
  }, [transactions, lookup, period, anchor]);
}
