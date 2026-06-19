import { describe, it, expect } from 'vitest';
import { defaultRate, currencyName, RATE_PER_USD } from './currency';

describe('defaultRate', () => {
  it('returns 1 when converting a currency to itself', () => {
    expect(defaultRate('USD', 'USD')).toBe(1);
  });

  it('uses the USD pivot for a direct conversion', () => {
    expect(defaultRate('USD', 'KHR')).toBe(RATE_PER_USD.KHR);
  });

  it('computes a cross-rate via USD', () => {
    // KHR -> KRW should equal (KRW per USD) / (KHR per USD)
    expect(defaultRate('KHR', 'KRW')).toBeCloseTo(
      RATE_PER_USD.KRW / RATE_PER_USD.KHR
    );
  });

  it('treats unknown currencies as a 1:1 pivot', () => {
    expect(defaultRate('ZZZ', 'USD')).toBe(1);
  });
});

describe('currencyName', () => {
  it('resolves a known code to its display name', () => {
    expect(currencyName('USD')).toBe('US Dollar');
  });

  it('returns the code itself when unknown', () => {
    expect(currencyName('ZZZ')).toBe('ZZZ');
  });
});
