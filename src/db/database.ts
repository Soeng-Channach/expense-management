import Dexie, { type Table } from 'dexie';
import type { Transaction, Category, Budget, Settings } from '@/types';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './seed';

/**
 * Offline-first database backed by IndexedDB via Dexie.
 * Everything lives on the device — there is no backend or sync.
 */
export class ExpenseDB extends Dexie {
  transactions!: Table<Transaction, number>;
  categories!: Table<Category, number>;
  budgets!: Table<Budget, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super('track-expense-db');

    this.version(1).stores({
      // ++id => auto-increment PK; remaining fields are secondary indexes
      transactions: '++id, type, category, date, createdAt',
      categories: '++id, type, &[name+type]',
      budgets: '++id, &month',
      settings: '++id',
    });

    // Seed defaults the first time the database is created.
    this.on('populate', () => this.seedDefaults());
  }

  private async seedDefaults() {
    await this.categories.bulkAdd(DEFAULT_CATEGORIES as Category[]);
    await this.settings.add({ ...DEFAULT_SETTINGS, id: 1 } as Settings);
  }
}

export const db = new ExpenseDB();

/**
 * Ensures a settings row always exists (covers databases created before the
 * settings table, or a wiped settings store). Safe to call on every boot.
 */
export async function ensureSettings(): Promise<Settings> {
  const existing = await db.settings.get(1);
  if (existing) return existing;
  const created: Settings = { ...DEFAULT_SETTINGS, id: 1 };
  await db.settings.put(created);
  return created;
}
