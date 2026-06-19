import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './database';
import { DEFAULT_CATEGORIES } from './seed';
import {
  addTransaction,
  updateCategory,
  addCategory,
  setBudget,
  updateSettings,
  convertCurrency,
  exportData,
  importData,
  validateBackup,
  clearAllData,
} from './repository';

// Each test starts from a freshly seeded database.
beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('addTransaction', () => {
  it('stamps createdAt and returns the new id', async () => {
    const id = await addTransaction({
      type: 'expense',
      amount: 12.5,
      category: 'Food',
      description: 'Lunch',
      date: '2026-06-01',
    });
    const saved = await db.transactions.get(id);
    expect(saved?.amount).toBe(12.5);
    expect(typeof saved?.createdAt).toBe('number');
    expect(saved?.createdAt).toBeGreaterThan(0);
  });
});

describe('updateCategory rename sync', () => {
  it('renames matching transactions but leaves other types untouched', async () => {
    const cat = await db.categories
      .where('[name+type]')
      .equals(['Food', 'expense'])
      .first();
    expect(cat?.id).toBeDefined();

    await addTransaction({
      type: 'expense',
      amount: 10,
      category: 'Food',
      description: '',
      date: '2026-06-01',
    });
    // An income transaction that happens to share the name must NOT be renamed.
    await addTransaction({
      type: 'income',
      amount: 10,
      category: 'Food',
      description: '',
      date: '2026-06-01',
    });

    await updateCategory(cat!.id!, { name: 'Groceries' });

    const expense = await db.transactions.where('type').equals('expense').first();
    const income = await db.transactions.where('type').equals('income').first();
    expect(expense?.category).toBe('Groceries');
    expect(income?.category).toBe('Food');
  });
});

describe('setBudget', () => {
  it('inserts then updates the same month (upsert)', async () => {
    await setBudget('2026-06', 1000);
    await setBudget('2026-06', 1500);
    const rows = await db.budgets.where('month').equals('2026-06').toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].amount).toBe(1500);
  });
});

describe('convertCurrency', () => {
  it('scales transactions, budgets and defaultBudget then updates currency', async () => {
    await addTransaction({
      type: 'expense',
      amount: 10,
      category: 'Food',
      description: '',
      date: '2026-06-01',
    });
    await setBudget('2026-06', 100);
    await updateSettings({ defaultBudget: 200 });

    await convertCurrency('KHR', 4100);

    const tx = await db.transactions.toCollection().first();
    const budget = await db.budgets.where('month').equals('2026-06').first();
    const settings = await db.settings.get(1);
    expect(tx?.amount).toBe(41000);
    expect(budget?.amount).toBe(410000);
    expect(settings?.defaultBudget).toBe(820000);
    expect(settings?.currency).toBe('KHR');
  });

  it('rounds converted amounts to two decimals', async () => {
    await addTransaction({
      type: 'expense',
      amount: 10,
      category: 'Food',
      description: '',
      date: '2026-06-01',
    });
    await convertCurrency('USD', 0.333);
    const tx = await db.transactions.toCollection().first();
    expect(tx?.amount).toBe(3.33);
  });

  it('switches currency without touching amounts when rate is 1', async () => {
    await addTransaction({
      type: 'expense',
      amount: 10,
      category: 'Food',
      description: '',
      date: '2026-06-01',
    });
    await convertCurrency('KRW', 1);
    const tx = await db.transactions.toCollection().first();
    const settings = await db.settings.get(1);
    expect(tx?.amount).toBe(10);
    expect(settings?.currency).toBe('KRW');
  });
});

describe('export / import round-trip', () => {
  it('restores an exported snapshot exactly', async () => {
    await addTransaction({
      type: 'income',
      amount: 500,
      category: 'Salary',
      description: 'June pay',
      date: '2026-06-01',
    });
    await addCategory({ name: 'Pets', type: 'expense', color: '#abc' });
    await setBudget('2026-06', 800);

    const backup = await exportData();
    expect(validateBackup(backup)).toBe(true);

    // Wipe and restore.
    await db.transactions.clear();
    await db.categories.clear();
    await db.budgets.clear();
    await importData(backup);

    const [tx, cats, budgets] = await Promise.all([
      db.transactions.toArray(),
      db.categories.toArray(),
      db.budgets.toArray(),
    ]);
    expect(tx).toHaveLength(1);
    expect(tx[0].description).toBe('June pay');
    expect(cats.some((c) => c.name === 'Pets')).toBe(true);
    expect(budgets[0].amount).toBe(800);
  });
});

describe('validateBackup', () => {
  const good = {
    app: 'track-expense',
    version: 1,
    exportedAt: '2026-06-01T00:00:00.000Z',
    data: {
      transactions: [
        {
          type: 'expense',
          amount: 10,
          category: 'Food',
          description: '',
          date: '2026-06-01',
          createdAt: 1,
        },
      ],
      categories: [{ name: 'Food', type: 'expense' }],
      budgets: [{ month: '2026-06', amount: 100 }],
      settings: [{ darkMode: false, currency: 'USD' }],
    },
  };

  it('accepts a well-formed backup', () => {
    expect(validateBackup(good)).toBe(true);
  });

  it('rejects a foreign app marker', () => {
    expect(validateBackup({ ...good, app: 'something-else' })).toBe(false);
  });

  it('rejects a backup from a newer app version', () => {
    expect(validateBackup({ ...good, version: 99 })).toBe(false);
  });

  it('rejects a transaction with a non-numeric amount', () => {
    const bad = {
      ...good,
      data: {
        ...good.data,
        transactions: [{ ...good.data.transactions[0], amount: 'lots' }],
      },
    };
    expect(validateBackup(bad)).toBe(false);
  });

  it('rejects a budget with a malformed month key', () => {
    const bad = {
      ...good,
      data: { ...good.data, budgets: [{ month: 'June', amount: 100 }] },
    };
    expect(validateBackup(bad)).toBe(false);
  });

  it('rejects non-object and missing-data values', () => {
    expect(validateBackup(null)).toBe(false);
    expect(validateBackup('nope')).toBe(false);
    expect(validateBackup({ app: 'track-expense', version: 1 })).toBe(false);
  });
});

describe('clearAllData', () => {
  it('wipes user data and restores factory categories + settings', async () => {
    await addTransaction({
      type: 'expense',
      amount: 1,
      category: 'Food',
      description: '',
      date: '2026-06-01',
    });
    await setBudget('2026-06', 100);

    await clearAllData();

    expect(await db.transactions.count()).toBe(0);
    expect(await db.budgets.count()).toBe(0);
    expect(await db.categories.count()).toBe(DEFAULT_CATEGORIES.length);
    expect((await db.settings.get(1))?.currency).toBe('USD');
  });
});
