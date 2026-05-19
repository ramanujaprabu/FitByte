/**
 * FitByte — Utility/formatting functions.
 * Pure functions for display formatting — no side effects.
 */

/** Format a number with commas: 2100 → "2,100" */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/** Format kcal: 2100 → "2,100 kcal" */
export function formatKcal(n: number): string {
  return `${formatNumber(n)} kcal`;
}

/** Format grams: 92 → "92g" */
export function formatGrams(n: number): string {
  return `${n}g`;
}

/** Calculate progress percentage (0–1) */
export function calcProgress(consumed: number, target: number): number {
  return Math.min(consumed / target, 1);
}

/** Format percentage: 0.61 → "61%" */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** Get time-of-day greeting */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/** Format today's date: "May 16, 2026" */
export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format month + year: "May 2026" */
export function formatMonthYear(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
