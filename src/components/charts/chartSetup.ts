import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useTheme } from '@/context/ThemeContext';

// Register Chart.js building blocks once for the whole app.
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

ChartJS.defaults.font.family =
  'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

/** Theme-aware colors for axes, grids and tooltips. */
export function useChartTheme() {
  const { darkMode } = useTheme();
  return {
    text: darkMode ? '#94a3b8' : '#64748b',
    grid: darkMode ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.12)',
    tooltipBg: darkMode ? '#1e293b' : '#ffffff',
    tooltipText: darkMode ? '#e2e8f0' : '#0f172a',
    tooltipBorder: darkMode ? '#334155' : '#e2e8f0',
  };
}
