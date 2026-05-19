/**
 * FitByte — Mock profile/user data.
 * Replace the service call implementations with real API calls when backend is ready.
 */

import type {
  User,
  BodyMetrics,
  CalorieTarget,
  FitnessGoal,
  Achievement,
  QuickStat,
  ProfileData,
} from '@/types';

// ─── User ─────────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Prabu',
  email: 'prabu@nutriai.app',
  avatarUrl: 'https://i.pravatar.cc/300?img=12',
  goal: 'Bulking Phase',
  quote: '"Consistency builds champions."',
  level: 12,
  streakDays: 24,
};

// ─── Body Metrics ─────────────────────────────────────────────────────────────

export const MOCK_BODY_METRICS: BodyMetrics = {
  weight: 72,
  goalWeight: 78,
  bodyFatPercent: 16,
  bmi: 23.1,
  goalCompletionPercent: 62,
};

export const MOCK_CALORIE_TARGET: CalorieTarget = {
  daily: 2800,
  maintenance: 2450,
  currentPercent: 74,
};

// ─── Fitness Goals ────────────────────────────────────────────────────────────

export const MOCK_FITNESS_GOAL: FitnessGoal = {
  programName: 'Lean Bulk Program',
  completionPercent: 68,
  estimatedMonths: 4,
  macroTargets: {
    protein: 180,
    carbs: 320,
    fats: 75,
  },
};

// ─── Achievements ─────────────────────────────────────────────────────────────

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { title: 'Calories',  streakDays: 24, icon: 'flame-outline' },
  { title: 'Workout',   streakDays: 12, icon: 'barbell-outline' },
  { title: 'Hydration', streakDays: 18, icon: 'water-outline' },
  { title: 'Sleep',     streakDays: 9,  icon: 'moon-outline' },
];

// ─── Quick Stats ──────────────────────────────────────────────────────────────

export const MOCK_QUICK_STATS: QuickStat[] = [
  { title: 'Meals Logged',     value: '1,248', icon: 'restaurant-outline' },
  { title: 'Calories Tracked', value: '284k',  icon: 'flame-outline' },
  { title: 'Workouts',         value: '312',   icon: 'fitness-outline' },
  { title: 'Water Intake',     value: '842L',  icon: 'water-outline' },
  { title: 'Sleep Hours',      value: '1,942', icon: 'moon-outline' },
  { title: 'Protein Avg',      value: '132g',  icon: 'barbell-outline' },
];

// ─── Aggregated Profile ───────────────────────────────────────────────────────

export const MOCK_PROFILE: ProfileData = {
  user: MOCK_USER,
  bodyMetrics: MOCK_BODY_METRICS,
  calorieTarget: MOCK_CALORIE_TARGET,
  fitnessGoal: MOCK_FITNESS_GOAL,
  achievements: MOCK_ACHIEVEMENTS,
  quickStats: MOCK_QUICK_STATS,
};
