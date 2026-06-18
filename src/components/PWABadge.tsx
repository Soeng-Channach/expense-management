import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

/**
 * Shows a prompt to reload when a new service worker is waiting, and a brief
 * "ready to work offline" confirmation on first install.
 */
export function PWABadge() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed inset-x-4 top-20 z-50 mx-auto max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-card-hover animate-slide-up lg:left-auto lg:right-8 lg:mx-0">
      <div className="flex items-start gap-3">
        <p className="flex-1 text-sm font-medium text-content">
          {needRefresh
            ? 'A new version is available.'
            : 'App ready to work offline.'}
        </p>
        <button
          onClick={close}
          aria-label="Dismiss"
          className="text-content-muted transition hover:text-content"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {needRefresh && (
        <button
          onClick={() => updateServiceWorker(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reload
        </button>
      )}
    </div>
  );
}
