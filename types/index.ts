/**
 * FitByte — Centralized TypeScript type definitions.
 * All data shapes are defined here for consistency across UI and services.
 */

// ─── User / Auth ──────────────────────────────────────────────────────────────

export type BiologicalSex = 'male' | 'female';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  goal: string;
  quote: string;
  level: number;
  streakDays: number;
  onboardingCompleted: boolean;
  age: number | null;
  sex: BiologicalSex | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Body Metrics ─────────────────────────────────────────────────────────────

export interface BodyMetrics {
  weight: number;         // kg
  goalWeight: number;     // kg
  heightCm: number;
  bodyFatPercent: number;
  bmi: number;
  goalCompletionPercent: number;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'lose' | 'maintain' | 'gain';

export interface MealSplit {
  [meal: string]: number; // percent of daily calories, 0-100, summing to 100
}

export interface CalorieTarget {
  daily: number;
  maintenance: number;
  currentPercent: number;
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface MacroTarget {
  protein: number;  // grams
  carbs: number;    // grams
  fats: number;     // grams
}

export interface DailyMacros {
  protein: { consumed: number; target: number };
  carbs:   { consumed: number; target: number };
  fats:    { consumed: number; target: number };
}

export interface FoodEntry {
  id: string;
  name: string;
  meal: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  /** Full ISO timestamp this was logged for — used to bucket entries by day. */
  loggedAt: string;
  imageUrl: string;
}

export interface DailyNutrition {
  date: string;           // ISO date string
  caloriesConsumed: number;
  calorieGoal: number;
  macros: DailyMacros;
  waterGlasses: number;
  waterGoal: number;
  meals: FoodEntry[];
  nutritionScore: number;
}

export interface AIInsight {
  id: string;
  type: 'positive' | 'warning' | 'critical';
  text: string;
  icon: string;
}

// ─── Analytics (Trends tab) ────────────────────────────────────────────────

export interface PeriodBucket {
  label: string;
  date: string;
  calories: number;
}

export interface PeriodMealBreakdown {
  meal: MealType;
  calories: number;
  actualPercent: number;
  targetPercent: number;
}

export interface PeriodTopFood {
  name: string;
  calories: number;
  count: number;
}

export interface PeriodTopFoodByProtein {
  name: string;
  protein: number;
  count: number;
}

export interface PeriodSummary {
  period: 'day' | 'week' | 'month';
  rangeLabel: string;
  buckets: PeriodBucket[];
  totalCalories: number;
  avgCalories: number;
  calorieGoal: number;
  daysLogged: number;
  daysOnTarget: number;
  totalDays: number;
  calorieDeltaPercent: number | null;
  avgProtein: number;
  avgCarbs: number;
  avgFats: number;
  macroTargets: MacroTarget;
  mealBreakdown: PeriodMealBreakdown[];
  topFoodsByCalories: PeriodTopFood[];
  topFoodsByProtein: PeriodTopFoodByProtein[];
  caloriesBurned: number;
  netCalories: number;
}

export interface MuscleGroupVolume {
  muscleGroup: string;
  sets: number;
  volumeKg: number;
}

export interface PeriodTrainingStats {
  workouts: number;
  totalMinutes: number;
  totalVolumeKg: number;
  totalCaloriesBurned: number;
  muscleBreakdown: MuscleGroupVolume[];
  currentStreak: number;
}

// ─── Workout ──────────────────────────────────────────────────────────────────

export type WorkoutIntensity = 'Low' | 'Medium' | 'High' | 'Extreme';
export type Equipment = 'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Bodyweight' | 'Kettlebell' | 'Other';
export type ExerciseCategory = 'strength' | 'cardio' | 'bodyweight' | 'stretching';
export type SetType = 'warmup' | 'normal' | 'dropset' | 'failure';

/** One entry in the shared (or a user's custom) exercise library. */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: Equipment;
  category: ExerciseCategory;
  isCustom: boolean;
}

/** A single logged (or in-progress) set within a workout exercise. */
export interface WorkoutSet {
  id: string;
  setIndex: number;
  weightKg: number;
  reps: number;
  setType: SetType;
  completed: boolean;
}

/** One exercise's worth of sets, within a routine (targets) or a logged session (actuals). */
export interface RoutineExercise {
  id: string;
  exerciseId: string | null;
  name: string;
  /** Denormalized from the exercise library — lets a routine's `muscles` summary be recomputed on edit without re-picking exercises. */
  muscleGroup: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
}

export interface SessionExercise {
  id: string;
  exerciseId: string | null;
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  muscles: string;
  exercises: RoutineExercise[];
  lastPerformed: string;
  isFavorite: boolean;
}

export interface WorkoutSession {
  id: string;
  routineId: string | null;
  routineName: string;
  durationMins: string;
  caloriesBurned: string;
  muscles: string;
  intensity: WorkoutIntensity;
  /** Human-readable display string, e.g. "Monday, 6:42 PM". */
  timestamp: string;
  /** Full ISO timestamp — used to bucket sessions by day (e.g. weekly dots). */
  performedAt: string;
  /** Only populated by `getSessionDetail` — the actual logged exercises/sets. */
  exercises?: SessionExercise[];
}

/** A single exercise's best-ever numbers, for the "new PR" moment on Finish. */
export interface ExerciseRecord {
  exerciseId: string;
  exerciseName: string;
  heaviestWeightKg: number;
  bestEstimated1RM: number;
  bestSetVolumeKg: number;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface Achievement {
  title: string;
  streakDays: number;
  icon: string;
}

export interface QuickStat {
  title: string;
  value: string;
  icon: string;
}

export interface FitnessGoal {
  programName: string;
  completionPercent: number;
  estimatedMonths: number;
  macroTargets: MacroTarget;
  goalType: GoalType | null;
  activityLevel: ActivityLevel | null;
  includesSnacks: boolean;
  mealSplit: MealSplit;
}

export interface ProfileData {
  user: User;
  bodyMetrics: BodyMetrics;
  calorieTarget: CalorieTarget;
  fitnessGoal: FitnessGoal;
  achievements: Achievement[];
  quickStats: QuickStat[];
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  hasMore: boolean;
}
