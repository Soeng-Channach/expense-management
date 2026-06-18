import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  subMonths,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import type { ReportPeriod } from '@/types';

/** Today as an ISO date string (yyyy-MM-dd), used as the form default. */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Current month key, e.g. "2026-06". */
export function currentMonthKey(): string {
  return format(new Date(), 'yyyy-MM');
}

export function monthKey(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM');
}

export function formatDateLabel(date: string): string {
  return format(parseISO(date), 'MMM d, yyyy');
}

export function formatMonthLabel(key: string): string {
  return format(parseISO(`${key}-01`), 'MMMM yyyy');
}

export function formatDayLabel(date: string): string {
  return format(parseISO(date), 'EEE, MMM d');
}

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

/** Resolves the [start, end] range + label for a report period anchored on a date. */
export function getPeriodRange(
  period: ReportPeriod,
  anchor: Date = new Date()
): DateRange {
  switch (period) {
    case 'daily':
      return {
        start: startOfDay(anchor),
        end: endOfDay(anchor),
        label: format(anchor, 'EEEE, MMM d, yyyy'),
      };
    case 'weekly':
      return {
        start: startOfWeek(anchor, { weekStartsOn: 1 }),
        end: endOfWeek(anchor, { weekStartsOn: 1 }),
        label: `${format(startOfWeek(anchor, { weekStartsOn: 1 }), 'MMM d')} – ${format(
          endOfWeek(anchor, { weekStartsOn: 1 }),
          'MMM d, yyyy'
        )}`,
      };
    case 'monthly':
      return {
        start: startOfMonth(anchor),
        end: endOfMonth(anchor),
        label: format(anchor, 'MMMM yyyy'),
      };
    case 'yearly':
      return {
        start: startOfYear(anchor),
        end: endOfYear(anchor),
        label: format(anchor, 'yyyy'),
      };
  }
}

export function isDateInRange(date: string, range: DateRange): boolean {
  return isWithinInterval(parseISO(date), { start: range.start, end: range.end });
}

/** Returns the last `count` month keys ending with the current month (oldest first). */
export function lastMonths(count: number): { key: string; label: string }[] {
  const now = new Date();
  return eachMonthOfInterval({
    start: subMonths(startOfMonth(now), count - 1),
    end: startOfMonth(now),
  }).map((d) => ({ key: format(d, 'yyyy-MM'), label: format(d, 'MMM') }));
}
