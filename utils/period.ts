/**
 * FitByte — shared Day/Week/Month period math for the analytics (Trends) tab.
 * Week runs Sunday–Saturday; month is the calendar month. Both nutrition
 * and workout services build their period summaries off the same ranges so
 * "this week" means the same thing everywhere in the app.
 */

export type Period = 'day' | 'week' | 'month';

export interface PeriodRange {
  start: Date;
  end: Date;
  rangeLabel: string;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function periodRange(period: Period, referenceDate: Date): PeriodRange {
  const ref = new Date(referenceDate);

  if (period === 'day') {
    const start = startOfDay(ref);
    const end = endOfDay(ref);
    return { start, end, rangeLabel: dayLabel(start) };
  }

  if (period === 'week') {
    const start = startOfDay(ref);
    start.setDate(start.getDate() - start.getDay()); // back to Sunday
    const end = endOfDay(new Date(start));
    end.setDate(end.getDate() + 6);
    const rangeLabel = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    return { start, end, rangeLabel };
  }

  // month
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = endOfDay(new Date(ref.getFullYear(), ref.getMonth() + 1, 0));
  return { start, end, rangeLabel: start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
}

/** The equal-length range immediately before this one — for "vs last period" deltas. */
export function previousPeriodRange(period: Period, referenceDate: Date): PeriodRange {
  return periodRange(period, shiftPeriod(period, referenceDate, -1));
}

export function shiftPeriod(period: Period, referenceDate: Date, direction: 1 | -1): Date {
  const d = new Date(referenceDate);
  if (period === 'day') d.setDate(d.getDate() + direction);
  else if (period === 'week') d.setDate(d.getDate() + direction * 7);
  else d.setMonth(d.getMonth() + direction);
  return d;
}

/** Whether stepping forward from `referenceDate` would move the period into the future. */
export function isCurrentOrFuturePeriod(period: Period, referenceDate: Date): boolean {
  const { start } = periodRange(period, referenceDate);
  const { start: todayStart } = periodRange(period, new Date());
  return start.getTime() >= todayStart.getTime();
}

function dayLabel(d: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
