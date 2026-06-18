import type { Category, Settings } from '@/types';

/**
 * Default categories seeded on first launch. `icon` values map to lucide-react
 * icons via the registry in `@/lib/icons`. Colors drive chart slices and chips.
 */
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Expense
  { name: 'Food', type: 'expense', icon: 'UtensilsCrossed', color: '#f97316' },
  { name: 'Transport', type: 'expense', icon: 'Car', color: '#3b82f6' },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
  { name: 'Entertainment', type: 'expense', icon: 'Clapperboard', color: '#a855f7' },
  { name: 'Bills', type: 'expense', icon: 'ReceiptText', color: '#ef4444' },
  { name: 'Healthcare', type: 'expense', icon: 'HeartPulse', color: '#14b8a6' },
  { name: 'Other', type: 'expense', icon: 'Shapes', color: '#64748b' },
  // Income
  { name: 'Salary', type: 'income', icon: 'Wallet', color: '#10b981' },
  { name: 'Bonus', type: 'income', icon: 'Gift', color: '#22c55e' },
  { name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#0ea5e9' },
  { name: 'Other', type: 'income', icon: 'Coins', color: '#84cc16' },
];

export const DEFAULT_SETTINGS: Omit<Settings, 'id'> = {
  darkMode: false,
  currency: 'USD',
  defaultBudget: undefined,
};

/** Palette used when a user creates a new category without picking a color. */
export const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#64748b',
];
