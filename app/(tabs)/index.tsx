import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/shared/ProgressBar';
import { ThemedText } from '@/components/themed-text';
import { DS, Fonts, Radius, Spacing } from '@/constants/theme';
import { nutritionService } from '@/services/api/nutrition';
import { userService } from '@/services/api/user';
import type { DailyNutrition, FitnessGoal, MealType } from '@/types';
import { groupFoodEntriesByMeal } from '@/utils/format';

const MEAL_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const DEFAULT_MEAL_SPLIT: Record<MealType, number> = { Breakfast: 25, Lunch: 35, Dinner: 30, Snacks: 10 };

const MEAL_EMPTY_COPY: Record<MealType, string> = {
  Breakfast: 'Start your day right — log your first meal.',
  Lunch: 'Midday fuel — log your lunch.',
  Dinner: 'Wrap up the day — log your dinner.',
  Snacks: 'Craving something? Log a snack.',
};

const MORE_LINKS: { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; route: string }[] = [
  { label: 'Meal History', icon: 'time-outline', route: '/screens/meal-history' },
  { label: 'Macro Breakdown', icon: 'pie-chart-outline', route: '/screens/macro-breakdown' },
  { label: 'Performance Trends', icon: 'trending-up-outline', route: '/screens/daily-analytics' },
  { label: 'Notifications', icon: 'notifications-outline', route: '/screens/notifications' },
];

export default function LogHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [today, setToday] = useState<DailyNutrition | null>(null);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      nutritionService.getDailyNutrition(),
      userService.getActiveFitnessGoal().catch(() => null),
    ])
      .then(([daily, goal]) => {
        setToday(daily);
        setFitnessGoal(goal);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  const caloriesConsumed = today?.caloriesConsumed ?? 0;
  const calorieGoal = today?.calorieGoal ?? 2000;
  const caloriesRemaining = Math.max(0, calorieGoal - caloriesConsumed);
  const calRatio = Math.min(1, caloriesConsumed / (calorieGoal || 1));

  const protein = today?.macros.protein ?? { consumed: 0, target: 150 };
  const carbs = today?.macros.carbs ?? { consumed: 0, target: 250 };
  const fats = today?.macros.fats ?? { consumed: 0, target: 65 };

  const mealSplit = fitnessGoal && Object.keys(fitnessGoal.mealSplit).length > 0 ? fitnessGoal.mealSplit : DEFAULT_MEAL_SPLIT;
  const mealsToShow = MEAL_ORDER.filter((m) => mealSplit[m] != null);
  const groupedByMeal = new Map((today ? groupFoodEntriesByMeal(today.meals) : []).map((g) => [g.meal, g.items]));

  const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header */}
      <View style={styles.topHeader}>
        <ThemedText style={styles.appTitle}>FitByte</ThemedText>
        <Pressable style={styles.iconBtn} onPress={() => router.push('/screens/account-settings' as any)}>
          <Ionicons name="settings-outline" size={22} color="#000000" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>

        <ThemedText style={styles.dateTitle}>Today, {formattedDate.split(', ')[1] || ''}</ThemedText>

        {/* Calorie Banner */}
        <Pressable
          style={({ pressed }) => [styles.calorieBanner, pressed && styles.pressedFade]}
          onPress={() => router.push('/screens/daily-analytics' as any)}>
          <View style={styles.calorieBannerIcon}>
            <Ionicons name="restaurant-outline" size={20} color="#000000" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.calorieBannerTitle}>Eat up to {caloriesRemaining.toLocaleString()} Cal</ThemedText>
            <View style={styles.calorieBannerProgressWrap}>
              <ProgressBar progress={calRatio} height={4} color="#000000" />
            </View>
          </View>
          <View style={styles.calorieBannerBadge}>
            <Ionicons name="stats-chart" size={15} color="#000000" />
          </View>
        </Pressable>

        {/* Macros Bento Grid */}
        <View style={styles.bentoGrid}>
          <View style={styles.macroCard}>
            <ThemedText style={styles.macroLabelCaps}>PROTEIN</ThemedText>
            <View>
              <ThemedText style={styles.macroBigNum}>{Math.round(protein.consumed)}<ThemedText style={styles.macroUnit}>g</ThemedText></ThemedText>
              <ProgressBar progress={Math.min(1, protein.consumed / (protein.target || 1))} height={4} color="#000000" />
              <ThemedText style={styles.macroSubTarget}>/ {protein.target}g</ThemedText>
            </View>
          </View>

          <View style={styles.macroCard}>
            <ThemedText style={styles.macroLabelCaps}>CARBS</ThemedText>
            <View>
              <ThemedText style={styles.macroBigNum}>{Math.round(carbs.consumed)}<ThemedText style={styles.macroUnit}>g</ThemedText></ThemedText>
              <ProgressBar progress={Math.min(1, carbs.consumed / (carbs.target || 1))} height={4} color="#000000" />
              <ThemedText style={styles.macroSubTarget}>/ {carbs.target}g</ThemedText>
            </View>
          </View>

          <View style={styles.macroCard}>
            <ThemedText style={styles.macroLabelCaps}>FAT</ThemedText>
            <View>
              <ThemedText style={styles.macroBigNum}>{Math.round(fats.consumed)}<ThemedText style={styles.macroUnit}>g</ThemedText></ThemedText>
              <ProgressBar progress={Math.min(1, fats.consumed / (fats.target || 1))} height={4} color="#000000" />
              <ThemedText style={styles.macroSubTarget}>/ {fats.target}g</ThemedText>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.pressedFade]} onPress={() => router.push('/screens/trackfood' as any)}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="search" size={18} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.actionBtnText}>Search</ThemedText>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.pressedFade]} onPress={() => router.push('/screens/scan' as any)}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="barcode-outline" size={18} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.actionBtnText}>Scan</ThemedText>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.pressedFade]} onPress={() => router.push('/screens/meal-history' as any)}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="time-outline" size={18} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.actionBtnText}>History</ThemedText>
          </Pressable>
        </View>

        {/* Per-meal sections */}
        {mealsToShow.map((meal) => {
          const items = groupedByMeal.get(meal) ?? [];
          const target = Math.round(calorieGoal * ((mealSplit[meal] ?? 0) / 100));
          const consumed = items.reduce((s, i) => s + i.totalCalories, 0);
          return (
            <View key={meal} style={styles.mealSection}>
              <View style={styles.mealSectionHeader}>
                <ThemedText style={styles.mealSectionTitle}>{meal}</ThemedText>
                <View style={styles.mealSectionRight}>
                  <ThemedText style={styles.mealSectionCal}>{Math.round(consumed)} of {target} Cal</ThemedText>
                  <Pressable
                    style={({ pressed }) => [styles.addMealBtn, pressed && styles.pressedFade]}
                    onPress={() => router.push({ pathname: '/screens/trackfood' as any, params: { meal } })}>
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>

              {items.length > 0 ? (
                <View>
                  {items.map((item) => (
                    <View key={item.key} style={styles.mealItemRow}>
                      <ThemedText style={styles.mealItemName} numberOfLines={1}>
                        {item.name}{item.count > 1 ? ` x${item.count}` : ''}
                      </ThemedText>
                      <ThemedText style={styles.mealItemCal}>{Math.round(item.totalCalories)} kcal</ThemedText>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.mealEmptyCard}>
                  <ThemedText style={styles.mealEmptyText}>{MEAL_EMPTY_COPY[meal]}</ThemedText>
                </View>
              )}
            </View>
          );
        })}

        {/* More */}
        <ThemedText style={styles.moreSectionLabel}>MORE</ThemedText>
        <View style={styles.moreCard}>
          {MORE_LINKS.map((link, idx) => (
            <Pressable
              key={link.label}
              style={({ pressed }) => [
                styles.moreRow,
                idx < MORE_LINKS.length - 1 && styles.moreRowBorder,
                pressed && styles.pressedFade,
              ]}
              onPress={() => router.push(link.route as any)}>
              <View style={styles.moreIconWrap}>
                <Ionicons name={link.icon} size={16} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.moreLabel}>{link.label}</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
            </Pressable>
          ))}
        </View>

      </ScrollView>

      {/* Small floating mic button — voice log */}
      <Pressable
        style={({ pressed }) => [styles.micFab, { bottom: 60 + insets.bottom + 16 }, pressed && styles.pressedFade]}
        onPress={() => router.push('/screens/voice-log' as any)}>
        <Ionicons name="mic" size={20} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 54,
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
    backgroundColor: '#FFFFFF',
  },
  iconBtn: {
    padding: 6,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  dateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
    marginBottom: Spacing.md,
  },
  calorieBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  calorieBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  calorieBannerProgressWrap: {
    marginRight: Spacing.sm,
  },
  calorieBannerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    justifyContent: 'space-between',
    aspectRatio: 1,
  },
  macroLabelCaps: {
    fontSize: 11,
    fontWeight: '600',
    color: DS.textSecond,
    letterSpacing: 0.5,
  },
  macroBigNum: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: Spacing.xs,
  },
  macroUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: DS.textSecond,
  },
  macroSubTarget: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: DS.textSecond,
    marginTop: Spacing.xs,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  mealSection: {
    marginBottom: Spacing.lg,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  mealSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
  },
  mealSectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mealSectionCal: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: DS.textSecond,
  },
  addMealBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
  },
  mealItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
    marginRight: Spacing.sm,
  },
  mealItemCal: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: DS.textSecond,
  },
  mealEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealEmptyText: {
    fontSize: 13,
    color: DS.textMuted,
    textAlign: 'center',
  },
  moreSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: DS.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  moreCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  moreRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
  },
  moreIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  pressedFade: {
    opacity: 0.55,
  },
  micFab: {
    position: 'absolute',
    right: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
