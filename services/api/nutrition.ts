/**
 * FitByte — Nutrition Service
 *
 * Bridges the UI layer to nutrition data.
 * Currently returns mock data. Replace implementations with real API calls.
 *
 * @todo Wire to: REST /nutrition/* or GraphQL nutrition queries
 */

import type { DailyNutrition, FoodEntry, NutritionDay, AIInsight } from '@/types';
import {
  MOCK_DAILY_NUTRITION,
  MOCK_FOOD_LOG,
  generateNutritionHeatmap,
  MOCK_AI_INSIGHTS,
} from '@/data/nutrition';

export const nutritionService = {
  /**
   * Get nutrition summary for a specific date.
   * @todo Replace with: GET /nutrition/daily?date={date}
   */
  async getDailyNutrition(date?: string): Promise<DailyNutrition> {
    return Promise.resolve(MOCK_DAILY_NUTRITION);
  },

  /**
   * Get all food log entries for a specific date.
   * @todo Replace with: GET /nutrition/log?date={date}
   */
  async getFoodLog(date?: string): Promise<FoodEntry[]> {
    return Promise.resolve(MOCK_FOOD_LOG);
  },

  /**
   * Log a new food entry.
   * @todo Replace with: POST /nutrition/log
   */
  async logFood(entry: Omit<FoodEntry, 'id'>): Promise<FoodEntry> {
    const newEntry: FoodEntry = { ...entry, id: Date.now().toString() };
    return Promise.resolve(newEntry);
  },

  /**
   * Delete a food log entry.
   * @todo Replace with: DELETE /nutrition/log/{id}
   */
  async deleteFood(id: string): Promise<void> {
    return Promise.resolve();
  },

  /**
   * Get monthly nutrition heatmap data.
   * @todo Replace with: GET /nutrition/heatmap?month={month}&year={year}
   */
  async getNutritionHeatmap(month?: number, year?: number): Promise<NutritionDay[]> {
    return Promise.resolve(generateNutritionHeatmap());
  },

  /**
   * Get AI-generated nutrition insights.
   * @todo Replace with: GET /nutrition/insights (calls AI analysis microservice)
   */
  async getAIInsights(): Promise<AIInsight[]> {
    return Promise.resolve(MOCK_AI_INSIGHTS);
  },
};
