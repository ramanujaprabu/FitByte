import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/shared/ProgressBar';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { nutritionService } from '@/services/api/nutrition';
import { userService } from '@/services/api/user';
import type { DailyNutrition, FitnessGoal, MealType } from '@/types';
import { groupFoodEntriesByMeal } from '@/utils/format';
import { triggerHaptic } from '@/utils/haptics';

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
];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dateLabel(d: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function LogHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);

  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [today, setToday] = useState<DailyNutrition | null>(null);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [waterBusy, setWaterBusy] = useState(false);

  const isToday = useMemo(() => startOfDay(new Date()).getTime() === selectedDate.getTime(), [selectedDate]);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      nutritionService.getDailyNutrition(selectedDate.toISOString()),
      userService.getActiveFitnessGoal().catch(() => null),
    ])
      .then(([daily, goal]) => {
        setToday(daily);
        setFitnessGoal(goal);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedDate]);

  useFocusEffect(load);

  const goToDay = (deltaDays: number) => {
    triggerHaptic('selection');
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + deltaDays);
      return startOfDay(next) > startOfDay(new Date()) ? d : next;
    });
  };

  const caloriesConsumed = today?.caloriesConsumed ?? 0;
  const calorieGoal = today?.calorieGoal ?? 2000;
  const caloriesRemaining = Math.max(0, calorieGoal - caloriesConsumed);
  const calRatio = Math.min(1, caloriesConsumed / (calorieGoal || 1));

  const protein = today?.macros.protein ?? { consumed: 0, target: 150 };
  const carbs = today?.macros.carbs ?? { consumed: 0, target: 250 };
  const fats = today?.macros.fats ?? { consumed: 0, target: 65 };

  const waterGlasses = today?.waterGlasses ?? 0;
  const waterGoal = today?.waterGoal ?? 8;

  const mealSplit = fitnessGoal && Object.keys(fitnessGoal.mealSplit).length > 0 ? fitnessGoal.mealSplit : DEFAULT_MEAL_SPLIT;
  const mealsToShow = MEAL_ORDER.filter((m) => mealSplit[m] != null);
  const groupedByMeal = new Map((today ? groupFoodEntriesByMeal(today.meals) : []).map((g) => [g.meal, g.items]));

  const adjustWater = async (delta: number) => {
    if (waterBusy) return;
    const next = Math.max(0, waterGlasses + delta);
    triggerHaptic('light');
    setToday((t) => (t ? { ...t, waterGlasses: next } : t));
    setWaterBusy(true);
    try {
      await nutritionService.setWaterGlasses(next, selectedDate.toISOString());
    } catch {
      // Optimistic update already applied; next focus/load will resync.
    } finally {
      setWaterBusy(false);
    }
  };

  const dateParam = selectedDate.toISOString();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header */}
      <View style={styles.topHeader}>
        <ThemedText style={styles.appTitle}>FitByte</ThemedText>
        <Pressable style={styles.iconBtn} onPress={() => router.push('/screens/account-settings' as any)}>
          <Ionicons name="settings-outline" size={22} color={DS.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>

        {/* Date Navigator */}
        <View style={styles.dateNavRow}>
          <Pressable style={styles.dateNavBtn} onPress={() => goToDay(-1)} hitSlop={8}>
            <Ionicons name="chevron-back" size={18} color={DS.textPrimary} />
          </Pressable>
          <ThemedText style={styles.dateTitle}>{dateLabel(selectedDate)}</ThemedText>
          <Pressable
            style={[styles.dateNavBtn, isToday && styles.dateNavBtnDisabled]}
            onPress={() => goToDay(1)}
            disabled={isToday}
            hitSlop={8}>
            <Ionicons name="chevron-forward" size={18} color={isToday ? DS.textMuted : DS.textPrimary} />
          </Pressable>
        </View>

        {/* Calorie Banner */}
        <Pressable
          style={({ pressed }) => [styles.calorieBanner, pressed && styles.pressedFade]}
          onPress={() => router.push('/screens/daily-analytics' as any)}>
          <View style={styles.calorieBannerIcon}>
            <Ionicons name="restaurant-outline" size={20} color={DS.textPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.calorieBannerTitle}>Eat up to {caloriesRemaining.toLocaleString()} Cal</ThemedText>
            <View style={styles.calorieBannerProgressWrap}>
              <ProgressBar progress={calRatio} height={4} />
            </View>
          </View>
          <View style={styles.calorieBannerBadge}>
            <Ionicons name="stats-chart" size={15} color={DS.textPrimary} />
          </View>
        </Pressable>

        {/* Macros Grid */}
        <View style={styles.bentoGrid}>
          <View style={styles.macroCard}>
            <ThemedText style={styles.macroLabelCaps}>PROTEIN</ThemedText>
            <View>
              <ThemedText style={styles.macroBigNum}>{Math.round(protein.consumed)}<ThemedText style={styles.macroUnit}>g</ThemedText></ThemedText>
              <ProgressBar progress={Math.min(1, protein.consumed / (protein.target || 1))} height={4} />
              <ThemedText style={styles.macroSubTarget}>/ {protein.target}g</ThemedText>
            </View>
          </View>

          <View style={styles.macroCard}>
            <ThemedText style={styles.macroLabelCaps}>CARBS</ThemedText>
            <View>
              <ThemedText style={styles.macroBigNum}>{Math.round(carbs.consumed)}<ThemedText style={styles.macroUnit}>g</ThemedText></ThemedText>
              <ProgressBar progress={Math.min(1, carbs.consumed / (carbs.target || 1))} height={4} />
              <ThemedText style={styles.macroSubTarget}>/ {carbs.target}g</ThemedText>
            </View>
          </View>

          <View style={styles.macroCard}>
            <ThemedText style={styles.macroLabelCaps}>FAT</ThemedText>
            <View>
              <ThemedText style={styles.macroBigNum}>{Math.round(fats.consumed)}<ThemedText style={styles.macroUnit}>g</ThemedText></ThemedText>
              <ProgressBar progress={Math.min(1, fats.consumed / (fats.target || 1))} height={4} />
              <ThemedText style={styles.macroSubTarget}>/ {fats.target}g</ThemedText>
            </View>
          </View>
        </View>

        {/* Water — compact, single row */}
        <View style={styles.waterRow}>
          <View style={styles.waterLeft}>
            <Ionicons name="water" size={16} color={DS.textSecond} />
            <ThemedText style={styles.waterText}>
              Water <ThemedText style={styles.waterCount}>{waterGlasses}/{waterGoal}</ThemedText>
            </ThemedText>
          </View>
          <View style={styles.waterControls}>
            <Pressable style={styles.waterBtn} onPress={() => adjustWater(-1)} hitSlop={8} disabled={waterGlasses === 0}>
              <Ionicons name="remove" size={15} color={waterGlasses === 0 ? DS.textMuted : DS.textPrimary} />
            </Pressable>
            <Pressable style={styles.waterBtn} onPress={() => adjustWater(1)} hitSlop={8}>
              <Ionicons name="add" size={15} color={DS.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressedFade]}
            onPress={() => router.push({ pathname: '/screens/trackfood' as any, params: { date: dateParam } })}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="search" size={18} color={DS.accentText} />
            </View>
            <ThemedText style={styles.actionBtnText}>Search</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressedFade]}
            onPress={() => router.push('/screens/scan' as any)}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="barcode-outline" size={18} color={DS.accentText} />
            </View>
            <ThemedText style={styles.actionBtnText}>Scan</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressedFade]}
            onPress={() => router.push('/screens/voice-log' as any)}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="mic" size={18} color={DS.accentText} />
            </View>
            <ThemedText style={styles.actionBtnText}>Voice</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressedFade]}
            onPress={() => router.push('/screens/meal-history' as any)}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="time-outline" size={18} color={DS.accentText} />
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
                  {items.length > 0 && (
                    <Pressable
                      style={({ pressed }) => [styles.editMealBtn, pressed && styles.pressedFade]}
                      onPress={() => router.push({ pathname: '/screens/meal-detail' as any, params: { meal, date: dateParam } })}
                      hitSlop={6}>
                      <Ionicons name="pencil" size={14} color={DS.textSecond} />
                    </Pressable>
                  )}
                  <Pressable
                    style={({ pressed }) => [styles.addMealBtn, pressed && styles.pressedFade]}
                    onPress={() => router.push({ pathname: '/screens/trackfood' as any, params: { meal, date: dateParam } })}>
                    <Ionicons name="add" size={18} color={DS.accentText} />
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
                <Ionicons name={link.icon} size={16} color={DS.accentText} />
              </View>
              <ThemedText style={styles.moreLabel}>{link.label}</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: DS.bg,
    },
    topHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      height: 54,
      backgroundColor: DS.bg,
    },
    iconBtn: {
      padding: 6,
    },
    appTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -0.5,
    },
    scroll: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.xs,
    },
    dateNavRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    dateNavBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: DS.raised,
    },
    dateNavBtnDisabled: {
      opacity: 0.4,
    },
    dateTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: DS.textPrimary,
      letterSpacing: -0.3,
      minWidth: 150,
      textAlign: 'center',
    },
    calorieBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm + 2,
      backgroundColor: DS.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
    },
    calorieBannerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: DS.raised,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calorieBannerTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: DS.textPrimary,
      marginBottom: 6,
    },
    calorieBannerProgressWrap: {
      marginRight: Spacing.sm,
    },
    calorieBannerBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: DS.raised,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bentoGrid: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    macroCard: {
      flex: 1,
      backgroundColor: DS.surface,
      borderRadius: Radius.lg,
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
      color: DS.textPrimary,
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
    waterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: DS.surface,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      height: 40,
      marginBottom: Spacing.lg,
    },
    waterLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    waterText: {
      fontSize: 13,
      color: DS.textSecond,
      fontWeight: '500',
    },
    waterCount: {
      fontFamily: Fonts.mono,
      color: DS.textPrimary,
      fontWeight: '600',
    },
    waterControls: {
      flexDirection: 'row',
      gap: 6,
    },
    waterBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: DS.raised,
      alignItems: 'center',
      justifyContent: 'center',
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
      backgroundColor: DS.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: DS.textPrimary,
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
      color: DS.textPrimary,
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
    editMealBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: DS.raised,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addMealBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: DS.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mealItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.sm + 4,
      borderBottomWidth: 1,
      borderBottomColor: DS.border,
    },
    mealItemName: {
      fontSize: 14,
      fontWeight: '500',
      color: DS.textPrimary,
      flex: 1,
      marginRight: Spacing.sm,
    },
    mealItemCal: {
      fontFamily: Fonts.mono,
      fontSize: 13,
      color: DS.textSecond,
    },
    mealEmptyCard: {
      backgroundColor: DS.surface,
      borderRadius: Radius.lg,
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
      backgroundColor: DS.surface,
      borderRadius: Radius.lg,
      overflow: 'hidden',
      marginBottom: Spacing.md,
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
      borderRadius: 16,
      backgroundColor: DS.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
      color: DS.textPrimary,
    },
    pressedFade: {
      opacity: 0.55,
    },
  });
}
