import type {
  Transaction,
  Category,
  CategoryTotal,
  PeriodSummary,
} from '@/types';

/** Totals income/expense/balance and savings rate for a set of transactions. */
export function summarize(transactions: Transaction[]): PeriodSummary {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  const balance = income - expense;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;
  return { income, expense, balance, savingsRate };
}

/**
 * Groups transactions of a given type by category, returning sorted totals
 * with percentage-of-total and a resolved color from the category lookup.
 */
export function categoryBreakdown(
  transactions: Transaction[],
  type: 'income' | 'expense',
  lookup: Map<string, Category>
): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== type) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }
  const grand = [...totals.values()].reduce((a, b) => a + b, 0);

  return [...totals.entries()]
    .map(([category, total]) => ({
      category,
      total,
      color: lookup.get(`${type}:${category}`)?.color ?? '#94a3b8',
      percentage: grand > 0 ? (total / grand) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/** Aggregates a month's income & expense totals keyed by `yyyy-MM`. */
export function monthlyTotals(
  transactions: Transaction[],
  monthKeyOf: (date: string) => string,
  months: string[]
): { income: number[]; expense: number[] } {
  const income = new Map<string, number>();
  const expense = new Map<string, number>();
  for (const t of transactions) {
    const key = monthKeyOf(t.date);
    const target = t.type === 'income' ? income : expense;
    target.set(key, (target.get(key) ?? 0) + t.amount);
  }
  return {
    income: months.map((m) => income.get(m) ?? 0),
    expense: months.map((m) => expense.get(m) ?? 0),
  };
}
