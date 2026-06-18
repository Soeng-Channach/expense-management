import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useSettings } from '@/hooks/useSettings';

interface ThemeContextValue {
  darkMode: boolean;
  toggle: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, loading, update } = useSettings();
  const initRef = useRef(false);

  // One-time: adopt the OS color-scheme preference on a brand-new install.
  useEffect(() => {
    if (loading || initRef.current) return;
    initRef.current = true;
    if (localStorage.getItem('te-theme') === null) {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      if (prefersDark !== settings.darkMode) update({ darkMode: prefersDark });
    }
  }, [loading, settings.darkMode, update]);

  // Keep the <html> class and the pre-paint localStorage flag in sync.
  useEffect(() => {
    if (loading) return;
    document.documentElement.classList.toggle('dark', settings.darkMode);
    localStorage.setItem('te-theme', settings.darkMode ? 'dark' : 'light');
  }, [loading, settings.darkMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      darkMode: settings.darkMode,
      toggle: () => update({ darkMode: !settings.darkMode }),
      setDarkMode: (v: boolean) => update({ darkMode: v }),
    }),
    [settings.darkMode, update]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
