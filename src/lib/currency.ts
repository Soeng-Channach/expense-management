export interface CurrencyInfo {
  code: string;
  name: string;
}

/** Currencies offered in Settings. */
export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'KHR', name: 'Cambodian Riel' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'BRL', name: 'Brazilian Real' },
];

/**
 * Approximate units per 1 USD. These are only used to *pre-fill* the editable
 * exchange-rate field when converting — the app is offline-first and never
 * fetches live rates, so the user confirms/adjusts the rate before converting.
 */
export const RATE_PER_USD: Record<string, number> = {
  USD: 1,
  KHR: 4100,
  VND: 25400,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 156,
  KRW: 1370,
  CNY: 7.2,
  SGD: 1.34,
  INR: 83.5,
  AUD: 1.52,
  CAD: 1.37,
  CHF: 0.88,
  BRL: 5.6,
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
