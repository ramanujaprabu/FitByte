/**
 * FitByte — Workout Service
 *
 * Bridges the UI layer to workout data.
 * Currently returns mock data. Replace implementations with real API calls.
 *
 * @todo Wire to: REST /workouts/* or GraphQL workout queries
 */

import type { WorkoutRoutine, WorkoutSession, WorkoutStats } from '@/types';
import {
  MOCK_ROUTINES,
  MOCK_RECENT_SESSIONS,
  MOCK_WORKOUT_STATS,
  MOCK_WORKOUT_DAYS,
} from '@/data/workout';

export const workoutService = {
  /**
   * Get all saved workout routines for the current user.
   * @todo Replace with: GET /workouts/routines
   */
  async getRoutines(): Promise<WorkoutRoutine[]> {
    return Promise.resolve(MOCK_ROUTINES);
  },

  /**
   * Create a new workout routine.
   * @todo Replace with: POST /workouts/routines
   */
  async createRoutine(routine: Omit<WorkoutRoutine, 'id'>): Promise<WorkoutRoutine> {
    const newRoutine: WorkoutRoutine = { ...routine, id: Date.now().toString() };
    return Promise.resolve(newRoutine);
  },

  /**
   * Log a completed workout session.
   * @todo Replace with: POST /workouts/sessions
   */
  async logSession(session: Omit<WorkoutSession, 'id'>): Promise<WorkoutSession> {
    const newSession: WorkoutSession = { ...session, id: Date.now().toString() };
    return Promise.resolve(newSession);
  },

  /**
   * Get recent workout sessions.
   * @todo Replace with: GET /workouts/sessions?limit={limit}
   */
  async getRecentSessions(limit = 10): Promise<WorkoutSession[]> {
    return Promise.resolve(MOCK_RECENT_SESSIONS.slice(0, limit));
  },

  /**
   * Get weekly workout statistics.
   * @todo Replace with: GET /workouts/stats?period=week
   */
  async getWeeklyStats(): Promise<WorkoutStats> {
    return Promise.resolve(MOCK_WORKOUT_STATS);
  },

  /**
   * Get calendar workout day data for a given month.
   * @todo Replace with: GET /workouts/calendar?month={month}&year={year}
   */
  async getCalendarData(month?: number, year?: number): Promise<Record<number, string>> {
    return Promise.resolve(MOCK_WORKOUT_DAYS as Record<number, string>);
  },
};
