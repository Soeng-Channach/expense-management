import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TransactionList } from '@/components/transactions/TransactionList';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useSettings } from '@/hooks/useSettings';
import { summarize } from '@/lib/analytics';
import { formatCurrency } from '@/lib/format';
import type { TransactionType } from '@/types';

type TypeFilter = TransactionType | 'all';

export function Transactions() {
  const [type, setType] = useState<TypeFilter>('all');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const { transactions } = useTransactions({
    type,
    category: category || undefined,
    search,
  });
  const { categories, lookup } = useCategories();
  const { settings } = useSettings();

  const totals = useMemo(() => summarize(transactions), [transactions]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="space-y-3" padded>
        <Input
          placeholder="Search description or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<Search className="h-4 w-4" />}
          className="pl-9"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SegmentedControl<TypeFilter>
            value={type}
            onChange={setType}
            options={[
              { value: 'all', label: 'All' },
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
            ]}
          />
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories
              .filter((c) => type === 'all' || c.type === type)
              .map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} · {c.type}
                </option>
              ))}
          </Select>
        </div>
      </Card>

      {/* Filtered summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-xs text-content-muted">Income</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-income">
            {formatCurrency(totals.income, settings.currency, { compact: true })}
          </p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-content-muted">Expense</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-expense">
            {formatCurrency(totals.expense, settings.currency, { compact: true })}
          </p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-content-muted">Net</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-content">
            {formatCurrency(totals.balance, settings.currency, { compact: true })}
          </p>
        </div>
      </div>

      {/* List */}
      <Card>
        <TransactionList
          transactions={transactions}
          lookup={lookup}
          currency={settings.currency}
          grouped
          emptyTitle={search || category || type !== 'all' ? 'No matches' : 'No transactions yet'}
          emptyDescription={
            search || category || type !== 'all'
              ? 'Try adjusting your filters.'
              : 'Tap the + button to record your first transaction.'
          }
        />
      </Card>
    </div>
  );
}
