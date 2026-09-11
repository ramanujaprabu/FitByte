import Ionicons from '@expo/vector-icons/Ionicons';
<<<<<<< HEAD
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
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
  { label: 'Trends & Analytics', icon: 'trending-up-outline', route: '/(tabs)/trends' },
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
  const [refreshing, setRefreshing] = useState(false);
  const [waterBusy, setWaterBusy] = useState(false);

  const isToday = useMemo(() => startOfDay(new Date()).getTime() === selectedDate.getTime(), [selectedDate]);

  const fetchData = useCallback(() => {
    return Promise.all([
      nutritionService.getDailyNutrition(selectedDate.toISOString()),
      userService.getActiveFitnessGoal().catch(() => null),
    ]).then(([daily, goal]) => {
      setToday(daily);
      setFitnessGoal(goal);
    }).catch(() => {});
  }, [selectedDate]);

  const load = useCallback(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  useFocusEffect(load);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

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
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DS.accent} />}>

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

        {!isToday && (
          <Pressable
            style={styles.jumpToTodayBtn}
            onPress={() => { triggerHaptic('light'); setSelectedDate(startOfDay(new Date())); }}>
            <Ionicons name="today-outline" size={13} color={DS.textSecond} />
            <ThemedText style={styles.jumpToTodayText}>Jump to Today</ThemedText>
          </Pressable>
        )}

        {loading && !today ? (
          <View style={styles.initialSpinner}>
            <ActivityIndicator color={DS.accent} />
          </View>
        ) : (
        <>
        {/* Calorie Banner */}
        <Pressable
          style={({ pressed }) => [styles.calorieBanner, pressed && styles.pressedFade]}
          onPress={() => router.push('/(tabs)/trends' as any)}>
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
=======
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/shared/Badge';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';

import { generateNutritionHeatmap, MOCK_AI_INSIGHTS } from '@/data/nutrition';
import type { ConsistencyLevel } from '@/types';

const MEAL_TABS = ['All Meals', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const PATTERN_CARDS = [
  { title: 'Avg Breakfast', value: '420 kcal', trend: '+6%', icon: 'sunny-outline' },
  { title: 'Late Night', value: '3× this week', trend: '-12%', icon: 'moon-outline' },
  { title: 'Most Logged', value: 'Chicken', trend: '+21%', icon: 'restaurant-outline' },
];

const HM_COLORS: Record<ConsistencyLevel, string> = {
  empty: DS.hmEmpty, low: DS.hmLow, mid: DS.hmMid, high: '#E8E8E8',
};

// May 2026
const MONTH_LABEL = 'May 2026';
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const FIRST_WEEKDAY = 4;
const DAYS_IN_MONTH = 31;

export default function MacroInsightsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState('All Meals');
  const [selectedDay, setSelectedDay] = useState(16);
  const [sheetOpen, setSheetOpen] = useState(false);

  const heatmapData = useMemo(() => generateNutritionHeatmap(), []);

  const calendarDays = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < FIRST_WEEKDAY; i++) cells.push(null);
    for (let d = 1; d <= DAYS_IN_MONTH; d++) cells.push(d);
    return cells;
  }, []);

  const dayLevels = useMemo(() => {
    const map: Record<number, ConsistencyLevel> = {};
    heatmapData.forEach(({ date, level }) => { map[date] = level; });
    return map;
  }, [heatmapData]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.dateRange}>Last 30 Days</ThemedText>
            <ThemedText type="title" style={styles.title}>Macro Insights</ThemedText>
            <ThemedText style={styles.subtitle}>Your nutrition patterns and trends</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <Badge label="12d streak" />
            <Pressable onPress={() => router.push('/screens/edit-profile')}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
            </Pressable>
          </View>
        </View>

<<<<<<< HEAD
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
        </>
        )}

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
    initialSpinner: {
      paddingVertical: Spacing.xxl,
      alignItems: 'center',
    },
    jumpToTodayBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'center',
      backgroundColor: DS.raised,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: Radius.full,
      marginBottom: Spacing.md,
    },
    jumpToTodayText: {
      fontSize: 12,
      fontWeight: '600',
      color: DS.textSecond,
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
=======
        {/* MEAL FILTER TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {MEAL_TABS.map(tab => {
            const active = selectedTab === tab;
            return (
              <Pressable key={tab} onPress={() => setSelectedTab(tab)}
                style={[styles.tabButton, active && styles.activeTab]}>
                <ThemedText style={[styles.tabText, active && styles.activeTabText]}>{tab}</ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* NUTRITION CALENDAR */}
        <Card>
          <SectionHeader title="Nutrition Consistency" subtitle="Monthly Overview"
            rightElement={
              <View style={styles.consistencyBadge}>
                <MonoText bold style={styles.consistencyText}>76%</MonoText>
              </View>
            }
          />

          {/* Month Switcher */}
          <View style={styles.monthSwitcher}>
            <Pressable style={styles.monthArrow}>
              <Ionicons name="chevron-back" size={16} color={DS.textMuted} />
            </Pressable>
            <ThemedText style={styles.monthLabel}>{MONTH_LABEL}</ThemedText>
            <Pressable style={styles.monthArrow}>
              <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
            </Pressable>
          </View>

          {/* Day-of-week header */}
          <View style={styles.calDayHeader}>
            {DAY_LABELS.map((d, i) => (
              <ThemedText key={`dh-${i}`} style={styles.calDayLabel}>{d}</ThemedText>
            ))}
          </View>

          {/* Calendar grid — perfect circle cells */}
          <View style={styles.calGrid}>
            {calendarDays.map((day, idx) => {
              if (day === null) return <View key={`e-${idx}`} style={styles.calCell} />;
              const level = dayLevels[day] ?? 'empty';
              const bgColor = HM_COLORS[level];
              const isSelected = day === selectedDay;
              const isToday = day === 16;
              const isDark = level === 'empty' || level === 'low';

              return (
                <Pressable key={day}
                  onPress={() => { setSelectedDay(day); setSheetOpen(true); }}
                  style={[styles.calCell, { justifyContent: 'center', alignItems: 'center' }]}>
                  <View style={[
                    styles.calCircle,
                    { backgroundColor: bgColor },
                    isToday && styles.calCellToday,
                    isSelected && styles.calCellSelected,
                  ]}>
                    <MonoText style={[
                      styles.calDateNum,
                      { color: isDark ? DS.textMuted : '#1A1A1A' },
                      isSelected && styles.calDateSelected,
                    ]}>
                      {day}
                    </MonoText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <ThemedText style={styles.legendLabel}>Less</ThemedText>
            {([DS.hmEmpty, DS.hmLow, DS.hmMid, '#E8E8E8'] as string[]).map((c, i) => (
              <View key={i} style={[styles.legendDot, { backgroundColor: c }]} />
            ))}
            <ThemedText style={styles.legendLabel}>More</ThemedText>
          </View>
        </Card>

        {/* SELECTED DAY ANALYTICS */}
        <Card>
          <View style={styles.analyticsTop}>
            <View>
              <ThemedText type="subtitle">Selected Day</ThemedText>
              <ThemedText style={styles.analyticsDate}>May {selectedDay}, 2026</ThemedText>
            </View>
            <Pressable style={styles.scoreCircle}
              onPress={() => router.push({ pathname: '/screens/daily-analytics', params: { day: String(selectedDay) } })}>
              <MonoText bold style={styles.scoreVal}>82</MonoText>
              <ThemedText style={styles.scoreSlash}>/100</ThemedText>
            </Pressable>
          </View>

          {/* Calorie metrics */}
          <View style={styles.metricRow}>
            {[
              { label: 'Calories', value: '2,140', sub: 'Goal: 2,400' },
              { label: 'Remaining', value: '260 kcal', sub: '+12% vs yesterday' },
            ].map(m => (
              <View key={m.label} style={styles.metricCard}>
                <ThemedText style={styles.metricLabel}>{m.label}</ThemedText>
                <MonoText bold style={styles.metricValue}>{m.value}</MonoText>
                <ThemedText style={styles.metricSub}>{m.sub}</ThemedText>
              </View>
            ))}
          </View>

          {/* Macro bars */}
          <View style={styles.macroSection}>
            {[
              { name: 'Protein', val: '92g / 150g', pct: 0.61 },
              { name: 'Carbs', val: '148g / 200g', pct: 0.74 },
              { name: 'Fats', val: '48g / 70g', pct: 0.68 },
            ].map(m => (
              <View key={m.name} style={styles.macroRow}>
                <View style={styles.macroLabel}>
                  <ThemedText style={styles.macroName}>{m.name}</ThemedText>
                  <MonoText style={styles.macroVal}>{m.val}</MonoText>
                </View>
                <ProgressBar progress={m.pct} />
              </View>
            ))}
          </View>

          {/* Extra stats */}
          <View style={styles.extraGrid}>
            {[
              { icon: 'water-outline', value: '2.4L', label: 'Water' },
              { icon: 'fitness-outline', value: '540', label: 'Burned' },
              { icon: 'moon-outline', value: '7.5h', label: 'Sleep' },
              { icon: 'restaurant-outline', value: '5', label: 'Meals' },
            ].map(s => (
              <View key={s.label} style={styles.extraCard}>
                <Ionicons name={s.icon as any} size={15} color={DS.textSecond} />
                <MonoText bold style={styles.extraValue}>{s.value}</MonoText>
                <ThemedText style={styles.extraLabel}>{s.label}</ThemedText>
              </View>
            ))}
          </View>

          <Pressable style={styles.viewDayBtn}
            onPress={() => router.push({ pathname: '/screens/daily-analytics', params: { day: String(selectedDay) } })}>
            <ThemedText style={styles.viewDayBtnText}>View Full Day Analytics →</ThemedText>
          </Pressable>
        </Card>

        {/* AI INSIGHTS */}
        <Card>
          <SectionHeader title="AI Nutrition Coach"
            rightElement={
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles-outline" size={11} color={DS.textSecond} />
                <ThemedText style={styles.aiLabel}>AI</ThemedText>
              </View>
            }
          />
          {MOCK_AI_INSIGHTS.map(item => (
            <View key={item.id} style={styles.insightRow}>
              <Ionicons name={item.icon as any} size={17} color={DS.textSecond} />
              <ThemedText style={styles.insightText}>{item.text}</ThemedText>
            </View>
          ))}
        </Card>

        {/* MACRO TRENDS CHART */}
        <Card>
          <SectionHeader title="Macro Trends" rightLabel="This Week" />
          <View style={styles.chart}>
            {[40, 90, 65, 120, 88, 110, 72].map((h, i) => (
              <View key={i} style={styles.chartCol}>
                <MonoText style={styles.chartValLabel}>{[40, 90, 65, 120, 88, 110, 72][i]}</MonoText>
                <View style={[styles.chartBar, { height: h }]} />
                <ThemedText style={styles.chartLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</ThemedText>
              </View>
            ))}
          </View>
        </Card>

        {/* MEAL PATTERNS */}
        <Card>
          <SectionHeader title="Meal Pattern Insights" />
          <View style={styles.patternGrid}>
            {PATTERN_CARDS.map(item => (
              <View key={item.title} style={styles.patternCard}>
                <Ionicons name={item.icon as any} size={15} color={DS.textSecond} />
                <ThemedText style={styles.patternTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.patternValue}>{item.value}</ThemedText>
                <ThemedText style={styles.patternTrend}>{item.trend}</ThemedText>
              </View>
            ))}
          </View>
        </Card>

        {/* NUTRITION SCORE */}
        <Card>
          <SectionHeader title="Nutrition Score" />
          <View style={styles.scoreContent}>
            <View style={styles.bigCircle}>
              <MonoText bold style={styles.bigScore}>82</MonoText>
              <ThemedText style={styles.bigScoreOf}>/100</ThemedText>
            </View>
            <View style={styles.scoreStats}>
              {[
                { label: 'Weekly Consistency', val: '76%' },
                { label: 'Protein Accuracy', val: '91%' },
                { label: 'Recovery Score', val: '88%' },
              ].map(s => (
                <View key={s.label} style={styles.scoreRow}>
                  <ThemedText style={styles.scoreRowLabel}>{s.label}</ThemedText>
                  <MonoText bold style={styles.scoreRowVal}>{s.val}</MonoText>
                </View>
              ))}
            </View>
          </View>
        </Card>

      </ScrollView>

      {/* FLOATING ACTIONS */}
      <View style={[styles.floatingActions, { bottom: insets.bottom + 80 }]}>
        {([
          { icon: 'add', route: '/screens/add-food' },
          { icon: 'analytics-outline', route: '/screens/daily-analytics' },
          { icon: 'download-outline', route: '/screens/export-data' },
          { icon: 'time-outline', route: '/screens/meal-history' },
        ] as const).map((item, i) => (
          <Pressable key={i} style={styles.fab}
            onPress={() => router.push(item.route as any)}>
            <Ionicons name={item.icon as any} size={19} color={DS.textPrimary} />
          </Pressable>
        ))}
      </View>

      {/* Day Bottom Sheet */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <ThemedText style={styles.sheetTitle}>May {selectedDay}, 2026</ThemedText>
        <ThemedText style={styles.sheetSubtitle}>
          {(dayLevels[selectedDay] ?? 'empty') === 'empty' ? 'No data logged' : 'Nutrition logged'}
        </ThemedText>
        <View style={styles.sheetRow}>
          {[
            { label: 'Calories', val: '2,140' },
            { label: 'Protein', val: '92g' },
            { label: 'Score', val: '82/100' },
          ].map(s => (
            <View key={s.label} style={styles.sheetStat}>
              <MonoText bold style={styles.sheetStatVal}>{s.val}</MonoText>
              <ThemedText style={styles.sheetStatLabel}>{s.label}</ThemedText>
            </View>
          ))}
        </View>
        <Pressable style={styles.sheetBtn}
          onPress={() => { setSheetOpen(false); router.push({ pathname: '/screens/daily-analytics', params: { day: String(selectedDay) } }); }}>
          <ThemedText style={styles.sheetBtnText}>View Full Analytics</ThemedText>
        </Pressable>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scrollContent: { paddingHorizontal: 20 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  dateRange: { fontSize: 13, color: DS.textMuted },
  title: { marginTop: 6, color: DS.textPrimary },
  subtitle: { marginTop: 6, fontSize: 14, color: DS.textSecond },
  headerRight: { alignItems: 'flex-end', gap: 10 },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: DS.border },

  // Tabs
  tabsContainer: { gap: 8, paddingBottom: 6, marginBottom: 20 },
  tabButton: { backgroundColor: DS.surface, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: DS.border },
  activeTab: { backgroundColor: DS.accent, borderColor: DS.accent },
  tabText: { fontWeight: '500', fontSize: 13, color: DS.textSecond },
  activeTabText: { color: '#fff', fontWeight: '600' },

  // Calendar
  consistencyBadge: { backgroundColor: DS.raised, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: DS.border },
  consistencyText: { fontSize: 13 },
  monthSwitcher: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 14 },
  monthArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: DS.raised, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  monthLabel: { fontWeight: '600', fontSize: 14, color: DS.textPrimary },
  calDayHeader: { flexDirection: 'row', marginBottom: 6 },
  calDayLabel: { width: `${100 / 7}%` as any, textAlign: 'center', fontSize: 10, color: DS.textMuted, fontWeight: '500' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%` as any, aspectRatio: 1, padding: 3 },
  calCircle: { width: '100%', height: '100%', borderRadius: 999, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  calCellToday: { borderColor: DS.textSecond, borderWidth: 1.5 },
  calCellSelected: { borderColor: DS.accent, borderWidth: 2 },
  calDateNum: { fontSize: 10 },
  calDateSelected: { fontWeight: '700' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14 },
  legendDot: { width: 11, height: 11, borderRadius: 999 },
  legendLabel: { fontSize: 11, color: DS.textMuted },

  // Analytics
  analyticsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  analyticsDate: { marginTop: 4, fontSize: 13, color: DS.textMuted },
  scoreCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: DS.raised, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  scoreVal: { fontSize: 18 },
  scoreSlash: { fontSize: 10, color: DS.textMuted },
  metricRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metricCard: { flex: 1, backgroundColor: DS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: DS.border },
  metricLabel: { fontSize: 12, color: DS.textMuted },
  metricValue: { fontSize: 22, marginTop: 8 },
  metricSub: { marginTop: 4, fontSize: 12, color: DS.textMuted },
  macroSection: { gap: 14 },
  macroRow: { gap: 8 },
  macroLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  macroName: { fontSize: 13, fontWeight: '500', color: DS.textPrimary },
  macroVal: { fontSize: 12, color: DS.textSecond },
  extraGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  extraCard: { width: '47%', backgroundColor: DS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: DS.border, gap: 5 },
  extraValue: { fontSize: 18, marginTop: 4 },
  extraLabel: { fontSize: 11, color: DS.textMuted },
  viewDayBtn: { marginTop: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: DS.border, alignItems: 'center' },
  viewDayBtnText: { fontSize: 13, color: DS.accent, fontWeight: '500' },

  // AI
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: DS.raised, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: DS.border },
  aiLabel: { fontSize: 11, color: DS.textSecond, fontWeight: '500' },
  insightRow: { flexDirection: 'row', gap: 12, backgroundColor: DS.card, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: DS.border, alignItems: 'flex-start' },
  insightText: { flex: 1, lineHeight: 20, fontSize: 13, color: DS.textPrimary },

  // Chart
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, marginTop: 12 },
  chartCol: { alignItems: 'center', gap: 4 },
  chartValLabel: { fontSize: 9, color: DS.textMuted },
  chartBar: { width: 18, borderRadius: 4, backgroundColor: DS.raised, marginBottom: 4 },
  chartLabel: { fontSize: 11, color: DS.textMuted },

  // Patterns
  patternGrid: { flexDirection: 'row', gap: 8 },
  patternCard: { flex: 1, backgroundColor: DS.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: DS.border, gap: 3 },
  patternTitle: { fontSize: 11, color: DS.textMuted, marginTop: 6 },
  patternValue: { fontWeight: '600', fontSize: 13, color: DS.textPrimary },
  patternTrend: { fontSize: 11, color: DS.textSecond },

  // Score
  scoreContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  bigCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: DS.accent, justifyContent: 'center', alignItems: 'center', backgroundColor: DS.card },
  bigScore: { fontSize: 34 },
  bigScoreOf: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
  scoreStats: { flex: 1, gap: 12 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scoreRowLabel: { fontSize: 13, color: DS.textSecond },
  scoreRowVal: { fontSize: 14 },

  // FABs
  floatingActions: { position: 'absolute', right: 20, gap: 8 },
  fab: { width: 46, height: 46, borderRadius: 23, backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },

  // Sheet
  sheetTitle: { fontSize: 20, fontWeight: '600', color: DS.textPrimary },
  sheetSubtitle: { fontSize: 13, color: DS.textSecond, marginTop: 4, marginBottom: 20 },
  sheetRow: { flexDirection: 'row', gap: 0, marginBottom: 20 },
  sheetStat: { flex: 1, alignItems: 'center', gap: 4 },
  sheetStatVal: { fontSize: 18 },
  sheetStatLabel: { fontSize: 11, color: DS.textMuted },
  sheetBtn: { backgroundColor: DS.accent, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  sheetBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
