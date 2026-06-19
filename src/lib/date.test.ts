import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  currentMonthKey,
  monthKey,
  lastMonths,
  getPeriodRange,
  isDateInRange,
} from './date';

// Anchor "now" mid-month, mid-day UTC so the local date is stable across the
// timezones this test might run in (CI = UTC, dev = KST, etc.).
beforeAll(() => vi.setSystemTime(new Date('2026-06-15T12:00:00Z')));
afterAll(() => vi.useRealTimers());

describe('monthKey / currentMonthKey', () => {
  it('derives the yyyy-MM key from an ISO date', () => {
    expect(monthKey('2026-03-10')).toBe('2026-03');
  });

  it('reports the current month', () => {
    expect(currentMonthKey()).toBe('2026-06');
  });
});

describe('lastMonths', () => {
  it('returns the requested count ending with the current month, oldest first', () => {
    const months = lastMonths(6);
    expect(months).toHaveLength(6);
    expect(months[0].key).toBe('2026-01');
    expect(months[5].key).toBe('2026-06');
    expect(months[5].label).toBe('Jun');
  });
});

describe('getPeriodRange', () => {
  it('spans the full month for a monthly period', () => {
    const anchor = new Date(2026, 5, 15); // local June 15
    const { start, end } = getPeriodRange('monthly', anchor);
    expect(start.getMonth()).toBe(5);
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(5);
    expect(end.getDate()).toBe(30);
  });

  it('spans the full year for a yearly period', () => {
    const { start, end } = getPeriodRange('yearly', new Date(2026, 5, 15));
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });
});

describe('isDateInRange', () => {
  it('includes dates within the range and excludes those outside', () => {
    const range = getPeriodRange('monthly', new Date(2026, 5, 15));
    expect(isDateInRange('2026-06-10', range)).toBe(true);
    expect(isDateInRange('2026-07-01', range)).toBe(false);
  });
});
