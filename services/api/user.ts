/**
 * FitByte — User/Profile Service
 *
 * Reads/writes `profiles`, `body_metrics`, `calorie_targets`, `fitness_goals`,
 * `achievements`. Lifetime `quickStats` are computed on the fly via aggregate
 * queries rather than stored, since they're just rollups of other tables.
 */
import { supabase } from '@/lib/supabase';
import type {
  User,
  BodyMetrics,
  CalorieTarget,
  FitnessGoal,
  Achievement,
  QuickStat,
  ProfileData,
  ActivityLevel,
  BiologicalSex,
  GoalType,
  MealSplit,
} from '@/types';

/** Reads the locally cached session — see nutrition.ts for why this avoids getUser(). */
async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Not authenticated');
  return data.session.user.id;
}

function mapUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatar_url ?? '',
    goal: row.goal ?? '',
    quote: row.quote ?? '',
    level: row.level ?? 1,
    streakDays: row.streak_days ?? 0,
    onboardingCompleted: row.onboarding_completed ?? false,
    age: row.age ?? null,
    sex: row.sex ?? null,
  };
}

function mapBodyMetrics(row: any): BodyMetrics {
  return {
    weight: Number(row.weight),
    goalWeight: Number(row.goal_weight),
    heightCm: Number(row.height_cm ?? 0),
    bodyFatPercent: Number(row.body_fat_percent),
    bmi: Number(row.bmi),
    goalCompletionPercent: Number(row.goal_completion_percent),
  };
}

async function fetchCalorieTarget(userId: string): Promise<CalorieTarget> {
  const { data: target } = await supabase
    .from('calorie_targets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!target) {
    return { daily: 2000, maintenance: 2200, currentPercent: 0 };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: entries } = await supabase
    .from('food_entries')
    .select('calories')
    .eq('user_id', userId)
    .gte('logged_at', startOfDay.toISOString());

  const consumed = (entries ?? []).reduce((sum, e: any) => sum + Number(e.calories), 0);
  const currentPercent = target.daily > 0 ? Math.round((consumed / target.daily) * 100) : 0;

  return { daily: target.daily, maintenance: target.maintenance, currentPercent };
}

async function fetchActiveFitnessGoal(userId: string): Promise<FitnessGoal> {
  const { data, error } = await supabase
    .from('fitness_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  if (!data) {
    return {
      programName: 'No active program',
      completionPercent: 0,
      estimatedMonths: 0,
      macroTargets: { protein: 0, carbs: 0, fats: 0 },
      goalType: null,
      activityLevel: null,
      includesSnacks: true,
      mealSplit: {},
    };
  }

  return {
    programName: data.program_name,
    completionPercent: Number(data.completion_percent),
    estimatedMonths: Number(data.estimated_months),
    macroTargets: {
      protein: data.macro_protein,
      carbs: data.macro_carbs,
      fats: data.macro_fats,
    },
    goalType: data.goal_type ?? null,
    activityLevel: data.activity_level ?? null,
    includesSnacks: data.includes_snacks ?? true,
    mealSplit: data.meal_split ?? {},
  };
}

async function fetchQuickStats(userId: string): Promise<QuickStat[]> {
  const [meals, workouts, food] = await Promise.all([
    supabase.from('food_entries').select('id, calories, protein', { count: 'exact' }).eq('user_id', userId),
    supabase.from('workout_sessions').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('daily_logs').select('water_glasses').eq('user_id', userId),
  ]);

  const mealRows = meals.data ?? [];
  const totalCalories = mealRows.reduce((s, r: any) => s + Number(r.calories), 0);
  const avgProtein = mealRows.length
    ? Math.round(mealRows.reduce((s, r: any) => s + Number(r.protein), 0) / mealRows.length)
    : 0;
  const totalWaterGlasses = (food.data ?? []).reduce((s, r: any) => s + (r.water_glasses ?? 0), 0);

  return [
    { title: 'Meals Logged', value: String(meals.count ?? 0), icon: 'restaurant-outline' },
    { title: 'Calories Tracked', value: `${Math.round(totalCalories / 1000)}k`, icon: 'flame-outline' },
    { title: 'Workouts', value: String(workouts.count ?? 0), icon: 'fitness-outline' },
    { title: 'Water Intake', value: `${totalWaterGlasses * 0.25}L`, icon: 'water-outline' },
    { title: 'Protein Avg', value: `${avgProtein}g`, icon: 'barbell-outline' },
  ];
}

// ─── Onboarding: BMR/TDEE → calorie + macro targets, split across meals ────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Standard ±500 kcal/day adjustment (≈0.5kg/week) for a lose/gain goal.
const GOAL_CALORIE_ADJUSTMENT: Record<GoalType, number> = {
  lose: -500,
  maintain: 0,
  gain: 500,
};

// Grams of protein per kg bodyweight — higher on a cut to preserve muscle.
const PROTEIN_G_PER_KG: Record<GoalType, number> = {
  lose: 2.0,
  maintain: 1.6,
  gain: 1.8,
};

const MIN_DAILY_CALORIES = 1200;

const PROGRAM_NAME_BY_GOAL: Record<GoalType, string> = {
  lose: 'Weight Loss',
  maintain: 'Maintenance',
  gain: 'Weight Gain',
};

export interface OnboardingInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: BiologicalSex;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  goalWeightKg?: number;
  includeSnacks: boolean;
}

export interface OnboardingPlan {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  macros: { protein: number; carbs: number; fats: number };
  mealSplit: MealSplit;
  mealCalories: Record<string, number>;
  bmi: number;
  estimatedMonths: number;
}

/**
 * Pure calculation, no I/O — lets the onboarding screen preview the plan
 * before the user confirms it (userService.completeOnboarding persists it).
 * BMR via Mifflin-St Jeor, scaled to TDEE by activity level, then adjusted
 * by a standard ±500 kcal/day for the stated goal.
 */
export function calculateOnboardingPlan(input: OnboardingInput): OnboardingPlan {
  const { weightKg, heightCm, age, sex, activityLevel, goalType, goalWeightKg, includeSnacks } = input;

  const bmr =
    sex === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  const dailyCalories = Math.max(MIN_DAILY_CALORIES, Math.round(tdee + GOAL_CALORIE_ADJUSTMENT[goalType]));

  const proteinG = Math.round(weightKg * PROTEIN_G_PER_KG[goalType]);
  const fatG = Math.round((dailyCalories * 0.25) / 9);
  const carbsG = Math.max(0, Math.round((dailyCalories - proteinG * 4 - fatG * 9) / 4));

  const mealSplit: MealSplit = includeSnacks
    ? { Breakfast: 25, Lunch: 35, Dinner: 30, Snacks: 10 }
    : { Breakfast: 30, Lunch: 40, Dinner: 30 };

  const mealCalories: Record<string, number> = {};
  for (const [meal, pct] of Object.entries(mealSplit)) {
    mealCalories[meal] = Math.round((dailyCalories * pct) / 100);
  }

  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : 0;

  let estimatedMonths = 0;
  if (goalType !== 'maintain' && goalWeightKg && goalWeightKg > 0) {
    const deltaKg = Math.abs(goalWeightKg - weightKg);
    estimatedMonths = Number((deltaKg / 0.5 / 4.345).toFixed(1)); // ~0.5kg/week
  }

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories,
    macros: { protein: proteinG, carbs: carbsG, fats: fatG },
    mealSplit,
    mealCalories,
    bmi,
    estimatedMonths,
  };
}

export const userService = {
  /** Full aggregated profile for the Profile tab. */
  async getProfile(): Promise<ProfileData> {
    const userId = await currentUserId();

    const [profileRes, metricsRes, achievementsRes, calorieTarget, fitnessGoal, quickStats] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('body_metrics').select('*').eq('user_id', userId).maybeSingle(),
        supabase
          .from('achievements')
          .select('*')
          .eq('user_id', userId)
          .order('earned_at', { ascending: false }),
        fetchCalorieTarget(userId),
        fetchActiveFitnessGoal(userId),
        fetchQuickStats(userId),
      ]);

    const user: User = profileRes.data
      ? mapUser(profileRes.data)
      : {
          id: userId,
          name: '',
          email: '',
          avatarUrl: '',
          goal: '',
          quote: '',
          level: 1,
          streakDays: 0,
          onboardingCompleted: false,
          age: null,
          sex: null,
        };

    const bodyMetrics: BodyMetrics = metricsRes.data
      ? mapBodyMetrics(metricsRes.data)
      : {
          weight: 0,
          goalWeight: 0,
          heightCm: 0,
          bodyFatPercent: 0,
          bmi: 0,
          goalCompletionPercent: 0,
        };

    const achievements: Achievement[] = (achievementsRes.data ?? []).map((a: any) => ({
      title: a.title,
      streakDays: a.streak_days,
      icon: a.icon,
    }));

    return {
      user,
      bodyMetrics,
      calorieTarget,
      fitnessGoal,
      achievements,
      quickStats,
    };
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        goal: updates.goal,
        quote: updates.quote,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return mapUser(data);
  },

  async getBodyMetrics(): Promise<BodyMetrics> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return mapBodyMetrics(data);
  },

  async updateBodyMetrics(metrics: Partial<BodyMetrics>): Promise<BodyMetrics> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('body_metrics')
      .update({
        weight: metrics.weight,
        goal_weight: metrics.goalWeight,
        body_fat_percent: metrics.bodyFatPercent,
        bmi: metrics.bmi,
        goal_completion_percent: metrics.goalCompletionPercent,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return mapBodyMetrics(data);
  },

  /**
   * Logs a new weight entry to the append-only `weight_logs` history and
   * updates `body_metrics.weight` (and BMI, if height is known) so it stays
   * a fast "current value" cache. This is the only way weight ever gets a
   * trend on the Trends tab — `updateBodyMetrics` alone doesn't keep history.
   */
  async logWeight(weightKg: number, at: Date = new Date()): Promise<void> {
    const userId = await currentUserId();

    const { error: logError } = await supabase
      .from('weight_logs')
      .insert({ user_id: userId, weight_kg: weightKg, logged_at: at.toISOString() });
    if (logError) throw logError;

    const { data: metrics } = await supabase
      .from('body_metrics')
      .select('height_cm')
      .eq('user_id', userId)
      .maybeSingle();
    const heightM = (metrics?.height_cm ?? 0) / 100;
    const bmi = heightM > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : undefined;

    const { error: updateError } = await supabase
      .from('body_metrics')
      .update({
        weight: weightKg,
        ...(bmi !== undefined ? { bmi } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    if (updateError) throw updateError;
  },

  /** Weight history, oldest first, for the Trends tab's weight chart. */
  async getWeightHistory(days = 90): Promise<{ date: string; weightKg: number }[]> {
    const userId = await currentUserId();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('weight_logs')
      .select('weight_kg, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', since.toISOString())
      .order('logged_at', { ascending: true });
    if (error) throw error;

    return (data ?? []).map((row: any) => ({ date: row.logged_at, weightKg: Number(row.weight_kg) }));
  },

  async getCalorieTarget(): Promise<CalorieTarget> {
    return fetchCalorieTarget(await currentUserId());
  },

  async getActiveFitnessGoal(): Promise<FitnessGoal> {
    return fetchActiveFitnessGoal(await currentUserId());
  },

  /**
   * Persists the onboarding form: physical stats onto profiles/body_metrics,
   * and the computed calorie/macro targets onto calorie_targets + a new
   * active fitness_goals row (deactivating whatever was active before, so
   * re-running onboarding later replaces the plan instead of stacking it).
   */
  async completeOnboarding(input: OnboardingInput): Promise<OnboardingPlan> {
    const userId = await currentUserId();
    const plan = calculateOnboardingPlan(input);
    const nowIso = new Date().toISOString();

    const [profileRes, metricsRes, targetRes] = await Promise.all([
      supabase
        .from('profiles')
        .update({ age: Math.round(input.age), sex: input.sex, onboarding_completed: true, updated_at: nowIso })
        .eq('id', userId),
      supabase
        .from('body_metrics')
        .update({
          weight: input.weightKg,
          goal_weight: input.goalWeightKg ?? input.weightKg,
          height_cm: input.heightCm,
          bmi: plan.bmi,
          updated_at: nowIso,
        })
        .eq('user_id', userId),
      supabase
        .from('calorie_targets')
        .update({ daily: plan.dailyCalories, maintenance: plan.tdee, updated_at: nowIso })
        .eq('user_id', userId),
    ]);
    if (profileRes.error) throw profileRes.error;
    if (metricsRes.error) throw metricsRes.error;
    if (targetRes.error) throw targetRes.error;

    // Seed weight history with the onboarding starting weight so the Trends
    // tab has a first point to chart from immediately.
    await supabase
      .from('weight_logs')
      .insert({ user_id: userId, weight_kg: input.weightKg, logged_at: nowIso });

    await supabase.from('fitness_goals').update({ is_active: false }).eq('user_id', userId).eq('is_active', true);

    const { error: goalError } = await supabase.from('fitness_goals').insert({
      user_id: userId,
      program_name: PROGRAM_NAME_BY_GOAL[input.goalType],
      completion_percent: 0,
      // fitness_goals.estimated_months is an integer column on the live
      // project (0001_init.sql assumed numeric(4,1)) — round the estimate.
      estimated_months: Math.round(plan.estimatedMonths),
      macro_protein: plan.macros.protein,
      macro_carbs: plan.macros.carbs,
      macro_fats: plan.macros.fats,
      goal_type: input.goalType,
      activity_level: input.activityLevel,
      includes_snacks: input.includeSnacks,
      meal_split: plan.mealSplit,
      is_active: true,
    });
    if (goalError) throw goalError;

    return plan;
  },

  /**
   * Uploads to the `fitbyte-images` Supabase Storage bucket under the
   * user's own folder (required by the storage RLS policies) and returns
   * a public URL.
   */
  async uploadAvatar(uri: string): Promise<string> {
    const userId = await currentUserId();
    const response = await fetch(uri);
    const blob = await response.arrayBuffer();
    const path = `${userId}/avatar-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('fitbyte-images')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('fitbyte-images').getPublicUrl(path);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId);
    if (updateError) throw updateError;

    return data.publicUrl;
  },

  /** Clears the profile photo, reverting to the initials fallback. */
  async removeAvatar(): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase.from('profiles').update({ avatar_url: '' }).eq('id', userId);
    if (error) throw error;
  },
};
