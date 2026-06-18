import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  TransactionForm,
  TRANSACTION_FORM_ID,
} from '@/components/transactions/TransactionForm';
import { useSettings } from '@/hooks/useSettings';
import type { Transaction, TransactionType } from '@/types';

interface TransactionModalContextValue {
  openAdd: (type?: TransactionType) => void;
  openEdit: (transaction: Transaction) => void;
  close: () => void;
}

const TransactionModalContext =
  createContext<TransactionModalContextValue | null>(null);

export function TransactionModalProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [defaultType, setDefaultType] = useState<TransactionType>('expense');

  const openAdd = useCallback((type: TransactionType = 'expense') => {
    setEditing(null);
    setDefaultType(type);
    setOpen(true);
  }, []);

  const openEdit = useCallback((transaction: Transaction) => {
    setEditing(transaction);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openAdd, openEdit, close }),
    [openAdd, openEdit, close]
  );

  return (
    <TransactionModalContext.Provider value={value}>
      {children}
      <Modal
        open={open}
        onClose={close}
        title={editing ? 'Edit transaction' : 'Add transaction'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={close} type="button">
              Cancel
            </Button>
            <Button type="submit" form={TRANSACTION_FORM_ID} fullWidth>
              {editing ? 'Save changes' : 'Add'}
            </Button>
          </div>
        }
      >
        {/* Remount per open so RHF re-initializes with the right defaults. */}
        {open && (
          <TransactionForm
            key={editing?.id ?? 'new'}
            transaction={editing}
            defaultType={defaultType}
            currency={settings.currency}
            onSuccess={close}
          />
        )}
      </Modal>
    </TransactionModalContext.Provider>
  );
}

export function useTransactionModal(): TransactionModalContextValue {
  const ctx = useContext(TransactionModalContext);
  if (!ctx)
    throw new Error(
      'useTransactionModal must be used within a TransactionModalProvider'
    );
  return ctx;
}
