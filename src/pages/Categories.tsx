import { useState } from 'react';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryFormModal } from '@/components/categories/CategoryFormModal';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/context/ToastContext';
import { deleteCategory } from '@/db/repository';
import { getIcon } from '@/lib/icons';
import type { Category, TransactionType } from '@/types';

export function Categories() {
  const { byType } = useCategories();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creatingType, setCreatingType] = useState<TransactionType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const openCreate = (type: TransactionType) => {
    setEditing(null);
    setCreatingType(type);
    setModalOpen(true);
  };
  const openEdit = (category: Category) => {
    setEditing(category);
    setCreatingType(null);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDelete?.id == null) return;
    await deleteCategory(pendingDelete.id);
    setPendingDelete(null);
    toast('Category deleted', 'success');
  };

  const renderGroup = (title: string, items: Category[], type: TransactionType) => (
    <Card>
      <CardHeader
        title={title}
        subtitle={`${items.length} ${items.length === 1 ? 'category' : 'categories'}`}
        action={
          <Button size="sm" variant="secondary" onClick={() => openCreate(type)}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon={Tags}
          title={`No ${type} categories`}
          description="Create one to start organizing."
          compact
        />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((c) => {
            const Icon = getIcon(c.icon);
            return (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${c.color}1f`, color: c.color }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1 text-sm font-medium text-content">
                  {c.name}
                </span>
                <button
                  onClick={() => openEdit(c)}
                  aria-label={`Edit ${c.name}`}
                  className="rounded-lg p-2 text-content-muted transition hover:bg-surface-muted hover:text-content"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPendingDelete(c)}
                  aria-label={`Delete ${c.name}`}
                  className="rounded-lg p-2 text-content-muted transition hover:bg-expense/10 hover:text-expense"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      {renderGroup('Expense Categories', byType.expense, 'expense')}
      {renderGroup('Income Categories', byType.income, 'income')}

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editing}
        defaultType={creatingType ?? 'expense'}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete category?"
        message={`"${pendingDelete?.name}" will be removed. Existing transactions keep their category label and are not deleted.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
