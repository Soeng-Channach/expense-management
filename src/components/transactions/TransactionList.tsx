import { useMemo, useState } from 'react';
import { Receipt } from 'lucide-react';
import { TransactionItem } from './TransactionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTransactionModal } from '@/context/TransactionModalContext';
import { useToast } from '@/context/ToastContext';
import { deleteTransaction } from '@/db/repository';
import { formatDayLabel } from '@/lib/date';
import { formatCurrency } from '@/lib/format';
import type { Transaction, Category } from '@/types';

interface TransactionListProps {
  transactions: Transaction[];
  lookup: Map<string, Category>;
  currency: string;
  /** Group items under date headers (used on the Transactions page). */
  grouped?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function TransactionList({
  transactions,
  lookup,
  currency,
  grouped = true,
  emptyTitle = 'No transactions yet',
  emptyDescription = 'Tap the + button to record your first transaction.',
}: TransactionListProps) {
  const { openEdit } = useTransactionModal();
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  const groups = useMemo(() => {
    if (!grouped) return null;
    const map = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    return [...map.entries()];
  }, [transactions, grouped]);

  const confirmDelete = async () => {
    if (pendingDelete?.id == null) return;
    await deleteTransaction(pendingDelete.id);
    setPendingDelete(null);
    toast('Transaction deleted', 'success');
  };

  if (transactions.length === 0) {
    return (
      <EmptyState icon={Receipt} title={emptyTitle} description={emptyDescription} />
    );
  }

  const renderItem = (t: Transaction) => (
    <TransactionItem
      key={t.id}
      transaction={t}
      category={lookup.get(`${t.type}:${t.category}`)}
      currency={currency}
      onEdit={openEdit}
      onDelete={setPendingDelete}
    />
  );

  return (
    <>
      {grouped && groups ? (
        <div className="space-y-5">
          {groups.map(([date, items]) => {
            const net = items.reduce(
              (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
              0
            );
            return (
              <div key={date}>
                <div className="mb-1 flex items-center justify-between px-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-content-muted">
                    {formatDayLabel(date)}
                  </span>
                  <span className="text-xs font-medium tabular-nums text-content-muted">
                    {formatCurrency(net, currency, { signed: true })}
                  </span>
                </div>
                <div className="-mx-2">{items.map(renderItem)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="-mx-2">{transactions.map(renderItem)}</div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete transaction?"
        message={`This will permanently remove "${
          pendingDelete?.description || pendingDelete?.category
        }". This cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
