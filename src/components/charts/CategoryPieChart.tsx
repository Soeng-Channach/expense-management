import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { useChartTheme } from './chartSetup';
import { formatCurrency } from '@/lib/format';
import type { CategoryTotal } from '@/types';

interface CategoryPieChartProps {
  data: CategoryTotal[];
  currency: string;
}

export function CategoryPieChart({ data, currency }: CategoryPieChartProps) {
  const theme = useChartTheme();

  const chartData = useMemo<ChartData<'doughnut'>>(
    () => ({
      labels: data.map((d) => d.category),
      datasets: [
        {
          data: data.map((d) => d.total),
          backgroundColor: data.map((d) => d.color),
          borderColor: theme.tooltipBg,
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [data, theme.tooltipBg]
  );

  const options = useMemo<ChartOptions<'doughnut'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '64%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          displayColors: true,
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed;
              const item = data[ctx.dataIndex];
              return ` ${formatCurrency(value, currency)} (${item.percentage.toFixed(0)}%)`;
            },
          },
        },
      },
    }),
    [data, currency, theme]
  );

  return (
    <div className="relative h-56">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
