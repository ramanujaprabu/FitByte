/**
 * FitByte — Nutrition Service
 *
<<<<<<< HEAD
 * Reads/writes `food_entries` and `daily_logs`. Daily nutrition totals are
 * computed by summing that day's food entries against the user's
 * `calorie_targets` / active `fitness_goals` macro targets, rather than
 * being stored redundantly.
 */
import { supabase } from '@/lib/supabase';
import type { DailyNutrition, FoodEntry, AIInsight, MacroTarget, MealType, PeriodBucket, PeriodSummary } from '@/types';
import { dedupeFoodEntriesByName } from '@/utils/format';
import { isoDate, periodRange, previousPeriodRange, type Period } from '@/utils/period';

/**
 * Reads the locally cached session instead of `getUser()` — this needs to
 * work without a network round-trip so offline-first logging (saving to the
 * per-user cache before attempting the Supabase write) doesn't itself
 * require connectivity to find out who the current user even is.
 */
async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Not authenticated');
  return data.session.user.id;
}

/**
 * Resolves a day's [start, end] bounds in LOCAL time. `dateStr` may be a
 * full ISO datetime (e.g. from `Date.toISOString()`) or a bare 'YYYY-MM-DD'
 * date. Bare date-only strings are deliberately NOT passed to `new Date()`
 * directly — JS parses those as UTC midnight, which rolls to the previous
 * or next local day for any timezone ahead of or behind UTC (e.g. a food
 * logged at 1am IST would land on the wrong day everywhere in this app).
 */
function dayRange(dateStr?: string) {
  let day: Date;
  if (!dateStr) {
    day = new Date();
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    day = new Date(y, m - 1, d);
  } else {
    day = new Date(dateStr);
  }
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  const isoDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  return { start, end, isoDate };
}

function mapFoodEntry(row: any): FoodEntry {
  return {
    id: row.id,
    name: row.name,
    meal: row.meal,
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fats: Number(row.fats),
    time: new Date(row.logged_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    loggedAt: row.logged_at,
    imageUrl: row.image_url ?? '',
  };
}

/** Keeps only offline-cached entries that fall within [start, end] — without this, every offline entry ever logged shows up on every day's log. */
function withinDay(entries: FoodEntry[], start: Date, end: Date): FoodEntry[] {
  return entries.filter((e) => {
    const t = new Date(e.loggedAt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MEAL_BUCKET_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

/**
 * The chart buckets for the calorie bar — what they represent changes with
 * the period: a day breaks down by meal (there's only one day to show), a
 * week shows its 7 days, and a month shows its Sunday-Saturday weeks
 * (splitting a whole month into ~30 daily bars wouldn't fit on a phone).
 */
function buildBuckets(
  period: Period,
  start: Date,
  end: Date,
  byDay: Map<string, { cal: number; p: number; c: number; f: number }>,
  entries: { meal: MealType; calories: number; logged_at: string }[]
): PeriodBucket[] {
  if (period === 'day') {
    const totals = new Map<MealType, number>();
    for (const e of entries) totals.set(e.meal, (totals.get(e.meal) ?? 0) + Number(e.calories));
    return MEAL_BUCKET_ORDER.map((meal) => ({
      label: meal.slice(0, 3),
      date: isoDate(start),
      calories: Math.round(totals.get(meal) ?? 0),
    }));
  }

  if (period === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = isoDate(d);
      return { label: DAY_LETTERS[d.getDay()], date: key, calories: Math.round(byDay.get(key)?.cal ?? 0) };
    });
  }

  // month — bucket by Sunday-aligned week within the month.
  const buckets: PeriodBucket[] = [];
  let cursor = new Date(start);
  let weekIndex = 1;
  while (cursor <= end) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + (6 - weekStart.getDay()));
    const clampedEnd = weekEnd > end ? end : weekEnd;

    let total = 0;
    for (let d = new Date(weekStart); d <= clampedEnd; d.setDate(d.getDate() + 1)) {
      total += byDay.get(isoDate(d))?.cal ?? 0;
    }
    buckets.push({ label: `W${weekIndex}`, date: isoDate(weekStart), calories: Math.round(total) });

    cursor = new Date(clampedEnd);
    cursor.setDate(cursor.getDate() + 1);
    weekIndex += 1;
  }
  return buckets;
}

import { offlineStorage } from '@/lib/offline-storage';

export const nutritionService = {
  async getDailyNutrition(date?: string): Promise<DailyNutrition> {
    const { start, end, isoDate } = dayRange(date);
    let remoteMeals: FoodEntry[] = [];
    let macroTargets = { macro_protein: 150, macro_carbs: 200, macro_fats: 70 };
    let calorieGoal = 2000;
    let waterGlasses = 0;
    let waterGoal = 8;
    let nutritionScore = 0;
    let userId: string | null = null;

    try {
      userId = await currentUserId();
      const [entriesRes, targetRes, goalRes, logRes] = await Promise.all([
        supabase
          .from('food_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('logged_at', start.toISOString())
          .lte('logged_at', end.toISOString())
          .order('logged_at', { ascending: true }),
        supabase.from('calorie_targets').select('*').eq('user_id', userId).maybeSingle(),
        supabase
          .from('fitness_goals')
          .select('macro_protein, macro_carbs, macro_fats')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle(),
        supabase.from('daily_logs').select('*').eq('user_id', userId).eq('log_date', isoDate).maybeSingle(),
      ]);

      if (entriesRes.data) {
        remoteMeals = entriesRes.data.map(mapFoodEntry);
      }
      if (goalRes.data) {
        macroTargets = goalRes.data;
      }
      if (targetRes.data?.daily) {
        calorieGoal = targetRes.data.daily;
      }
      if (logRes.data) {
        waterGlasses = logRes.data.water_glasses ?? 0;
        waterGoal = logRes.data.water_goal ?? 8;
        nutritionScore = logRes.data.nutrition_score ?? 0;
      }
    } catch {
      // Offline fallback
    }

    // Merge offline cache meals (scoped to the current user AND this day —
    // otherwise every offline-logged entry ever would show up on every day).
    const offlineMealsAll = userId ? await offlineStorage.getOfflineFoods(userId) : [];
    const offlineMeals = withinDay(offlineMealsAll, start, end);
    const mealMap = new Map<string, FoodEntry>();
    remoteMeals.forEach(m => mealMap.set(m.id, m));
    offlineMeals.forEach(m => {
      if (!mealMap.has(m.id)) mealMap.set(m.id, m);
    });

    const meals = Array.from(mealMap.values());
    const caloriesConsumed = meals.reduce((s, m) => s + m.calories, 0);
    const proteinConsumed = meals.reduce((s, m) => s + m.protein, 0);
    const carbsConsumed = meals.reduce((s, m) => s + m.carbs, 0);
    const fatsConsumed = meals.reduce((s, m) => s + m.fats, 0);

    return {
      date: start.toISOString(),
      caloriesConsumed,
      calorieGoal,
      macros: {
        protein: { consumed: proteinConsumed, target: macroTargets.macro_protein },
        carbs: { consumed: carbsConsumed, target: macroTargets.macro_carbs },
        fats: { consumed: fatsConsumed, target: macroTargets.macro_fats },
      },
      waterGlasses,
      waterGoal,
      meals,
      nutritionScore,
    };
  },

  /**
   * Recently logged foods, collapsed to one row per unique name (looks
   * across recent history, not just today — otherwise "recent" would be
   * empty every day until you'd logged something) — for quick re-adding.
   */
  async getRecentUniqueFoods(limit = 5): Promise<FoodEntry[]> {
    try {
      const userId = await currentUserId();
      const { data } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(100);
      const mapped = (data ?? []).map(mapFoodEntry);
      return dedupeFoodEntriesByName(mapped).slice(0, limit);
    } catch {
      return [];
    }
  },

  /**
   * The current user's own most-repeated food names, from their real
   * logging history — not seed/sample data. Ties broken by most recent.
   */
  async getFrequentFoods(limit = 8): Promise<
    { name: string; calories: number; protein: number; carbs: number; fats: number; count: number }[]
  > {
    try {
      const userId = await currentUserId();
      const { data } = await supabase
        .from('food_entries')
        .select('name, calories, protein, carbs, fats')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(300);

      const counts = new Map<string, { name: string; calories: number; protein: number; carbs: number; fats: number; count: number }>();
      for (const row of data ?? []) {
        const existing = counts.get(row.name);
        if (existing) {
          existing.count += 1;
        } else {
          counts.set(row.name, {
            name: row.name,
            calories: Number(row.calories),
            protein: Number(row.protein),
            carbs: Number(row.carbs),
            fats: Number(row.fats),
            count: 1,
          });
        }
      }
      return Array.from(counts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch {
      return [];
    }
  },

  async getFoodLog(date?: string): Promise<FoodEntry[]> {
    let remoteLogs: FoodEntry[] = [];
    let userId: string | null = null;
    const { start, end } = dayRange(date);
    try {
      userId = await currentUserId();
      const { data } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', start.toISOString())
        .lte('logged_at', end.toISOString())
        .order('logged_at', { ascending: false });
      if (data) remoteLogs = data.map(mapFoodEntry);
    } catch {}

    const offlineLogsAll = userId ? await offlineStorage.getOfflineFoods(userId) : [];
    const offlineLogs = withinDay(offlineLogsAll, start, end);
    const map = new Map<string, FoodEntry>();
    remoteLogs.forEach(l => map.set(l.id, l));
    offlineLogs.forEach(l => { if (!map.has(l.id)) map.set(l.id, l); });
    return Array.from(map.values());
  },

  /**
   * Log a new food entry — typically fed from a `foodService.search()`
   * result. Pass `loggedAt` to log to a specific day (e.g. from the Home
   * tab's date navigator); defaults to right now.
   */
  async logFood(entry: Omit<FoodEntry, 'id' | 'loggedAt' | 'time'>, loggedAt: Date = new Date()): Promise<FoodEntry> {
    const userId = await currentUserId();
    const createdId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newEntry: FoodEntry = {
      id: createdId,
      ...entry,
      loggedAt: loggedAt.toISOString(),
      time: loggedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };

    // 1. Save to offline local storage immediately for 100% instant UI availability
    await offlineStorage.saveOfflineFood(userId, newEntry);

    // 2. Insert into Supabase if online
    try {
      const { data, error } = await supabase
        .from('food_entries')
        .insert({
          user_id: userId,
          name: entry.name,
          meal: entry.meal,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fats: entry.fats,
          image_url: entry.imageUrl,
          logged_at: loggedAt.toISOString(),
        })
        .select()
        .single();
      if (!error && data) {
        // The Supabase row gets its own id, different from the offline
        // stand-in's — remove the stand-in now that the real row exists, or
        // every synced entry would be counted twice (offline copy + server
        // row) on every future read.
        await offlineStorage.removeOfflineFood(userId, createdId);
        return mapFoodEntry(data);
      }
    } catch {
      // Offline fallback already stored
    }
    return newEntry;
  },

  /** Fetches one logged entry by id — checks Supabase first, then the offline cache. */
  async getFoodEntry(id: string): Promise<FoodEntry | null> {
    const userId = await currentUserId();
    try {
      const { data } = await supabase
        .from('food_entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
      if (data) return mapFoodEntry(data);
    } catch {
      // Offline fallback below
    }
    const offlineMeals = await offlineStorage.getOfflineFoods(userId);
    return offlineMeals.find((m) => m.id === id) ?? null;
  },

  async deleteFood(id: string): Promise<void> {
    const userId = await currentUserId();
    await offlineStorage.removeOfflineFood(userId, id);
    try {
      const { error } = await supabase.from('food_entries').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
    } catch {
      // Nothing more to do if it was only an offline-cached entry.
    }
  },

  /** Sets today's (or a given date's) logged water glasses; upserts the daily_logs row. */
  async setWaterGlasses(glasses: number, date?: string): Promise<void> {
    const userId = await currentUserId();
    const { isoDate } = dayRange(date);
    const { error } = await supabase
      .from('daily_logs')
      .upsert({ user_id: userId, log_date: isoDate, water_glasses: glasses }, { onConflict: 'user_id,log_date' });
    if (error) throw error;
  },

  /**
   * The single source of truth for the Trends tab's Day/Week/Month views:
   * real calorie/macro buckets (meals for a day, days for a week, weeks for
   * a month), averages, the vs-previous-period delta, meal-split actual vs
   * target, top foods, and net calories (consumed − burned via workouts).
   * Nothing here is a placeholder — every number comes from this user's own
   * logged data, or the real targets set in onboarding/Profile.
   */
  async getPeriodSummary(period: Period, referenceDate: Date = new Date()): Promise<PeriodSummary> {
    const { start, end, rangeLabel } = periodRange(period, referenceDate);
    const prev = previousPeriodRange(period, referenceDate);

    let calorieGoal = 2000;
    let macroTargets: MacroTarget = { protein: 150, carbs: 200, fats: 70 };
    let mealSplit: Record<string, number> = { Breakfast: 25, Lunch: 35, Dinner: 30, Snacks: 10 };
    let entries: any[] = [];
    let prevEntries: any[] = [];
    let caloriesBurned = 0;

    try {
      const userId = await currentUserId();
      const [entriesRes, prevEntriesRes, targetRes, goalRes, sessionsRes] = await Promise.all([
        supabase
          .from('food_entries')
          .select('name, meal, calories, protein, carbs, fats, logged_at')
          .eq('user_id', userId)
          .gte('logged_at', start.toISOString())
          .lte('logged_at', end.toISOString()),
        supabase
          .from('food_entries')
          .select('calories, logged_at')
          .eq('user_id', userId)
          .gte('logged_at', prev.start.toISOString())
          .lte('logged_at', prev.end.toISOString()),
        supabase.from('calorie_targets').select('daily').eq('user_id', userId).maybeSingle(),
        supabase
          .from('fitness_goals')
          .select('macro_protein, macro_carbs, macro_fats, meal_split')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle(),
        supabase
          .from('workout_sessions')
          .select('calories_burned')
          .eq('user_id', userId)
          .gte('performed_at', start.toISOString())
          .lte('performed_at', end.toISOString()),
      ]);

      entries = entriesRes.data ?? [];
      prevEntries = prevEntriesRes.data ?? [];
      if (targetRes.data?.daily) calorieGoal = targetRes.data.daily;
      if (goalRes.data) {
        macroTargets = { protein: goalRes.data.macro_protein, carbs: goalRes.data.macro_carbs, fats: goalRes.data.macro_fats };
        if (goalRes.data.meal_split && Object.keys(goalRes.data.meal_split).length > 0) mealSplit = goalRes.data.meal_split;
      }
      caloriesBurned = (sessionsRes.data ?? []).reduce((s: number, r: any) => s + (r.calories_burned ?? 0), 0);
    } catch {
      // No connection / not authenticated — fall through with empty data.
    }

    // Per-day totals across the whole range — used for the week/month bucket
    // charts AND for daysOnTarget, so a 31-day month only costs one query.
    const byDay = new Map<string, { cal: number; p: number; c: number; f: number }>();
    for (const e of entries) {
      const key = isoDate(new Date(e.logged_at));
      const t = byDay.get(key) ?? { cal: 0, p: 0, c: 0, f: 0 };
      t.cal += Number(e.calories);
      t.p += Number(e.protein);
      t.c += Number(e.carbs);
      t.f += Number(e.fats);
      byDay.set(key, t);
    }

    const buckets: PeriodBucket[] = buildBuckets(period, start, end, byDay, entries);

    const loggedDays = Array.from(byDay.values());
    const avg = (vals: number[]) => (vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0);
    const totalCalories = Math.round(loggedDays.reduce((s, d) => s + d.cal, 0));
    const avgCalories = avg(loggedDays.map((d) => Math.round(d.cal)));
    const avgProtein = avg(loggedDays.map((d) => Math.round(d.p)));
    const avgCarbs = avg(loggedDays.map((d) => Math.round(d.c)));
    const avgFats = avg(loggedDays.map((d) => Math.round(d.f)));

    const daysOnTarget = loggedDays.filter((d) => calorieGoal > 0 && d.cal >= calorieGoal * 0.85 && d.cal <= calorieGoal * 1.1).length;
    const totalDaysElapsed = Math.min(
      Math.floor((Math.min(end.getTime(), Date.now()) - start.getTime()) / 86_400_000) + 1,
      Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1
    );

    const prevTotal = prevEntries.reduce((s, e) => s + Number(e.calories), 0);
    const prevDaysLogged = new Set(prevEntries.map((e) => isoDate(new Date(e.logged_at)))).size;
    const prevAvg = prevDaysLogged ? prevTotal / prevDaysLogged : null;
    const calorieDeltaPercent = prevAvg && avgCalories ? Math.round(((avgCalories - prevAvg) / prevAvg) * 100) : null;

    // Meal split — actual share of calories per meal, vs the user's planned split.
    const mealTotals = new Map<MealType, number>();
    for (const e of entries) {
      mealTotals.set(e.meal, (mealTotals.get(e.meal) ?? 0) + Number(e.calories));
    }
    const mealBreakdown = (['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealType[])
      .filter((m) => mealSplit[m] != null)
      .map((meal) => {
        const cal = mealTotals.get(meal) ?? 0;
        return {
          meal,
          calories: Math.round(cal),
          actualPercent: totalCalories > 0 ? Math.round((cal / totalCalories) * 100) : 0,
          targetPercent: Math.round(mealSplit[meal] ?? 0),
        };
      });

    // Top foods — aggregated by name across the period.
    const foodTotals = new Map<string, { name: string; calories: number; protein: number; count: number }>();
    for (const e of entries) {
      const existing = foodTotals.get(e.name);
      if (existing) {
        existing.calories += Number(e.calories);
        existing.protein += Number(e.protein);
        existing.count += 1;
      } else {
        foodTotals.set(e.name, { name: e.name, calories: Number(e.calories), protein: Number(e.protein), count: 1 });
      }
    }
    const foodList = Array.from(foodTotals.values());
    const topFoodsByCalories = [...foodList].sort((a, b) => b.calories - a.calories).slice(0, 5)
      .map((f) => ({ name: f.name, calories: Math.round(f.calories), count: f.count }));
    const topFoodsByProtein = [...foodList].filter((f) => f.protein > 0).sort((a, b) => b.protein - a.protein).slice(0, 5)
      .map((f) => ({ name: f.name, protein: Math.round(f.protein), count: f.count }));

    return {
      period,
      rangeLabel,
      buckets,
      totalCalories,
      avgCalories,
      calorieGoal,
      daysLogged: loggedDays.length,
      daysOnTarget,
      totalDays: Math.max(1, totalDaysElapsed),
      calorieDeltaPercent,
      avgProtein,
      avgCarbs,
      avgFats,
      macroTargets,
      mealBreakdown,
      topFoodsByCalories,
      topFoodsByProtein,
      caloriesBurned: Math.round(caloriesBurned),
      netCalories: Math.round(totalCalories - caloriesBurned),
    };
  },

  async getAIInsights(): Promise<AIInsight[]> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      type: row.type,
      text: row.text,
      icon: row.icon,
    }));
=======
 * Bridges the UI layer to nutrition data.
 * Currently returns mock data. Replace implementations with real API calls.
 *
 * @todo Wire to: REST /nutrition/* or GraphQL nutrition queries
 */

import type { DailyNutrition, FoodEntry, NutritionDay, AIInsight } from '@/types';
import {
  MOCK_DAILY_NUTRITION,
  MOCK_FOOD_LOG,
  generateNutritionHeatmap,
  MOCK_AI_INSIGHTS,
} from '@/data/nutrition';

export const nutritionService = {
  /**
   * Get nutrition summary for a specific date.
   * @todo Replace with: GET /nutrition/daily?date={date}
   */
  async getDailyNutrition(date?: string): Promise<DailyNutrition> {
    return Promise.resolve(MOCK_DAILY_NUTRITION);
  },

  /**
   * Get all food log entries for a specific date.
   * @todo Replace with: GET /nutrition/log?date={date}
   */
  async getFoodLog(date?: string): Promise<FoodEntry[]> {
    return Promise.resolve(MOCK_FOOD_LOG);
  },

  /**
   * Log a new food entry.
   * @todo Replace with: POST /nutrition/log
   */
  async logFood(entry: Omit<FoodEntry, 'id'>): Promise<FoodEntry> {
    const newEntry: FoodEntry = { ...entry, id: Date.now().toString() };
    return Promise.resolve(newEntry);
  },

  /**
   * Delete a food log entry.
   * @todo Replace with: DELETE /nutrition/log/{id}
   */
  async deleteFood(id: string): Promise<void> {
    return Promise.resolve();
  },

  /**
   * Get monthly nutrition heatmap data.
   * @todo Replace with: GET /nutrition/heatmap?month={month}&year={year}
   */
  async getNutritionHeatmap(month?: number, year?: number): Promise<NutritionDay[]> {
    return Promise.resolve(generateNutritionHeatmap());
  },

  /**
   * Get AI-generated nutrition insights.
   * @todo Replace with: GET /nutrition/insights (calls AI analysis microservice)
   */
  async getAIInsights(): Promise<AIInsight[]> {
    return Promise.resolve(MOCK_AI_INSIGHTS);
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
  },
};
