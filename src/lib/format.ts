/** Currency + number formatting helpers. */

export function formatCurrency(
  amount: number,
  currency = 'USD',
  opts: { signed?: boolean; compact?: boolean } = {}
): string {
  const { signed = false, compact = false } = opts;
  const fractionDigits = {
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
    notation: compact ? ('compact' as const) : ('standard' as const),
  };
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      ...fractionDigits,
    }).format(Math.abs(amount));
  } catch {
    // Unknown/empty currency code — fall back to a plain formatted number.
    formatted = new Intl.NumberFormat(undefined, fractionDigits).format(
      Math.abs(amount)
    );
  }
  if (signed && amount !== 0) return `${amount > 0 ? '+' : '−'}${formatted}`;
  return formatted;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

/**
 * Symbols for currencies where the JS `Intl` engine returns the ISO code
 * instead of the local symbol (e.g. Khmer Riel).
 */
const SYMBOL_OVERRIDES: Record<string, string> = {
  KHR: '៛',
};

/** Returns the currency symbol for a code (best-effort, falls back to code). */
export function currencySymbol(currency = 'USD'): string {
  if (SYMBOL_OVERRIDES[currency]) return SYMBOL_OVERRIDES[currency];
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
