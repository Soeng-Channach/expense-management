import { describe, it, expect } from 'vitest';
import { summarize, categoryBreakdown, monthlyTotals } from './analytics';
import type { Category, Transaction } from '@/types';

function tx(partial: Partial<Transaction>): Transaction {
  return {
    type: 'expense',
    amount: 0,
    category: 'Food',
    description: '',
    date: '2026-06-01',
    createdAt: 0,
    ...partial,
  };
}

describe('summarize', () => {
  it('totals income, expense, balance and savings rate', () => {
    const result = summarize([
      tx({ type: 'income', amount: 1000 }),
      tx({ type: 'expense', amount: 250 }),
      tx({ type: 'expense', amount: 150 }),
    ]);
    expect(result).toEqual({
      income: 1000,
      expense: 400,
      balance: 600,
      savingsRate: 60,
    });
  });

  it('returns zero savings rate when there is no income', () => {
    const result = summarize([tx({ type: 'expense', amount: 100 })]);
    expect(result.income).toBe(0);
    expect(result.balance).toBe(-100);
    expect(result.savingsRate).toBe(0);
  });

  it('handles an empty list', () => {
    expect(summarize([])).toEqual({
      income: 0,
      expense: 0,
      balance: 0,
      savingsRate: 0,
    });
  });
});

describe('categoryBreakdown', () => {
  const lookup = new Map<string, Category>([
    ['expense:Food', { name: 'Food', type: 'expense', color: '#f00' }],
    ['expense:Transport', { name: 'Transport', type: 'expense', color: '#0f0' }],
  ]);

  it('groups by category, sorts by total desc and computes percentages', () => {
    const result = categoryBreakdown(
      [
        tx({ category: 'Food', amount: 30 }),
        tx({ category: 'Food', amount: 70 }),
        tx({ category: 'Transport', amount: 100 }),
        tx({ type: 'income', category: 'Salary', amount: 9999 }), // ignored
      ],
      'expense',
      lookup
    );

    expect(result).toEqual([
      { category: 'Food', total: 100, color: '#f00', percentage: 50 },
      { category: 'Transport', total: 100, color: '#0f0', percentage: 50 },
    ]);
  });

  it('falls back to a default color when the category is unknown', () => {
    const result = categoryBreakdown(
      [tx({ category: 'Mystery', amount: 10 })],
      'expense',
      lookup
    );
    expect(result[0].color).toBe('#94a3b8');
    expect(result[0].percentage).toBe(100);
  });

  it('returns an empty array when nothing matches the type', () => {
    expect(categoryBreakdown([tx({ type: 'income' })], 'expense', lookup)).toEqual(
      []
    );
  });
});

describe('monthlyTotals', () => {
  it('buckets income and expense into the requested months in order', () => {
    const monthKeyOf = (date: string) => date.slice(0, 7);
    const { income, expense } = monthlyTotals(
      [
        tx({ type: 'income', amount: 500, date: '2026-05-10' }),
        tx({ type: 'expense', amount: 200, date: '2026-05-12' }),
        tx({ type: 'expense', amount: 300, date: '2026-06-01' }),
      ],
      monthKeyOf,
      ['2026-04', '2026-05', '2026-06']
    );
    expect(income).toEqual([0, 500, 0]);
    expect(expense).toEqual([0, 200, 300]);
  });
});
