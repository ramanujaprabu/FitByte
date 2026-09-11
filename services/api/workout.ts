/**
 * FitByte — Workout Service
 *
 * Reads/writes `workout_routines` (+ `routine_exercises`) and
 * `workout_sessions`. Display strings (durations, timestamps) are formatted
 * here so screens can keep rendering the same shapes as before.
 */
import { supabase } from '@/lib/supabase';
import type { WorkoutRoutine, WorkoutSession, WorkoutStats, WorkoutDayLevel } from '@/types';

/** Reads the locally cached session — see nutrition.ts for why this avoids getUser(). */
async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Not authenticated');
  return data.session.user.id;
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

function mapRoutine(row: any, exerciseNames: string[]): WorkoutRoutine {
  return {
    id: row.id,
    name: row.name,
    muscles: row.muscles,
    exercises: exerciseNames.length,
    durationMins: row.duration_mins,
    estimatedCalories: row.estimated_calories ?? '',
    lastPerformed: relativeTime(row.last_performed),
    isFavorite: row.is_favorite,
    exerciseList: exerciseNames,
  };
}

function mapSession(row: any): WorkoutSession {
  return {
    id: row.id,
    routineName: row.routine_name,
    durationMins: `${row.duration_mins} mins`,
    caloriesBurned: `${row.calories_burned} kcal`,
    muscles: row.muscles ?? '',
    intensity: row.intensity,
    timestamp: new Date(row.performed_at).toLocaleString([], {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
}

import { offlineStorage } from '@/lib/offline-storage';

export const workoutService = {
  async getRoutines(): Promise<WorkoutRoutine[]> {
    try {
      const userId = await currentUserId();
      const { data: routines, error } = await supabase
        .from('workout_routines')
        .select('*, routine_exercises(name, order_index)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && routines) {
        return routines.map((r: any) => {
          const names = (r.routine_exercises ?? [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((e: any) => e.name);
          return mapRoutine(r, names);
        });
      }
    } catch {}
    return [];
  },

  async createRoutine(routine: Omit<WorkoutRoutine, 'id'>): Promise<WorkoutRoutine> {
    const userId = await currentUserId();
    const { data: created, error } = await supabase
      .from('workout_routines')
      .insert({
        user_id: userId,
        name: routine.name,
        muscles: routine.muscles,
        duration_mins: routine.durationMins,
        estimated_calories: routine.estimatedCalories,
        is_favorite: routine.isFavorite,
      })
      .select()
      .single();
    if (error) throw error;

    if (routine.exerciseList.length) {
      const { error: exError } = await supabase.from('routine_exercises').insert(
        routine.exerciseList.map((name, i) => ({
          routine_id: created.id,
          name,
          order_index: i,
        }))
      );
      if (exError) throw exError;
    }

    return mapRoutine(created, routine.exerciseList);
  },

  async logSession(session: Omit<WorkoutSession, 'id'>): Promise<WorkoutSession> {
    const userId = await currentUserId();
    const createdId = `workout-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newSession: WorkoutSession = {
      id: createdId,
      ...session,
    };

    // 1. Save locally to offline storage immediately for instant UI availability
    await offlineStorage.saveOfflineWorkout(userId, newSession);

    // 2. Insert into Supabase if online
    try {
      const durationMins = parseInt(session.durationMins, 10) || 0;
      const caloriesBurned = parseInt(session.caloriesBurned, 10) || 0;

      const { data } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          routine_name: session.routineName,
          duration_mins: durationMins,
          calories_burned: caloriesBurned,
          muscles: session.muscles,
          intensity: session.intensity,
        })
        .select()
        .single();
      if (data) {
        // Same reason as nutritionService.logFood: drop the offline stand-in
        // now that the real row exists, so getRecentSessions doesn't count both.
        await offlineStorage.removeOfflineWorkout(userId, createdId);
        return mapSession(data);
      }
    } catch {}

    return newSession;
  },

  async getRecentSessions(limit = 10): Promise<WorkoutSession[]> {
    let remoteSessions: WorkoutSession[] = [];
    let userId: string | null = null;
    try {
      userId = await currentUserId();
      const { data } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('performed_at', { ascending: false })
        .limit(limit);
      if (data) remoteSessions = data.map(mapSession);
    } catch {}

    const offlineSessions = userId ? await offlineStorage.getOfflineWorkouts(userId) : [];
    const map = new Map<string, WorkoutSession>();
    remoteSessions.forEach(s => map.set(s.id, s));
    offlineSessions.forEach(s => { if (!map.has(s.id)) map.set(s.id, s); });
    return Array.from(map.values()).slice(0, limit);
  },

  async getWeeklyStats(): Promise<WorkoutStats> {
    const userId = await currentUserId();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('duration_mins, calories_burned, performed_at')
      .eq('user_id', userId)
      .gte('performed_at', weekAgo.toISOString());
    if (error) throw error;

    const rows = data ?? [];
    const totalMins = rows.reduce((s, r: any) => s + r.duration_mins, 0);
    const totalCalories = rows.reduce((s, r: any) => s + r.calories_burned, 0);

    // Streak: count consecutive days (from today backwards) with at least one session.
    const daysWithSession = new Set(rows.map((r: any) => new Date(r.performed_at).toDateString()));
    let streak = 0;
    const cursor = new Date();
    while (daysWithSession.has(cursor.toDateString())) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      weeklyWorkouts: rows.length,
      weeklyHours: `${(totalMins / 60).toFixed(1)}h`,
      weeklyCalories: `${(totalCalories / 1000).toFixed(1)}k`,
      currentStreak: streak,
    };
  },

  async getCalendarData(month?: number, year?: number): Promise<Record<number, WorkoutDayLevel>> {
    const userId = await currentUserId();
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = month ?? now.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('duration_mins, performed_at')
      .eq('user_id', userId)
      .gte('performed_at', start.toISOString())
      .lte('performed_at', end.toISOString());
    if (error) throw error;

    const result: Record<number, WorkoutDayLevel> = {};
    for (const row of data ?? []) {
      const day = new Date(row.performed_at).getDate();
      const level: WorkoutDayLevel = row.duration_mins >= 60 ? 'high' : row.duration_mins >= 30 ? 'mid' : 'low';
      // If multiple sessions in a day, keep the highest level.
      const order: WorkoutDayLevel[] = ['empty', 'low', 'mid', 'high'];
      if (!result[day] || order.indexOf(level) > order.indexOf(result[day])) {
        result[day] = level;
      }
    }
    return result;
  },
};
