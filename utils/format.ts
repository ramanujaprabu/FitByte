/**
 * FitByte — Utility/formatting functions.
 * Pure functions for display formatting — no side effects.
 */
import type { FoodEntry, MealType } from '@/types';

export interface GroupedFoodEntry {
  key: string;
  name: string;
  meal: MealType;
  count: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  imageUrl: string;
  latestTime: string;
  ids: string[];
}

const MEAL_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

/**
 * Groups food entries first by meal (Breakfast/Lunch/Dinner/Snacks, in that
 * order) and then collapses repeats of the same food within a meal into one
 * row with a count (e.g. "Grilled Chicken x4") instead of listing each
 * identical entry separately.
 */
export function groupFoodEntriesByMeal(entries: FoodEntry[]): { meal: MealType; items: GroupedFoodEntry[] }[] {
  const byMeal = new Map<MealType, Map<string, GroupedFoodEntry>>();

  for (const entry of entries) {
    if (!byMeal.has(entry.meal)) byMeal.set(entry.meal, new Map());
    const group = byMeal.get(entry.meal)!;
    const existing = group.get(entry.name);
    if (existing) {
      existing.count += 1;
      existing.totalCalories += entry.calories;
      existing.totalProtein += entry.protein;
      existing.totalCarbs += entry.carbs;
      existing.totalFats += entry.fats;
      existing.ids.push(entry.id);
    } else {
      group.set(entry.name, {
        key: `${entry.meal}-${entry.name}`,
        name: entry.name,
        meal: entry.meal,
        count: 1,
        totalCalories: entry.calories,
        totalProtein: entry.protein,
        totalCarbs: entry.carbs,
        totalFats: entry.fats,
        imageUrl: entry.imageUrl,
        latestTime: entry.time,
        ids: [entry.id],
      });
    }
  }

  return MEAL_ORDER.filter((m) => byMeal.has(m)).map((m) => ({
    meal: m,
    items: Array.from(byMeal.get(m)!.values()),
  }));
}

/**
 * Collapses repeats of the same food name down to one row — for lists like
 * "Recently Logged" where seeing "Banana" three times in a row is just
 * noise. Keeps the first (most recent, given the usual sort order)
 * occurrence of each name.
 */
export function dedupeFoodEntriesByName(entries: FoodEntry[]): FoodEntry[] {
  const seen = new Set<string>();
  const result: FoodEntry[] = [];
  for (const entry of entries) {
    if (seen.has(entry.name)) continue;
    seen.add(entry.name);
    result.push(entry);
  }
  return result;
}

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
