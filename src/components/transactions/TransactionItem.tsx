import { Trash2 } from 'lucide-react';
import { getIcon } from '@/lib/icons';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Transaction, Category } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  currency: string;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}

export function TransactionItem({
  transaction,
  category,
  currency,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const Icon = getIcon(category?.icon);
  const isIncome = transaction.type === 'income';
  const color = category?.color ?? '#94a3b8';

  return (
    <div className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-surface-muted">
      <button
        onClick={() => onEdit(transaction)}
        className="flex flex-1 items-center gap-3 text-left"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-content">
            {transaction.description || transaction.category}
          </span>
          <span className="block truncate text-xs text-content-muted">
            {transaction.category}
          </span>
        </span>
        <span
          className={cn(
            'shrink-0 text-sm font-semibold tabular-nums',
            isIncome ? 'text-income' : 'text-content'
          )}
        >
          {formatCurrency(isIncome ? transaction.amount : -transaction.amount, currency, {
            signed: true,
          })}
        </span>
      </button>
      <button
        onClick={() => onDelete(transaction)}
        aria-label="Delete transaction"
        className="rounded-lg p-2 text-content-muted opacity-0 transition hover:bg-expense/10 hover:text-expense group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
