import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Clapperboard,
  ReceiptText,
  HeartPulse,
  Shapes,
  Wallet,
  Gift,
  TrendingUp,
  Coins,
  Home,
  Plane,
  GraduationCap,
  Dumbbell,
  Coffee,
  Smartphone,
  Fuel,
  PawPrint,
  Baby,
  Shirt,
  Briefcase,
  PiggyBank,
  Landmark,
  CreditCard,
  Tag,
  type LucideIcon,
} from 'lucide-react';

/** Registry of selectable category icons, keyed by name stored in the DB. */
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Clapperboard,
  ReceiptText,
  HeartPulse,
  Shapes,
  Wallet,
  Gift,
  TrendingUp,
  Coins,
  Home,
  Plane,
  GraduationCap,
  Dumbbell,
  Coffee,
  Smartphone,
  Fuel,
  PawPrint,
  Baby,
  Shirt,
  Briefcase,
  PiggyBank,
  Landmark,
  CreditCard,
  Tag,
};

/** Names exposed in the category icon picker. */
export const ICON_NAMES = Object.keys(ICON_REGISTRY);

/** Resolves an icon component by name, falling back to a neutral tag icon. */
export function getIcon(name?: string): LucideIcon {
  return (name && ICON_REGISTRY[name]) || Tag;
}
