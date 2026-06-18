import { formatCurrency, formatPercent } from '@/lib/format';
import type { CategoryTotal } from '@/types';

interface CategoryBreakdownListProps {
  data: CategoryTotal[];
  currency: string;
  limit?: number;
}

export function CategoryBreakdownList({
  data,
  currency,
  limit,
}: CategoryBreakdownListProps) {
  const items = limit ? data.slice(0, limit) : data;

  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.category}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-content">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.category}
            </span>
            <span className="tabular-nums text-content-muted">
              {formatCurrency(item.total, currency)}
              <span className="ml-1.5 text-xs">
                {formatPercent(item.percentage)}
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(item.percentage, 2)}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
