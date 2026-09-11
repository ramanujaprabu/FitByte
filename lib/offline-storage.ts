import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FoodEntry, WorkoutSession } from '@/types';

// Pre-user-scoping keys. Nothing writes to these anymore; they're only
// referenced by purgeLegacyGlobalKeys() to clean up devices that still have
// them from before entries were namespaced per account.
const LEGACY_KEYS = {
  OFFLINE_FOOD_LOG: '@fitbyte_offline_food_log',
  OFFLINE_WORKOUT_LOG: '@fitbyte_offline_workout_log',
};

const foodKey = (userId: string) => `@fitbyte_offline_food_log:${userId}`;
const workoutKey = (userId: string) => `@fitbyte_offline_workout_log:${userId}`;

export const offlineStorage = {
  /**
   * Removes the old, non-per-user cache keys. Without this, a food/workout
   * entry logged while offline on one account could still be sitting in
   * AsyncStorage and bleed into a different account created later on the
   * same device, since the old keys weren't scoped to a user at all.
   */
  async purgeLegacyGlobalKeys(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([LEGACY_KEYS.OFFLINE_FOOD_LOG, LEGACY_KEYS.OFFLINE_WORKOUT_LOG]);
    } catch {}
  },

  async getOfflineFoods(userId: string): Promise<FoodEntry[]> {
    try {
      const json = await AsyncStorage.getItem(foodKey(userId));
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async saveOfflineFood(userId: string, food: FoodEntry): Promise<void> {
    try {
      const existing = await this.getOfflineFoods(userId);
      const updated = [food, ...existing];
      await AsyncStorage.setItem(foodKey(userId), JSON.stringify(updated));
    } catch {
      // Storage save error fallback
    }
  },

  async removeOfflineFood(userId: string, id: string): Promise<void> {
    try {
      const existing = await this.getOfflineFoods(userId);
      const updated = existing.filter((f) => f.id !== id);
      await AsyncStorage.setItem(foodKey(userId), JSON.stringify(updated));
    } catch {}
  },

  async clearOfflineFoods(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(foodKey(userId));
    } catch {}
  },

  async getOfflineWorkouts(userId: string): Promise<WorkoutSession[]> {
    try {
      const json = await AsyncStorage.getItem(workoutKey(userId));
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async saveOfflineWorkout(userId: string, session: WorkoutSession): Promise<void> {
    try {
      const existing = await this.getOfflineWorkouts(userId);
      const updated = [session, ...existing];
      await AsyncStorage.setItem(workoutKey(userId), JSON.stringify(updated));
    } catch {}
  },

  async removeOfflineWorkout(userId: string, id: string): Promise<void> {
    try {
      const existing = await this.getOfflineWorkouts(userId);
      const updated = existing.filter((w) => w.id !== id);
      await AsyncStorage.setItem(workoutKey(userId), JSON.stringify(updated));
    } catch {}
  },

  async clearOfflineWorkouts(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(workoutKey(userId));
    } catch {}
  },
};
