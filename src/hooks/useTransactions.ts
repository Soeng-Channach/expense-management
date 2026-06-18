import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/db/repository';
import type { Transaction, TransactionType } from '@/types';

export interface TransactionFilter {
  type?: TransactionType | 'all';
  category?: string;
  search?: string;
}

/** Sort newest first: by date desc, then createdAt desc for same-day ties. */
function byNewest(a: Transaction, b: Transaction): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return b.createdAt - a.createdAt;
}

export function useTransactions(filter: TransactionFilter = {}) {
  const all = useLiveQuery(
    () => db.transactions.toArray(),
    [],
    [] as Transaction[]
  );

  const transactions = useMemo(() => {
    const { type = 'all', category, search } = filter;
    const term = search?.trim().toLowerCase();
    return all
      .filter((t) => (type === 'all' ? true : t.type === type))
      .filter((t) => (category ? t.category === category : true))
      .filter((t) =>
        term
          ? t.description.toLowerCase().includes(term) ||
            t.category.toLowerCase().includes(term)
          : true
      )
      .sort(byNewest);
  }, [all, filter]);

  return {
    transactions,
    all,
    loading: useLiveQuery(() => db.transactions.count(), []) === undefined,
    add: addTransaction,
    update: updateTransaction,
    remove: deleteTransaction,
  };
}

/** Convenience hook for the N most recent transactions. */
export function useRecentTransactions(limit = 5) {
  const all = useLiveQuery(
    () => db.transactions.toArray(),
    [],
    [] as Transaction[]
  );
  return useMemo(() => [...all].sort(byNewest).slice(0, limit), [all, limit]);
}
