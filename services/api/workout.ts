/**
 * FitByte — Workout Service (Hevy-style)
 *
 * Reads/writes:
 *  - `exercises` — the shared exercise library + each user's custom exercises.
 *  - `workout_routines` + `routine_exercises` — a routine's per-exercise
 *    targets (sets/reps/rest), not just a name list.
 *  - `workout_sessions` + `workout_session_exercises` + `workout_session_sets`
 *    — a fully logged workout: every set, its weight, reps, and type.
 *
 * Display strings (durations, timestamps) are formatted here so screens can
 * render them directly.
 */
import { supabase } from '@/lib/supabase';
import { offlineStorage } from '@/lib/offline-storage';
import type {
  Equipment,
  Exercise,
  ExerciseRecord,
  MuscleGroupVolume,
  PeriodTrainingStats,
  RoutineExercise,
  SessionExercise,
  SetType,
  WorkoutIntensity,
  WorkoutRoutine,
  WorkoutSession,
  WorkoutSet,
} from '@/types';
import { periodRange, type Period } from '@/utils/period';

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

function mapExercise(row: any): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    equipment: row.equipment,
    category: row.category,
    isCustom: row.is_custom,
  };
}

function mapRoutine(row: any, exercises: RoutineExercise[]): WorkoutRoutine {
  return {
    id: row.id,
    name: row.name,
    muscles: row.muscles ?? '',
    exercises,
    lastPerformed: relativeTime(row.last_performed),
    isFavorite: row.is_favorite,
  };
}

function mapSession(row: any): WorkoutSession {
  return {
    id: row.id,
    routineId: row.routine_id ?? null,
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
    performedAt: row.performed_at,
  };
}

function mapRoutineExerciseRow(row: any): RoutineExercise {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    name: row.name,
    muscleGroup: row.exercises?.muscle_group ?? '',
    targetSets: row.target_sets,
    targetReps: row.target_reps,
    restSeconds: row.rest_seconds,
  };
}

/** Volume (kg lifted) → a rough MET value and intensity label for the calorie estimate. */
function intensityFromVolume(totalVolumeKg: number): { met: number; intensity: WorkoutIntensity } {
  if (totalVolumeKg >= 8000) return { met: 8, intensity: 'Extreme' };
  if (totalVolumeKg >= 4000) return { met: 6, intensity: 'High' };
  if (totalVolumeKg >= 1500) return { met: 5, intensity: 'Medium' };
  return { met: 3.5, intensity: 'Low' };
}

export interface RoutineExerciseInput {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
}

export interface LogSessionSetInput {
  weightKg: number;
  reps: number;
  setType: SetType;
  completed: boolean;
}

export interface LogSessionExerciseInput {
  exerciseId: string | null;
  name: string;
  sets: LogSessionSetInput[];
}

export interface LogSessionInput {
  routineId?: string | null;
  routineName: string;
  durationMins: number;
  exercises: LogSessionExerciseInput[];
}

export const workoutService = {
  // ─── Exercise library ─────────────────────────────────────────────────
  async getExerciseLibrary(search?: string, muscleGroup?: string): Promise<Exercise[]> {
    let query = supabase.from('exercises').select('*').order('name', { ascending: true });
    if (search && search.trim().length > 0) query = query.ilike('name', `%${search.trim()}%`);
    if (muscleGroup && muscleGroup !== 'All') query = query.eq('muscle_group', muscleGroup);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapExercise);
  },

  async createCustomExercise(name: string, muscleGroup: string, equipment: Equipment): Promise<Exercise> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('exercises')
      .insert({ name, muscle_group: muscleGroup, equipment, category: 'strength', is_custom: true, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return mapExercise(data);
  },

  /** Most recent prior session's sets for this exercise, in set order — powers the "Previous" column. */
  async getPreviousSets(exerciseId: string): Promise<{ weightKg: number; reps: number }[]> {
    const { data: rows } = await supabase
      .from('workout_session_exercises')
      .select('id, workout_sessions!inner(performed_at)')
      .eq('exercise_id', exerciseId);
    if (!rows || rows.length === 0) return [];

    const sorted = [...rows].sort(
      (a: any, b: any) => new Date(b.workout_sessions.performed_at).getTime() - new Date(a.workout_sessions.performed_at).getTime()
    );
    const mostRecentId = sorted[0].id;

    const { data: sets } = await supabase
      .from('workout_session_sets')
      .select('weight_kg, reps')
      .eq('session_exercise_id', mostRecentId)
      .order('set_index', { ascending: true });
    return (sets ?? []).map((s: any) => ({ weightKg: Number(s.weight_kg), reps: s.reps }));
  },

  /** Heaviest weight / best estimated 1RM / best single-set volume ever logged for this exercise. */
  async getExerciseRecords(exerciseId: string): Promise<ExerciseRecord | null> {
    const { data: exerciseRow } = await supabase.from('exercises').select('name').eq('id', exerciseId).maybeSingle();
    const { data: sessionExercises } = await supabase.from('workout_session_exercises').select('id').eq('exercise_id', exerciseId);
    const ids = (sessionExercises ?? []).map((r: any) => r.id);
    if (ids.length === 0) return null;

    const { data: sets } = await supabase
      .from('workout_session_sets')
      .select('weight_kg, reps')
      .in('session_exercise_id', ids)
      .eq('completed', true);
    if (!sets || sets.length === 0) return null;

    let heaviestWeightKg = 0;
    let bestEstimated1RM = 0;
    let bestSetVolumeKg = 0;
    for (const s of sets as any[]) {
      const w = Number(s.weight_kg);
      const r = Number(s.reps);
      heaviestWeightKg = Math.max(heaviestWeightKg, w);
      bestEstimated1RM = Math.max(bestEstimated1RM, w * (1 + r / 30)); // Epley formula
      bestSetVolumeKg = Math.max(bestSetVolumeKg, w * r);
    }

    return {
      exerciseId,
      exerciseName: exerciseRow?.name ?? '',
      heaviestWeightKg,
      bestEstimated1RM: Math.round(bestEstimated1RM),
      bestSetVolumeKg,
    };
  },

  // ─── Routines ───────────────────────────────────────────────────────────
  async getRoutines(): Promise<WorkoutRoutine[]> {
    try {
      const userId = await currentUserId();
      const { data: routines, error } = await supabase
        .from('workout_routines')
        .select('*, routine_exercises(id, exercise_id, name, target_sets, target_reps, rest_seconds, order_index, exercises(muscle_group))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && routines) {
        return routines.map((r: any) => {
          const exercises = (r.routine_exercises ?? [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map(mapRoutineExerciseRow);
          return mapRoutine(r, exercises);
        });
      }
    } catch {}
    return [];
  },

  async getRoutine(id: string): Promise<WorkoutRoutine | null> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('workout_routines')
      .select('*, routine_exercises(id, exercise_id, name, target_sets, target_reps, rest_seconds, order_index)')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const exercises = (data.routine_exercises ?? [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map(mapRoutineExerciseRow);
    return mapRoutine(data, exercises);
  },

  async createRoutine(name: string, exercises: RoutineExerciseInput[]): Promise<WorkoutRoutine> {
    const userId = await currentUserId();
    const muscles = Array.from(new Set(exercises.map((e) => e.muscleGroup))).join(', ');

    const { data: created, error } = await supabase
      .from('workout_routines')
      .insert({ user_id: userId, name, muscles, is_favorite: false })
      .select()
      .single();
    if (error) throw error;

    if (exercises.length) {
      const { error: exError } = await supabase.from('routine_exercises').insert(
        exercises.map((e, i) => ({
          routine_id: created.id,
          exercise_id: e.exerciseId,
          name: e.name,
          target_sets: e.targetSets,
          target_reps: e.targetReps,
          rest_seconds: e.restSeconds,
          order_index: i,
        }))
      );
      if (exError) throw exError;
    }

    return mapRoutine(
      created,
      exercises.map((e, i) => ({
        id: `local-${i}`,
        exerciseId: e.exerciseId,
        name: e.name,
        muscleGroup: e.muscleGroup,
        targetSets: e.targetSets,
        targetReps: e.targetReps,
        restSeconds: e.restSeconds,
      }))
    );
  },

  async updateRoutine(id: string, name: string, exercises: RoutineExerciseInput[]): Promise<WorkoutRoutine> {
    const muscles = Array.from(new Set(exercises.map((e) => e.muscleGroup))).join(', ');

    const { error: updateError } = await supabase.from('workout_routines').update({ name, muscles }).eq('id', id);
    if (updateError) throw updateError;

    const { error: deleteError } = await supabase.from('routine_exercises').delete().eq('routine_id', id);
    if (deleteError) throw deleteError;

    if (exercises.length) {
      const { error: exError } = await supabase.from('routine_exercises').insert(
        exercises.map((e, i) => ({
          routine_id: id,
          exercise_id: e.exerciseId,
          name: e.name,
          target_sets: e.targetSets,
          target_reps: e.targetReps,
          rest_seconds: e.restSeconds,
          order_index: i,
        }))
      );
      if (exError) throw exError;
    }

    const { data: routineRow, error: fetchError } = await supabase.from('workout_routines').select('*').eq('id', id).single();
    if (fetchError) throw fetchError;

    return mapRoutine(
      routineRow,
      exercises.map((e, i) => ({
        id: `local-${i}`,
        exerciseId: e.exerciseId,
        name: e.name,
        muscleGroup: e.muscleGroup,
        targetSets: e.targetSets,
        targetReps: e.targetReps,
        restSeconds: e.restSeconds,
      }))
    );
  },

  async deleteRoutine(id: string): Promise<void> {
    const { error } = await supabase.from('workout_routines').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleFavoriteRoutine(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase.from('workout_routines').update({ is_favorite: isFavorite }).eq('id', id);
    if (error) throw error;
  },

  // ─── Logged sessions ────────────────────────────────────────────────────
  /**
   * Persists a fully logged workout: the session summary, plus every
   * exercise and every set within it. Calorie estimate uses the user's
   * current body weight (falls back to 70kg) and a MET value derived from
   * total volume lifted — not a flat `minutes * constant`.
   */
  async logSession(input: LogSessionInput, performedAt: Date = new Date()): Promise<WorkoutSession> {
    const userId = await currentUserId();

    let bodyWeightKg = 70;
    try {
      const { data: metrics } = await supabase.from('body_metrics').select('weight').eq('user_id', userId).maybeSingle();
      if (metrics?.weight) bodyWeightKg = Number(metrics.weight);
    } catch {}

    const completedSets = input.exercises.flatMap((e) => e.sets.filter((s) => s.completed));
    const totalVolume = completedSets.reduce((s, set) => s + set.weightKg * set.reps, 0);
    const { met, intensity } = intensityFromVolume(totalVolume);
    const caloriesBurned = Math.max(1, Math.round(((met * 3.5 * bodyWeightKg) / 200) * input.durationMins));

    let muscles = '';
    const exerciseIds = input.exercises.map((e) => e.exerciseId).filter((id): id is string => !!id);
    if (exerciseIds.length) {
      try {
        const { data: exRows } = await supabase.from('exercises').select('id, muscle_group').in('id', exerciseIds);
        muscles = Array.from(new Set((exRows ?? []).map((r: any) => r.muscle_group))).join(', ');
      } catch {}
    }

    const createdId = `workout-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const sessionExercises: SessionExercise[] = input.exercises.map((e, ei) => ({
      id: `local-ex-${ei}`,
      exerciseId: e.exerciseId,
      name: e.name,
      sets: e.sets.map((s, si): WorkoutSet => ({
        id: `local-set-${ei}-${si}`,
        setIndex: si,
        weightKg: s.weightKg,
        reps: s.reps,
        setType: s.setType,
        completed: s.completed,
      })),
    }));

    const newSession: WorkoutSession = {
      id: createdId,
      routineId: input.routineId ?? null,
      routineName: input.routineName,
      durationMins: `${input.durationMins} mins`,
      caloriesBurned: `${caloriesBurned} kcal`,
      muscles,
      intensity,
      performedAt: performedAt.toISOString(),
      timestamp: performedAt.toLocaleString([], { weekday: 'long', hour: 'numeric', minute: '2-digit' }),
      exercises: sessionExercises,
    };

    // 1. Save locally first for instant availability / offline resilience.
    await offlineStorage.saveOfflineWorkout(userId, newSession);

    // 2. Persist the full structure to Supabase if online.
    try {
      const { data: sessionRow, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          routine_id: input.routineId ?? null,
          routine_name: input.routineName,
          duration_mins: input.durationMins,
          calories_burned: caloriesBurned,
          muscles,
          intensity,
          performed_at: performedAt.toISOString(),
        })
        .select()
        .single();
      if (error || !sessionRow) throw error ?? new Error('Failed to insert workout session');

      for (let i = 0; i < input.exercises.length; i++) {
        const ex = input.exercises[i];
        const { data: exRow, error: exError } = await supabase
          .from('workout_session_exercises')
          .insert({ session_id: sessionRow.id, exercise_id: ex.exerciseId, name: ex.name, order_index: i })
          .select()
          .single();
        if (exError || !exRow) throw exError ?? new Error('Failed to insert session exercise');

        if (ex.sets.length) {
          const { error: setError } = await supabase.from('workout_session_sets').insert(
            ex.sets.map((s, si) => ({
              session_exercise_id: exRow.id,
              set_index: si,
              weight_kg: s.weightKg,
              reps: s.reps,
              set_type: s.setType,
              completed: s.completed,
            }))
          );
          if (setError) throw setError;
        }
      }

      if (input.routineId) {
        await supabase.from('workout_routines').update({ last_performed: performedAt.toISOString() }).eq('id', input.routineId);
      }

      await offlineStorage.removeOfflineWorkout(userId, createdId);
      return { ...newSession, id: sessionRow.id };
    } catch {
      // Offline fallback already stored above.
    }

    return newSession;
  },

  /** Full logged detail (every exercise + every set) for the session-detail screen. */
  async getSessionDetail(id: string): Promise<WorkoutSession | null> {
    let userId: string | null = null;
    try {
      userId = await currentUserId();
      const { data: sessionRow, error } = await supabase.from('workout_sessions').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
      if (!error && sessionRow) {
        const { data: exRows } = await supabase
          .from('workout_session_exercises')
          .select('*')
          .eq('session_id', id)
          .order('order_index', { ascending: true });

        const exercises: SessionExercise[] = [];
        for (const exRow of exRows ?? []) {
          const { data: setRows } = await supabase
            .from('workout_session_sets')
            .select('*')
            .eq('session_exercise_id', exRow.id)
            .order('set_index', { ascending: true });
          exercises.push({
            id: exRow.id,
            exerciseId: exRow.exercise_id,
            name: exRow.name,
            sets: (setRows ?? []).map((s: any) => ({
              id: s.id,
              setIndex: s.set_index,
              weightKg: Number(s.weight_kg),
              reps: s.reps,
              setType: s.set_type,
              completed: s.completed,
            })),
          });
        }
        return { ...mapSession(sessionRow), exercises };
      }
    } catch {}

    if (!userId) return null;
    const offline = await offlineStorage.getOfflineWorkouts(userId);
    return offline.find((w) => w.id === id) ?? null;
  },

  async deleteSession(id: string): Promise<void> {
    const userId = await currentUserId();
    await offlineStorage.removeOfflineWorkout(userId, id);
    try {
      const { error } = await supabase.from('workout_sessions').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
    } catch {
      // Nothing more to do if it was only an offline-cached entry.
    }
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

  /**
   * Current daily workout streak, counting consecutive days (today
   * backwards) with at least one session. Looks back up to a year so a
   * genuinely long streak isn't silently capped by a short query window.
   */
  async getCurrentStreak(): Promise<number> {
    const userId = await currentUserId();
    const since = new Date();
    since.setDate(since.getDate() - 365);

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('performed_at')
      .eq('user_id', userId)
      .gte('performed_at', since.toISOString());
    if (error) throw error;

    const daysWithSession = new Set((data ?? []).map((r: any) => new Date(r.performed_at).toDateString()));
    let streak = 0;
    const cursor = new Date();
    while (daysWithSession.has(cursor.toDateString())) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  },

  /**
   * Training summary for the Trends tab's Day/Week/Month view: workouts,
   * duration, total weight lifted, and a per-muscle-group set/volume
   * breakdown (so "Training" can show what you actually worked, not just
   * how long you were in the gym).
   */
  async getPeriodTrainingStats(period: Period, referenceDate: Date = new Date()): Promise<PeriodTrainingStats> {
    const userId = await currentUserId();
    const { start, end } = periodRange(period, referenceDate);

    const [{ data: sessions, error }, currentStreak] = await Promise.all([
      supabase
        .from('workout_sessions')
        .select('id, duration_mins, calories_burned')
        .eq('user_id', userId)
        .gte('performed_at', start.toISOString())
        .lte('performed_at', end.toISOString()),
      this.getCurrentStreak().catch(() => 0),
    ]);
    if (error) throw error;

    const sessionRows = sessions ?? [];
    const sessionIds = sessionRows.map((s: any) => s.id);
    const totalMinutes = sessionRows.reduce((s: number, r: any) => s + r.duration_mins, 0);
    const totalCaloriesBurned = sessionRows.reduce((s: number, r: any) => s + r.calories_burned, 0);

    let totalVolumeKg = 0;
    let muscleBreakdown: MuscleGroupVolume[] = [];

    if (sessionIds.length) {
      const { data: sessionExercises } = await supabase
        .from('workout_session_exercises')
        .select('id, exercise_id')
        .in('session_id', sessionIds);
      const exRows = sessionExercises ?? [];
      const sessionExerciseIds = exRows.map((e: any) => e.id);

      const libraryIds = Array.from(new Set(exRows.map((e: any) => e.exercise_id).filter(Boolean)));
      const muscleByExerciseId = new Map<string, string>();
      if (libraryIds.length) {
        const { data: libraryRows } = await supabase.from('exercises').select('id, muscle_group').in('id', libraryIds);
        for (const r of libraryRows ?? []) muscleByExerciseId.set(r.id, r.muscle_group);
      }
      const exerciseIdBySessionExercise = new Map(exRows.map((e: any) => [e.id, e.exercise_id]));

      if (sessionExerciseIds.length) {
        const { data: sets } = await supabase
          .from('workout_session_sets')
          .select('session_exercise_id, weight_kg, reps')
          .in('session_exercise_id', sessionExerciseIds)
          .eq('completed', true);

        const muscleMap = new Map<string, { sets: number; volumeKg: number }>();
        for (const s of sets ?? []) {
          const exerciseId = exerciseIdBySessionExercise.get(s.session_exercise_id);
          const muscle = (exerciseId && muscleByExerciseId.get(exerciseId)) || 'Other';
          const volume = Number(s.weight_kg) * s.reps;
          totalVolumeKg += volume;
          const entry = muscleMap.get(muscle) ?? { sets: 0, volumeKg: 0 };
          entry.sets += 1;
          entry.volumeKg += volume;
          muscleMap.set(muscle, entry);
        }
        muscleBreakdown = Array.from(muscleMap.entries())
          .map(([muscleGroup, v]) => ({ muscleGroup, sets: v.sets, volumeKg: Math.round(v.volumeKg) }))
          .sort((a, b) => b.sets - a.sets);
      }
    }

    return {
      workouts: sessionRows.length,
      totalMinutes,
      totalVolumeKg: Math.round(totalVolumeKg),
      totalCaloriesBurned,
      muscleBreakdown,
      currentStreak,
    };
  },

};
