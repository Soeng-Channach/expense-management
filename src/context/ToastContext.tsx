import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, { icon: typeof Info; ring: string }> = {
  success: { icon: CheckCircle2, ring: 'text-income' },
  error: { icon: AlertCircle, ring: 'text-expense' },
  info: { icon: Info, ring: 'text-brand-500' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
          {toasts.map((t) => {
            const { icon: Icon, ring } = toneStyles[t.tone];
            return (
              <div
                key={t.id}
                className={cn(
                  'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-border',
                  'bg-surface px-4 py-3 shadow-card-hover animate-slide-up'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', ring)} />
                <p className="flex-1 text-sm font-medium text-content">
                  {t.message}
                </p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-content-muted transition hover:text-content"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
