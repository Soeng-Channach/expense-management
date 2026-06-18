/** Currency + number formatting helpers. */

export function formatCurrency(
  amount: number,
  currency = 'USD',
  opts: { signed?: boolean; compact?: boolean } = {}
): string {
  const { signed = false, compact = false } = opts;
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
    notation: compact ? 'compact' : 'standard',
  });
  const formatted = formatter.format(Math.abs(amount));
  if (signed && amount !== 0) return `${amount > 0 ? '+' : '−'}${formatted}`;
  return formatted;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

/** Returns the currency symbol for a code (best-effort, falls back to code). */
export function currencySymbol(currency = 'USD'): string {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? currency;
  } catch {
    return currency;
  }
}
