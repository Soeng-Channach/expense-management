import { NavLink } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { NAV_ITEMS } from './navItems';
import { cn } from '@/lib/cn';

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-surface">
      <div className="flex h-16 items-center gap-2.5 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-sm">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-content">TrackExpense</p>
          <p className="text-xs text-content-muted">Personal finance</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-content-muted hover:bg-surface-muted hover:text-content'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 text-xs text-content-muted">
        <p className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-income" />
          Offline-ready · Local data
        </p>
      </div>
    </aside>
  );
}
