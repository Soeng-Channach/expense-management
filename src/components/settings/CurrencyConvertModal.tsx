import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { convertCurrency } from '@/db/repository';
import { defaultRate } from '@/lib/currency';
import { formatCurrency, currencySymbol } from '@/lib/format';

interface CurrencyConvertModalProps {
  open: boolean;
  /** Current currency. */
  from: string;
  /** Currency the user picked. */
  to: string;
  onClose: () => void;
}

/**
 * Formats a suggested rate for the input: whole numbers for large rates
 * (e.g. 4100), and enough significant digits for tiny rates (e.g. 0.0002439)
 * so converting back doesn't lose precision.
 */
function formatRate(r: number): string {
  if (r >= 100) return String(Math.round(r));
  if (r >= 1) return String(Number(r.toFixed(4)));
  return String(Number(r.toPrecision(4)));
}

/**
 * Shown when the user picks a different currency. Lets them either convert all
 * stored amounts by an (editable, pre-filled) exchange rate, or just relabel
 * the currency symbol without touching the numbers.
 */
export function CurrencyConvertModal({
  open,
  from,
  to,
  onClose,
}: CurrencyConvertModalProps) {
  const { toast } = useToast();
  const [rate, setRate] = useState('');
  const [busy, setBusy] = useState(false);

  // Pre-fill a suggested rate each time the dialog opens for a new pair.
  useEffect(() => {
    if (!open || !to) return;
    setRate(formatRate(defaultRate(from, to)));
  }, [open, from, to]);

  const rateNum = parseFloat(rate);
  const valid = Number.isFinite(rateNum) && rateNum > 0;
  const sample = 100;

  // Nothing to show until a target currency is chosen (also avoids rendering
  // child expressions with an empty currency code while closing).
  if (!open || !to) return null;

  const handleConvert = async () => {
    if (!valid) return;
    setBusy(true);
    try {
      await convertCurrency(to, rateNum);
      toast(`Amounts converted to ${to}`, 'success');
      onClose();
    } catch {
      toast('Conversion failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleRelabel = async () => {
    setBusy(true);
    try {
      await convertCurrency(to); // no rate → symbol change only
      toast(`Currency set to ${to}`, 'success');
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change currency"
      footer={
        <div className="flex flex-col gap-2">
          <Button fullWidth onClick={handleConvert} loading={busy} disabled={!valid}>
            Convert all amounts
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={handleRelabel}
            disabled={busy}
          >
            Just change symbol (keep numbers)
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 text-sm font-semibold">
          <span className="rounded-lg bg-surface-muted px-3 py-1.5 text-content">
            {currencySymbol(from)} {from}
          </span>
          <ArrowRight className="h-4 w-4 text-content-muted" />
          <span className="rounded-lg bg-brand-50 px-3 py-1.5 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            {currencySymbol(to)} {to}
          </span>
        </div>

        <Input
          label={`Exchange rate  (1 ${from} = ? ${to})`}
          type="number"
          inputMode="decimal"
          step="any"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          hint="Suggested rate — edit it to today's rate before converting."
        />

        {valid && (
          <div className="rounded-xl bg-surface-muted p-4 text-sm text-content-muted">
            For example,{' '}
            <span className="font-semibold text-content">
              {formatCurrency(sample, from)}
            </span>{' '}
            becomes{' '}
            <span className="font-semibold text-content">
              {formatCurrency(sample * rateNum, to)}
            </span>
            .
          </div>
        )}

        <p className="text-xs leading-relaxed text-content-muted">
          <strong className="text-content">Convert all amounts</strong> multiplies
          every transaction and budget by the rate. <strong className="text-content">
            Just change symbol
          </strong>{' '}
          only switches the displayed currency and leaves the numbers as they are.
        </p>
      </div>
    </Modal>
  );
}
