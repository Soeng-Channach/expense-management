import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Router-level error screen (wired as the root route's `errorElement`). Catches
 * errors thrown while rendering a route so the app shows a recoverable page
 * instead of a blank screen.
 */
export function RouteError() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-expense/10 text-expense">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold text-content">Something went wrong</h1>
        <p className="mx-auto max-w-sm text-sm text-content-muted">{message}</p>
        <p className="text-xs text-content-muted">
          Your data is stored locally and was not affected.
        </p>
      </div>
      <Button onClick={() => window.location.assign('/')}>Back to dashboard</Button>
    </div>
  );
}
