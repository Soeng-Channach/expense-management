import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/context/ToastContext';
import { currencySymbol } from '@/lib/format';
import { getIcon } from '@/lib/icons';
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
    control,
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

  const categoryOptions = options.map((c) => {
    const Icon = getIcon(c.icon);
    const color = c.color ?? '#94a3b8';
    return {
      value: c.name,
      label: c.name,
      leading: (
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      ),
    };
  });

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
        // Focusing the first field of a dialog the user opened is expected
        // ARIA dialog behaviour, so autoFocus is intentional here.
        // eslint-disable-next-line jsx-a11y/no-autofocus
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

      <Controller
        control={control}
        name="category"
        rules={{ required: 'Pick a category' }}
        render={({ field }) => (
          <Dropdown
            label="Category"
            value={field.value}
            onChange={field.onChange}
            options={categoryOptions}
            error={errors.category?.message}
            placeholder="Select a category"
          />
        )}
      />

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
