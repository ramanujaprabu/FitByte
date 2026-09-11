/**
 * FitByte — Nutrition Service
 *
 * Reads/writes `food_entries` and `daily_logs`. Daily nutrition totals are
 * computed by summing that day's food entries against the user's
 * `calorie_targets` / active `fitness_goals` macro targets, rather than
 * being stored redundantly.
 */
import { supabase } from '@/lib/supabase';
import type { DailyNutrition, FoodEntry, NutritionDay, AIInsight, ConsistencyLevel, MacroTarget } from '@/types';
import { dedupeFoodEntriesByName } from '@/utils/format';

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

function dayRange(dateStr?: string) {
  const day = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return { start, end, isoDate: start.toISOString().slice(0, 10) };
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
    imageUrl: row.image_url ?? '',
  };
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

    // Merge offline cache meals (scoped to the current user only)
    const offlineMeals = userId ? await offlineStorage.getOfflineFoods(userId) : [];
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
    try {
      userId = await currentUserId();
      const { start, end } = dayRange(date);
      const { data } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', start.toISOString())
        .lte('logged_at', end.toISOString())
        .order('logged_at', { ascending: false });
      if (data) remoteLogs = data.map(mapFoodEntry);
    } catch {}

    const offlineLogs = userId ? await offlineStorage.getOfflineFoods(userId) : [];
    const map = new Map<string, FoodEntry>();
    remoteLogs.forEach(l => map.set(l.id, l));
    offlineLogs.forEach(l => { if (!map.has(l.id)) map.set(l.id, l); });
    return Array.from(map.values());
  },

  /** Log a new food entry — typically fed from a `foodService.search()` result. */
  async logFood(entry: Omit<FoodEntry, 'id'>): Promise<FoodEntry> {
    const userId = await currentUserId();
    const createdId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newEntry: FoodEntry = {
      id: createdId,
      ...entry,
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

  /** Monthly heatmap — buckets each day's calorie total into a consistency level. */
  async getNutritionHeatmap(month?: number, year?: number): Promise<NutritionDay[]> {
    const userId = await currentUserId();
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = month ?? now.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);

    const [{ data: entries, error }, { data: target }] = await Promise.all([
      supabase
        .from('food_entries')
        .select('calories, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', start.toISOString())
        .lte('logged_at', end.toISOString()),
      supabase.from('calorie_targets').select('daily').eq('user_id', userId).maybeSingle(),
    ]);
    if (error) throw error;

    const goal = target?.daily ?? 2000;
    const totalsByDay = new Map<number, number>();
    for (const e of entries ?? []) {
      const day = new Date(e.logged_at).getDate();
      totalsByDay.set(day, (totalsByDay.get(day) ?? 0) + Number(e.calories));
    }

    const daysInMonth = end.getDate();
    const result: NutritionDay[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const total = totalsByDay.get(day) ?? 0;
      const ratio = total / goal;
      let level: ConsistencyLevel = 'empty';
      if (ratio >= 0.9) level = 'high';
      else if (ratio >= 0.5) level = 'mid';
      else if (ratio > 0) level = 'low';
      result.push({ date: day, level });
    }
    return result;
  },

  /**
   * Real (non-heatmap) 7-day nutrition summary: daily calorie totals, averages
   * for calories/macros, the week-over-week calorie delta, and the active
   * macro/calorie targets — used by the analytics screens instead of any
   * placeholder numbers.
   */
  async getWeeklySummary(): Promise<{
    days: { label: string; date: string; calories: number }[];
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFats: number;
    calorieGoal: number;
    macroTargets: MacroTarget;
    calorieDeltaPercent: number | null;
  }> {
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 13);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let calorieGoal = 2000;
    let macroTargets: MacroTarget = { protein: 150, carbs: 200, fats: 70 };
    const dayTotals = new Map<string, { cal: number; p: number; c: number; f: number }>();

    try {
      const userId = await currentUserId();
      const [{ data: entries }, { data: target }, { data: goal }] = await Promise.all([
        supabase
          .from('food_entries')
          .select('calories, protein, carbs, fats, logged_at')
          .eq('user_id', userId)
          .gte('logged_at', start.toISOString())
          .lte('logged_at', end.toISOString()),
        supabase.from('calorie_targets').select('daily').eq('user_id', userId).maybeSingle(),
        supabase
          .from('fitness_goals')
          .select('macro_protein, macro_carbs, macro_fats')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle(),
      ]);

      if (target?.daily) calorieGoal = target.daily;
      if (goal) {
        macroTargets = { protein: goal.macro_protein, carbs: goal.macro_carbs, fats: goal.macro_fats };
      }

      for (const e of entries ?? []) {
        const key = new Date(e.logged_at).toISOString().slice(0, 10);
        const t = dayTotals.get(key) ?? { cal: 0, p: 0, c: 0, f: 0 };
        t.cal += Number(e.calories);
        t.p += Number(e.protein);
        t.c += Number(e.carbs);
        t.f += Number(e.fats);
        dayTotals.set(key, t);
      }
    } catch {
      // No connection / not authenticated — fall through with empty totals.
    }

    const dateKey = (daysAgo: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return { key: d.toISOString().slice(0, 10), label: dayLabels[d.getDay()] };
    };

    const days = Array.from({ length: 7 }, (_, i) => {
      const { key, label } = dateKey(6 - i);
      return { label, date: key, calories: Math.round(dayTotals.get(key)?.cal ?? 0) };
    });
    const previousWeekCalories = Array.from({ length: 7 }, (_, i) => dayTotals.get(dateKey(13 - i).key)?.cal ?? 0);

    const loggedThisWeek = days.filter((d) => d.calories > 0);
    const avg = (vals: number[]) => (vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0);

    const avgCalories = avg(loggedThisWeek.map((d) => d.calories));
    const thisWeekTotals = loggedThisWeek
      .map((d) => dayTotals.get(d.date))
      .filter((t): t is { cal: number; p: number; c: number; f: number } => !!t);
    const avgProtein = avg(thisWeekTotals.map((t) => t.p));
    const avgCarbs = avg(thisWeekTotals.map((t) => t.c));
    const avgFats = avg(thisWeekTotals.map((t) => t.f));

    const prevLoggedDays = previousWeekCalories.filter((c) => c > 0);
    const prevAvg = prevLoggedDays.length ? prevLoggedDays.reduce((s, v) => s + v, 0) / prevLoggedDays.length : null;
    const calorieDeltaPercent =
      prevAvg && avgCalories ? Math.round(((avgCalories - prevAvg) / prevAvg) * 100) : null;

    return { days, avgCalories, avgProtein, avgCarbs, avgFats, calorieGoal, macroTargets, calorieDeltaPercent };
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
  },
};
