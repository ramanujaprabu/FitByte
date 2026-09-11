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

export type ConsistencyLevel = 'empty' | 'low' | 'mid' | 'high';

export interface NutritionDay {
  date: number;           // day of month
  level: ConsistencyLevel;
}

export interface AIInsight {
  id: string;
  type: 'positive' | 'warning' | 'critical';
  text: string;
  icon: string;
}

// ─── Workout ──────────────────────────────────────────────────────────────────

export type WorkoutIntensity = 'Low' | 'Medium' | 'High' | 'Extreme';
export type WorkoutDayLevel = 'empty' | 'low' | 'mid' | 'high';

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  muscles: string;
  exercises: number;
  durationMins: number;
  estimatedCalories: string;
  lastPerformed: string;
  isFavorite: boolean;
  exerciseList: string[];
}

export interface WorkoutSession {
  id: string;
  routineName: string;
  durationMins: string;
  caloriesBurned: string;
  muscles: string;
  intensity: WorkoutIntensity;
  /** Human-readable display string, e.g. "Monday, 6:42 PM". */
  timestamp: string;
  /** Full ISO timestamp — used to bucket sessions by day (e.g. weekly dots). */
  performedAt: string;
}

export interface WorkoutStats {
  weeklyWorkouts: number;
  weeklyHours: string;
  weeklyCalories: string;
  currentStreak: number;
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
