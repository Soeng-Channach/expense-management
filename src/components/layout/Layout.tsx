import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { FloatingAddButton } from '@/components/FloatingAddButton';
import { InstallPrompt } from '@/components/InstallPrompt';
import { PWABadge } from '@/components/PWABadge';

export function Layout() {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 sm:px-6 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <BottomNav />
      <FloatingAddButton />
      <InstallPrompt />
      <PWABadge />
      <ScrollRestoration />
    </div>
  );
}
