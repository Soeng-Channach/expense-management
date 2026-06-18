import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { useChartTheme } from './chartSetup';
import { formatCurrency } from '@/lib/format';

interface MonthlyTrendChartProps {
  labels: string[];
  income: number[];
  expense: number[];
  currency: string;
}

export function MonthlyTrendChart({
  labels,
  income,
  expense,
  currency,
}: MonthlyTrendChartProps) {
  const theme = useChartTheme();

  const chartData = useMemo<ChartData<'bar'>>(
    () => ({
      labels,
      datasets: [
        {
          label: 'Income',
          data: income,
          backgroundColor: '#10b981',
          borderRadius: 6,
          maxBarThickness: 22,
        },
        {
          label: 'Expense',
          data: expense,
          backgroundColor: '#ef4444',
          borderRadius: 6,
          maxBarThickness: 22,
        },
      ],
    }),
    [labels, income, expense]
  );

  const options = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: theme.text,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) =>
              ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0, currency)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: theme.text },
          border: { display: false },
        },
        y: {
          grid: { color: theme.grid },
          ticks: {
            color: theme.text,
            callback: (v) => formatCurrency(Number(v), currency, { compact: true }),
          },
          border: { display: false },
        },
      },
    }),
    [currency, theme]
  );

  return (
    <div className="relative h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}
