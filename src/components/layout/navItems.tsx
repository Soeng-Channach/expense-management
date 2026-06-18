import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  Tags,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom navigation. */
  primary: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, primary: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, primary: true },
  { to: '/budget', label: 'Budget', icon: Wallet, primary: true },
  { to: '/reports', label: 'Reports', icon: PieChart, primary: true },
  { to: '/categories', label: 'Categories', icon: Tags, primary: false },
  { to: '/settings', label: 'Settings', icon: Settings, primary: true },
];
