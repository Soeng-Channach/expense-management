import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  currencySymbol,
} from './format';

/** Strip everything but digits so assertions don't depend on the host locale's
 *  grouping/decimal separators or symbol placement. */
const digits = (s: string) => s.replace(/\D/g, '');

describe('formatCurrency', () => {
  it('renders standard amounts with two fraction digits', () => {
    expect(digits(formatCurrency(1234.5, 'USD'))).toBe('123450');
  });

  it('prefixes a + for positive and a minus sign for negative when signed', () => {
    expect(formatCurrency(100, 'USD', { signed: true }).startsWith('+')).toBe(true);
    expect(formatCurrency(-100, 'USD', { signed: true }).startsWith('−')).toBe(true);
  });

  it('does not add a sign for zero even when signed', () => {
    const out = formatCurrency(0, 'USD', { signed: true });
    expect(out.startsWith('+')).toBe(false);
    expect(out.startsWith('−')).toBe(false);
  });

  it('falls back to a plain number for an invalid currency code', () => {
    expect(() => formatCurrency(5, 'NOTACODE')).not.toThrow();
    expect(digits(formatCurrency(5, 'NOTACODE'))).toContain('5');
  });
});

describe('formatPercent', () => {
  it('rounds to whole percent by default', () => {
    expect(formatPercent(33.333)).toBe('33%');
  });

  it('honours the requested fraction digits', () => {
    expect(formatPercent(33.333, 1)).toBe('33.3%');
  });
});

describe('currencySymbol', () => {
  it('uses the override for Khmer Riel', () => {
    expect(currencySymbol('KHR')).toBe('៛');
  });

  it('returns the code unchanged for an invalid currency', () => {
    expect(currencySymbol('NOTACODE')).toBe('NOTACODE');
  });
});
