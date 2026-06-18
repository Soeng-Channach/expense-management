import { useLocation } from 'react-router-dom';
import { Moon, Sun, TrendingUp } from 'lucide-react';
import { NAV_ITEMS } from './navItems';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/cn';

function usePageTitle() {
  const { pathname } = useLocation();
  const match =
    NAV_ITEMS.find((i) => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)));
  return match?.label ?? 'TrackExpense';
}

export function Header() {
  const title = usePageTitle();
  const { darkMode, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-canvas/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 text-white lg:hidden">
          <TrendingUp className="h-4.5 w-4.5" />
        </div>
        <h1 className="text-lg font-bold text-content sm:text-xl">{title}</h1>
      </div>

      <button
        onClick={toggle}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl border border-border',
          'bg-surface text-content-muted transition hover:text-content hover:bg-surface-muted'
        )}
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}
