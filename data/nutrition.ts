/**
 * FitByte — Mock nutrition data.
 * Replace the service call implementations with real API calls when backend is ready.
 */

import type {
  DailyNutrition,
  FoodEntry,
  NutritionDay,
  AIInsight,
  ConsistencyLevel,
} from '@/types';

// ─── Current Day Nutrition ────────────────────────────────────────────────────

export const MOCK_DAILY_NUTRITION: DailyNutrition = {
  date: new Date().toISOString(),
  caloriesConsumed: 1320,
  calorieGoal: 2100,
  macros: {
    protein: { consumed: 92,  target: 150 },
    carbs:   { consumed: 148, target: 200 },
    fats:    { consumed: 48,  target: 70  },
  },
  waterGlasses: 6,
  waterGoal: 8,
  meals: [],
  nutritionScore: 82,
};

// ─── Food Log Entries ─────────────────────────────────────────────────────────

export const MOCK_FOOD_LOG: FoodEntry[] = [
  {
    id: 'f1',
    name: 'Chicken Rice Bowl',
    meal: 'Lunch',
    calories: 520,
    protein: 38,
    carbs: 52,
    fats: 12,
    time: '12:45 PM',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'f2',
    name: 'Peanut Butter Toast',
    meal: 'Breakfast',
    calories: 320,
    protein: 12,
    carbs: 36,
    fats: 14,
    time: '8:30 AM',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'f3',
    name: 'Protein Shake',
    meal: 'Snacks',
    calories: 180,
    protein: 24,
    carbs: 10,
    fats: 3,
    time: '5:15 PM',
    imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?q=80&w=1200&auto=format&fit=crop',
  },
];

// ─── Heatmap / Monthly Consistency ───────────────────────────────────────────

const LEVELS: ConsistencyLevel[] = ['empty', 'low', 'mid', 'high'];

/** Generate 35 days of pseudo-random nutrition consistency for the heatmap. */
export function generateNutritionHeatmap(): NutritionDay[] {
  // Deterministic seed so it looks the same every render
  const seed = [
    'high','mid','empty','high','high','low','mid',
    'empty','high','high','mid','high','low','high',
    'high','mid','empty','low','high','high','empty',
    'mid','high','high','low','high','mid','high',
    'empty','high','high','high','mid','low','high',
  ] as ConsistencyLevel[];

  return seed.map((level, i) => ({ date: i + 1, level }));
}

// ─── AI Insights ──────────────────────────────────────────────────────────────

export const MOCK_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'ai1',
    type: 'positive',
    text: 'Protein intake consistency improved by 18% this week.',
    icon: 'checkmark-circle-outline',
  },
  {
    id: 'ai2',
    type: 'warning',
    text: 'Lunch meals are consistently high in sodium.',
    icon: 'alert-circle-outline',
  },
  {
    id: 'ai3',
    type: 'critical',
    text: 'Fat intake exceeded target by 200% yesterday.',
    icon: 'close-circle-outline',
  },
];
