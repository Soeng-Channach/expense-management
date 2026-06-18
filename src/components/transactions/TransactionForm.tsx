import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/context/ToastContext';
import { currencySymbol } from '@/lib/format';
import { todayISO } from '@/lib/date';
import { addTransaction, updateTransaction } from '@/db/repository';
import type { Transaction, TransactionType } from '@/types';

export const TRANSACTION_FORM_ID = 'transaction-form';

interface FormValues {
  type: TransactionType;
  amount: string;
  category: string;
  description: string;
  date: string;
}

interface TransactionFormProps {
  transaction?: Transaction | null;
  defaultType?: TransactionType;
  currency?: string;
  onSuccess: () => void;
}

export function TransactionForm({
  transaction,
  defaultType = 'expense',
  currency = 'USD',
  onSuccess,
}: TransactionFormProps) {
  const { byType } = useCategories();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      type: transaction?.type ?? defaultType,
      amount: transaction ? String(transaction.amount) : '',
      category: transaction?.category ?? '',
      description: transaction?.description ?? '',
      date: transaction?.date ?? todayISO(),
    },
  });

  const type = watch('type');
  const selectedCategory = watch('category');
  const options = byType[type];

  // Ensure a valid category is always selected for the active type.
  useEffect(() => {
    if (!options.length) return;
    const exists = options.some((c) => c.name === selectedCategory);
    if (!exists) setValue('category', options[0].name);
  }, [type, options, selectedCategory, setValue]);

  const onSubmit = async (values: FormValues) => {
    const amount = parseFloat(values.amount);
    const payload = {
      type: values.type,
      amount,
      category: values.category,
      description: values.description.trim(),
      date: values.date,
    };
    try {
      if (transaction?.id != null) {
        await updateTransaction(transaction.id, payload);
        toast('Transaction updated', 'success');
      } else {
        await addTransaction(payload);
        toast('Transaction added', 'success');
      }
      onSuccess();
    } catch {
      toast('Could not save transaction', 'error');
    }
  };

  return (
    <form
      id={TRANSACTION_FORM_ID}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <SegmentedControl<TransactionType>
        value={type}
        onChange={(v) => setValue('type', v)}
        options={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
        ]}
      />

      <Input
        label="Amount"
        type="number"
        step="0.01"
        inputMode="decimal"
        autoFocus
        prefix={currencySymbol(currency)}
        placeholder="0.00"
        error={errors.amount?.message}
        {...register('amount', {
          required: 'Enter an amount',
          validate: (v) =>
            (parseFloat(v) > 0 && Number.isFinite(parseFloat(v))) ||
            'Amount must be greater than 0',
        })}
      />

      <Select
        label="Category"
        error={errors.category?.message}
        {...register('category', { required: 'Pick a category' })}
      >
        {options.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </Select>

      <Input
        label="Description"
        placeholder="e.g. Lunch with team"
        maxLength={120}
        {...register('description')}
      />

      <Input
        label="Date"
        type="date"
        max={todayISO()}
        error={errors.date?.message}
        {...register('date', { required: 'Pick a date' })}
      />

      {/* Hidden submit allows Enter-to-submit; the visible button lives in the modal footer. */}
      <button type="submit" className="hidden" disabled={isSubmitting} aria-hidden />
    </form>
  );
}
