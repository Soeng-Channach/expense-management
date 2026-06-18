/**
 * Core domain types shared across the app.
 * IDs use auto-incrementing numbers provided by Dexie/IndexedDB.
 */

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: number;
  type: TransactionType;
  amount: number;
  /** Category name (kept denormalized so deleting a category never orphans data). */
  category: string;
  description: string;
  /** ISO date string (yyyy-MM-dd) representing the day the transaction occurred. */
  date: string;
  /** Epoch millis for stable sort / audit. */
  createdAt: number;
}

export interface Category {
  id?: number;
  name: string;
  type: TransactionType;
  /** lucide-react icon name; rendered via the icon registry. */
  icon?: string;
  /** Hex color used in charts and chips. */
  color?: string;
}

export interface Budget {
  id?: number;
  /** Month key in `yyyy-MM` format. */
  month: string;
  amount: number;
}

export interface Settings {
  id?: number;
  darkMode: boolean;
  /** ISO 4217 currency code, e.g. "USD", "KRW", "EUR". */
  currency: string;
  /** Pinned monthly budget that applies when no month-specific budget is set. */
  defaultBudget?: number;
}

/** Shape of an exported/imported backup file. */
export interface BackupFile {
  app: 'track-expense';
  version: number;
  exportedAt: string;
  data: {
    transactions: Transaction[];
    categories: Category[];
    budgets: Budget[];
    settings: Settings[];
  };
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CategoryTotal {
  category: string;
  total: number;
  color: string;
  percentage: number;
}

export interface PeriodSummary {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
}
