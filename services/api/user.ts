/**
 * FitByte — User/Profile Service
 *
 * Bridges the UI layer to user profile data.
 * Currently returns mock data. Replace implementations with real API calls.
 *
 * @todo Wire to: REST /users/* or GraphQL user queries
 */

import type { User, BodyMetrics, CalorieTarget, FitnessGoal, ProfileData } from '@/types';
import {
  MOCK_USER,
  MOCK_BODY_METRICS,
  MOCK_CALORIE_TARGET,
  MOCK_FITNESS_GOAL,
  MOCK_PROFILE,
} from '@/data/profile';

export const userService = {
  /**
   * Get current user profile.
   * @todo Replace with: GET /users/me
   */
  async getProfile(): Promise<ProfileData> {
    return Promise.resolve(MOCK_PROFILE);
  },

  /**
   * Update user profile info.
   * @todo Replace with: PATCH /users/me
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    const updated = { ...MOCK_USER, ...updates };
    return Promise.resolve(updated);
  },

  /**
   * Get current body metrics.
   * @todo Replace with: GET /users/me/metrics
   */
  async getBodyMetrics(): Promise<BodyMetrics> {
    return Promise.resolve(MOCK_BODY_METRICS);
  },

  /**
   * Update body metrics (weight, body fat, etc.).
   * @todo Replace with: POST /users/me/metrics
   */
  async updateBodyMetrics(metrics: Partial<BodyMetrics>): Promise<BodyMetrics> {
    const updated = { ...MOCK_BODY_METRICS, ...metrics };
    return Promise.resolve(updated);
  },

  /**
   * Get calorie targets.
   * @todo Replace with: GET /users/me/targets
   */
  async getCalorieTarget(): Promise<CalorieTarget> {
    return Promise.resolve(MOCK_CALORIE_TARGET);
  },

  /**
   * Get active fitness goal.
   * @todo Replace with: GET /users/me/goals/active
   */
  async getActiveFitnessGoal(): Promise<FitnessGoal> {
    return Promise.resolve(MOCK_FITNESS_GOAL);
  },

  /**
   * Upload a new avatar image.
   * @todo Replace with: POST /users/me/avatar (multipart/form-data)
   */
  async uploadAvatar(uri: string): Promise<string> {
    return Promise.resolve(uri);
  },
};
