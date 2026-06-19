export interface CurrencyInfo {
  code: string;
  name: string;
}

/** Currencies offered in Settings. */
export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'KHR', name: 'Cambodian Riel' },
  { code: 'KRW', name: 'South Korean Won' },
];

/**
 * Approximate units per 1 USD. These are only used to *pre-fill* the editable
 * exchange-rate field when converting — the app is offline-first and never
 * fetches live rates, so the user confirms/adjusts the rate before converting.
 */
export const RATE_PER_USD: Record<string, number> = {
  USD: 1,
  KHR: 4100,
  KRW: 1370,
};

/** Suggested cross-rate from one currency to another (via USD). */
export function defaultRate(from: string, to: string): number {
  const f = RATE_PER_USD[from] ?? 1;
  const t = RATE_PER_USD[to] ?? 1;
  return t / f;
}

export function currencyName(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.name ?? code;
}
