import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useToast } from '@/context/ToastContext';
import { addCategory, updateCategory } from '@/db/repository';
import { ICON_NAMES, getIcon } from '@/lib/icons';
import { CATEGORY_COLORS } from '@/db/seed';
import { cn } from '@/lib/cn';
import type { Category, TransactionType } from '@/types';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
  defaultType?: TransactionType;
}

export function CategoryFormModal({
  open,
  onClose,
  category,
  defaultType = 'expense',
}: CategoryFormModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [icon, setIcon] = useState(ICON_NAMES[0]);
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset form whenever the modal opens for a new target.
  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? '');
    setType(category?.type ?? defaultType);
    setIcon(category?.icon ?? ICON_NAMES[0]);
    setColor(category?.color ?? CATEGORY_COLORS[0]);
    setError('');
  }, [open, category, defaultType]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a category name');
      return;
    }
    setSaving(true);
    try {
      if (category?.id != null) {
        await updateCategory(category.id, { name: trimmed, type, icon, color });
        toast('Category updated', 'success');
      } else {
        await addCategory({ name: trimmed, type, icon, color });
        toast('Category created', 'success');
      }
      onClose();
    } catch {
      setError(`A "${trimmed}" ${type} category already exists`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Edit category' : 'New category'}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth onClick={save} loading={saving}>
            {category ? 'Save' : 'Create'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <SegmentedControl<TransactionType>
          value={type}
          onChange={setType}
          options={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
        />

        <Input
          label="Name"
          value={name}
          // Moving focus into a dialog the user just opened is the expected
          // ARIA dialog behaviour, so autoFocus is intentional here.
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          maxLength={30}
          placeholder="e.g. Groceries"
          error={error}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
        />

        <div>
          <span className="label-base">Icon</span>
          <div className="grid grid-cols-7 gap-2">
            {ICON_NAMES.map((n) => {
              const Icon = getIcon(n);
              const active = n === icon;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setIcon(n)}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-xl border transition',
                    active
                      ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                      : 'border-border text-content-muted hover:bg-surface-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="label-base">Color</span>
          <div className="grid grid-cols-8 gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                className={cn(
                  'aspect-square rounded-full transition',
                  color === c
                    ? 'ring-2 ring-offset-2 ring-offset-surface ring-content'
                    : 'hover:scale-110'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
