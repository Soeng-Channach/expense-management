import { useRef, useState } from 'react';
import { format } from 'date-fns';
import {
  Moon,
  Download,
  Upload,
  Trash2,
  Coins,
  ShieldCheck,
  Github,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTheme } from '@/context/ThemeContext';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/context/ToastContext';
import {
  exportData,
  importData,
  clearAllData,
  validateBackup,
} from '@/db/repository';
import { downloadJSON, readFileAsText } from '@/lib/download';
import { cn } from '@/lib/cn';
import type { BackupFile } from '@/types';

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SGD', 'BRL',
];

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
        checked ? 'bg-brand-600' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

export function Settings() {
  const { darkMode, toggle } = useTheme();
  const { settings, update } = useSettings();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<BackupFile | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    const data = await exportData();
    downloadJSON(`trackexpense-backup-${format(new Date(), 'yyyy-MM-dd')}.json`, data);
    toast('Data exported', 'success');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    try {
      const parsed = JSON.parse(await readFileAsText(file));
      if (!validateBackup(parsed)) {
        toast('That file is not a valid TrackExpense backup', 'error');
        return;
      }
      setPendingImport(parsed);
    } catch {
      toast('Could not read that file', 'error');
    }
  };

  const confirmImport = async () => {
    if (!pendingImport) return;
    setBusy(true);
    try {
      await importData(pendingImport);
      toast('Data imported successfully', 'success');
    } catch {
      toast('Import failed', 'error');
    } finally {
      setBusy(false);
      setPendingImport(null);
    }
  };

  const handleClear = async () => {
    setBusy(true);
    try {
      await clearAllData();
      toast('All data cleared', 'success');
    } finally {
      setBusy(false);
      setConfirmClear(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Appearance */}
      <Card>
        <CardHeader title="Appearance" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-content-muted">
              <Moon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-content">Dark Mode</p>
              <p className="text-xs text-content-muted">Easier on the eyes at night</p>
            </div>
          </div>
          <Toggle checked={darkMode} onChange={toggle} label="Toggle dark mode" />
        </div>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader title="Preferences" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-content-muted">
              <Coins className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-content">Currency</p>
              <p className="text-xs text-content-muted">Used across the app</p>
            </div>
          </div>
          <div className="w-32">
            <Select
              value={settings.currency}
              onChange={(e) => update({ currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Data management */}
      <Card>
        <CardHeader title="Data" subtitle="Your data lives only on this device" />
        <div className="space-y-3">
          <Button variant="secondary" fullWidth onClick={handleExport}>
            <Download className="h-4.5 w-4.5" /> Export Data to JSON
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4.5 w-4.5" /> Import Data from JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFile}
          />
          <Button variant="danger" fullWidth onClick={() => setConfirmClear(true)}>
            <Trash2 className="h-4.5 w-4.5" /> Clear All Data
          </Button>
        </div>
      </Card>

      {/* About */}
      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-income/10 text-income">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="text-sm">
            <p className="font-medium text-content">100% Private & Offline</p>
            <p className="mt-0.5 text-content-muted">
              No account, no servers, no tracking. Everything is stored locally in
              your browser via IndexedDB and works without an internet connection.
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-content-muted">
              <Github className="h-3.5 w-3.5" /> TrackExpense · v1.0.0
            </p>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={pendingImport !== null}
        title="Import data?"
        message={`This will replace ALL current data with ${pendingImport?.data.transactions.length ?? 0} transactions from the backup. This cannot be undone.`}
        confirmText="Replace & Import"
        tone="primary"
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
        loading={busy}
      />

      <ConfirmDialog
        open={confirmClear}
        title="Clear all data?"
        message="This permanently deletes all transactions, budgets, and custom categories, and restores defaults. This cannot be undone."
        confirmText="Clear everything"
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
        loading={busy}
      />
    </div>
  );
}
