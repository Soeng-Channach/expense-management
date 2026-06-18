import { Plus } from 'lucide-react';
import { useTransactionModal } from '@/context/TransactionModalContext';

/**
 * Floating action button to add a transaction. Sits above the mobile bottom
 * navigation, and bottom-right on desktop.
 */
export function FloatingAddButton() {
  const { openAdd } = useTransactionModal();

  return (
    <button
      onClick={() => openAdd()}
      aria-label="Add transaction"
      className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full
        bg-brand-600 text-white shadow-fab transition hover:bg-brand-700 active:scale-95
        bottom-20 lg:bottom-8 lg:right-8"
    >
      <Plus className="h-7 w-7" strokeWidth={2.5} />
    </button>
  );
}
