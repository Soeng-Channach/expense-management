import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { setBudget, deleteBudget } from '@/db/repository';
import { currentMonthKey, monthKey } from '@/lib/date';
import { useSettings } from './useSettings';
import type { Budget, Transaction } from '@/types';

export interface BudgetStatus {
  month: string;
  /** Effective budget: month-specific, else the pinned default, else 0. */
  amount: number;
  spent: number;
  remaining: number;
  /** 0–100+ percentage of budget used. */
  usage: number;
  isSet: boolean;
  isOver: boolean;
  /** Warning threshold reached (>= 80% used). */
  isNearLimit: boolean;
}

/** Computes budget status for a month (defaults to the current month). */
export function useBudget(month: string = currentMonthKey()): BudgetStatus {
  const { settings } = useSettings();
  const budget = useLiveQuery(
    () => db.budgets.where('month').equals(month).first(),
    [month]
  );
  const transactions = useLiveQuery(
    () => db.transactions.where('type').equals('expense').toArray(),
    [],
    [] as Transaction[]
  );

  return useMemo(() => {
    const spent = transactions
      .filter((t) => monthKey(t.date) === month)
      .reduce((sum, t) => sum + t.amount, 0);

    const isSet = budget?.amount != null;
    const amount = budget?.amount ?? settings.defaultBudget ?? 0;
    const remaining = amount - spent;
    const usage = amount > 0 ? (spent / amount) * 100 : 0;

    return {
      month,
      amount,
      spent,
      remaining,
      usage,
      isSet: isSet || (settings.defaultBudget ?? 0) > 0,
      isOver: amount > 0 && spent > amount,
      isNearLimit: amount > 0 && usage >= 80,
    };
  }, [budget, transactions, month, settings.defaultBudget]);
}

export function useBudgets() {
  const budgets = useLiveQuery(
    () => db.budgets.toArray(),
    [],
    [] as Budget[]
  );
  const sorted = useMemo(
    () => [...budgets].sort((a, b) => (a.month < b.month ? 1 : -1)),
    [budgets]
  );
  return { budgets: sorted, setBudget, deleteBudget };
}
