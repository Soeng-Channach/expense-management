import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last-resort boundary around the whole app. A render error anywhere would
 * otherwise blank the screen; here we show a recoverable fallback and reassure
 * the user that their (local-only) data is untouched. Intentionally has no
 * router/provider dependencies so it still renders if those are what failed.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface the error for debugging; there is no remote logging by design.
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  private handleReload = () => {
    this.setState({ error: null });
    window.location.assign('/');
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-expense/10 text-expense">
          <AlertTriangle className="h-7 w-7" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-lg font-semibold text-content">Something went wrong</h1>
          <p className="mx-auto max-w-sm text-sm text-content-muted">
            The app hit an unexpected error. Your data is safe — it&apos;s stored
            locally on this device and was not affected.
          </p>
        </div>
        <Button onClick={this.handleReload}>Reload app</Button>
      </div>
    );
  }
}
