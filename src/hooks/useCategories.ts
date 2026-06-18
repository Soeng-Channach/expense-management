import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import {
  addCategory,
  updateCategory,
  deleteCategory,
} from '@/db/repository';
import type { Category, TransactionType } from '@/types';

/** Reactive categories plus CRUD bindings and convenient groupings. */
export function useCategories(type?: TransactionType) {
  const categories = useLiveQuery(
    () =>
      type
        ? db.categories.where('type').equals(type).toArray()
        : db.categories.toArray(),
    [type],
    [] as Category[]
  );

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const byType = useMemo(
    () => ({
      income: sorted.filter((c) => c.type === 'income'),
      expense: sorted.filter((c) => c.type === 'expense'),
    }),
    [sorted]
  );

  /** Lookup map: `${type}:${name}` -> Category (for resolving colors/icons). */
  const lookup = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of sorted) map.set(`${c.type}:${c.name}`, c);
    return map;
  }, [sorted]);

  return {
    categories: sorted,
    byType,
    lookup,
    add: addCategory,
    update: updateCategory,
    remove: deleteCategory,
  };
}
