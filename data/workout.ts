/**
 * FitByte — Mock workout data.
 * Replace the service call implementations with real API calls when backend is ready.
 */

import type {
  WorkoutRoutine,
  WorkoutSession,
  WorkoutStats,
  WorkoutDayLevel,
} from '@/types';

// ─── Saved Routines ───────────────────────────────────────────────────────────

export const MOCK_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'r1',
    name: 'Push Day',
    muscles: 'Chest + Triceps + Shoulders',
    exercises: 8,
    durationMins: 75,
    estimatedCalories: '620 kcal',
    lastPerformed: '2 days ago',
    isFavorite: true,
    exerciseList: ['Bench Press', 'Incline DB', 'Dips', 'OHP'],
  },
  {
    id: 'r2',
    name: 'Pull Day',
    muscles: 'Back + Biceps',
    exercises: 7,
    durationMins: 68,
    estimatedCalories: '540 kcal',
    lastPerformed: 'Yesterday',
    isFavorite: false,
    exerciseList: ['Deadlift', 'Pull-ups', 'Cable Row', 'Curl'],
  },
  {
    id: 'r3',
    name: 'Leg Day',
    muscles: 'Quads + Glutes + Hamstrings',
    exercises: 9,
    durationMins: 84,
    estimatedCalories: '720 kcal',
    lastPerformed: '4 days ago',
    isFavorite: true,
    exerciseList: ['Squat', 'Leg Press', 'RDL', 'Lunges'],
  },
  {
    id: 'r4',
    name: 'Full Body HIIT',
    muscles: 'Full Body',
    exercises: 12,
    durationMins: 42,
    estimatedCalories: '510 kcal',
    lastPerformed: '1 week ago',
    isFavorite: false,
    exerciseList: ['Burpees', 'Jump Squat', 'Mountain Climber', 'Box Jump'],
  },
];

// ─── Recent Sessions ──────────────────────────────────────────────────────────

export const MOCK_RECENT_SESSIONS: WorkoutSession[] = [
  {
    id: 's1',
    routineName: 'Push Day',
    durationMins: '74 mins',
    caloriesBurned: '620 kcal',
    muscles: 'Chest + Triceps',
    intensity: 'High',
    timestamp: 'Yesterday · 6:42 PM',
  },
  {
    id: 's2',
    routineName: 'Leg Day',
    durationMins: '82 mins',
    caloriesBurned: '710 kcal',
    muscles: 'Legs + Glutes',
    intensity: 'Extreme',
    timestamp: 'Friday · 7:15 PM',
  },
  {
    id: 's3',
    routineName: 'Pull Day',
    durationMins: '66 mins',
    caloriesBurned: '530 kcal',
    muscles: 'Back + Biceps',
    intensity: 'Medium',
    timestamp: 'Wednesday · 5:12 PM',
  },
];

// ─── Weekly Stats ─────────────────────────────────────────────────────────────

export const MOCK_WORKOUT_STATS: WorkoutStats = {
  weeklyWorkouts: 5,
  weeklyHours: '8.4h',
  weeklyCalories: '4.2k',
  currentStreak: 12,
};

// ─── Calendar Workout Days ────────────────────────────────────────────────────

/** Maps day-of-month → intensity level for the workout calendar. */
export const MOCK_WORKOUT_DAYS: Record<number, WorkoutDayLevel> = {
  1: 'high', 2: 'low',  4: 'high', 5: 'high',
  7: 'low',  8: 'high', 10: 'mid', 12: 'high',
  13: 'high', 15: 'high', 18: 'low', 19: 'high',
  21: 'mid', 22: 'high', 24: 'high', 26: 'high', 28: 'mid',
};
