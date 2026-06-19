import { db, ensureSettings } from './database';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './seed';
import type { Transaction, Category, Settings, BackupFile } from '@/types';

const BACKUP_VERSION = 1;

/* ----------------------------- Transactions ----------------------------- */

export async function addTransaction(
  input: Omit<Transaction, 'id' | 'createdAt'>
): Promise<number> {
  return db.transactions.add({ ...input, createdAt: Date.now() });
}

export async function updateTransaction(
  id: number,
  changes: Partial<Omit<Transaction, 'id'>>
): Promise<number> {
  return db.transactions.update(id, changes);
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.transactions.delete(id);
}

/* ------------------------------ Categories ------------------------------ */

export async function addCategory(input: Omit<Category, 'id'>): Promise<number> {
  return db.categories.add(input as Category);
}

export async function updateCategory(
  id: number,
  changes: Partial<Omit<Category, 'id'>>
): Promise<void> {
  const before = await db.categories.get(id);
  await db.categories.update(id, changes);
  // Keep denormalized transaction category names in sync on rename.
  if (before && changes.name && changes.name !== before.name) {
    await db.transactions
      .where('category')
      .equals(before.name)
      .and((t) => t.type === before.type)
      .modify({ category: changes.name });
  }
}

export async function deleteCategory(id: number): Promise<void> {
  await db.categories.delete(id);
}

/* ------------------------------- Budgets -------------------------------- */

/** Upsert a budget for a given `yyyy-MM` month. */
export async function setBudget(month: string, amount: number): Promise<void> {
  const existing = await db.budgets.where('month').equals(month).first();
  if (existing?.id != null) {
    await db.budgets.update(existing.id, { amount });
  } else {
    await db.budgets.add({ month, amount });
  }
}

export async function deleteBudget(id: number): Promise<void> {
  await db.budgets.delete(id);
}

/* ------------------------------- Settings ------------------------------- */

export async function updateSettings(
  changes: Partial<Omit<Settings, 'id'>>
): Promise<void> {
  await ensureSettings();
  await db.settings.update(1, changes);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Switches the active currency to `to`. When `rate` is provided (and not 1),
 * every transaction amount, budget and the default budget is multiplied by it
 * so figures are re-expressed in the new currency. Runs atomically.
 */
export async function convertCurrency(to: string, rate?: number): Promise<void> {
  await ensureSettings();
  const apply = rate != null && rate > 0 && rate !== 1;
  await db.transaction('rw', db.transactions, db.budgets, db.settings, async () => {
    if (apply) {
      await db.transactions.toCollection().modify((t) => {
        t.amount = round2(t.amount * rate!);
      });
      await db.budgets.toCollection().modify((b) => {
        b.amount = round2(b.amount * rate!);
      });
    }
    const settings = await db.settings.get(1);
    const defaultBudget =
      apply && settings?.defaultBudget != null
        ? round2(settings.defaultBudget * rate!)
        : settings?.defaultBudget;
    await db.settings.update(1, { currency: to, defaultBudget });
  });
}

/* --------------------------- Backup / Restore --------------------------- */

export async function exportData(): Promise<BackupFile> {
  const [transactions, categories, budgets, settings] = await Promise.all([
    db.transactions.toArray(),
    db.categories.toArray(),
    db.budgets.toArray(),
    db.settings.toArray(),
  ]);
  return {
    app: 'track-expense',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: { transactions, categories, budgets, settings },
  };
}

export function validateBackup(value: unknown): value is BackupFile {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<BackupFile>;
  if (v.app !== 'track-expense') return false;
  if (!v.data || typeof v.data !== 'object') return false;
  return (
    Array.isArray(v.data.transactions) &&
    Array.isArray(v.data.categories) &&
    Array.isArray(v.data.budgets)
  );
}

/**
 * Replaces all local data with the contents of a backup file.
 * Runs inside a single transaction so a failure leaves data untouched.
 */
export async function importData(backup: BackupFile): Promise<void> {
  const { transactions, categories, budgets, settings } = backup.data;
  await db.transaction(
    'rw',
    db.transactions,
    db.categories,
    db.budgets,
    db.settings,
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.categories.clear(),
        db.budgets.clear(),
        db.settings.clear(),
      ]);
      if (transactions.length) await db.transactions.bulkAdd(transactions);
      if (categories.length) await db.categories.bulkAdd(categories);
      if (budgets.length) await db.budgets.bulkAdd(budgets);
      await db.settings.bulkAdd(
        settings?.length ? settings : [{ ...DEFAULT_SETTINGS, id: 1 }]
      );
    }
  );
}

/** Wipes all transactions/budgets and restores factory category + settings. */
export async function clearAllData(): Promise<void> {
  await db.transaction(
    'rw',
    db.transactions,
    db.categories,
    db.budgets,
    db.settings,
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.categories.clear(),
        db.budgets.clear(),
        db.settings.clear(),
      ]);
      await db.categories.bulkAdd(DEFAULT_CATEGORIES as Category[]);
      await db.settings.add({ ...DEFAULT_SETTINGS, id: 1 } as Settings);
    }
  );
}
