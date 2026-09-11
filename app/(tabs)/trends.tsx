import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { DS, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import { nutritionService } from '@/services/api/nutrition';
import { userService } from '@/services/api/user';
import { workoutService } from '@/services/api/workout';
import type { NutritionDay, ProfileData, WorkoutStats } from '@/types';
import { triggerHaptic } from '@/utils/haptics';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function TrendsTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'7D' | '4W' | '3M'>('7D');

  const [heatmap, setHeatmap] = useState<NutritionDay[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      nutritionService.getNutritionHeatmap(),
      workoutService.getWeeklyStats(),
      userService.getProfile(),
    ])
      .then(([h, w, p]) => {
        setHeatmap(h);
        setWorkoutStats(w);
        setProfile(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadData);

  const hasLoggedData = (heatmap.some(d => d.level !== 'empty')) || (workoutStats && workoutStats.weeklyWorkouts > 0);

  // Compute last 7 days calorie bar data from heatmap
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dayOfMonth = d.getDate();
    const dayLabel = DAY_LABELS[d.getDay()];
    const hm = heatmap.find(h => h.date === dayOfMonth);
    const ratio = hm ? (hm.level === 'high' ? 0.9 : hm.level === 'mid' ? 0.65 : hm.level === 'low' ? 0.3 : 0) : 0;
    const isToday = i === 6;
    return { day: dayLabel, targetRatio: ratio, active: isToday };
  });

  // Compute how many of the last 7 days had at least 'mid' nutrition level
  const daysWithGoodNutrition = weekDays.filter(d => d.targetRatio >= 0.5).length;

  // Compute workout frequency dots (last 7 days) from heatmap-like approach
  const workoutFreqDots = weekDays.map(d => d.targetRatio > 0);

  // Body metrics from profile
  const bodyWeight = profile?.bodyMetrics?.weight ?? null;
  const goalWeight = profile?.bodyMetrics?.goalWeight ?? null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar Header */}
      <View style={styles.topHeader}>
        <ThemedText style={styles.appTitle}>FitByte</ThemedText>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.push('/screens/account-settings' as any)}>
          <Ionicons name="settings-outline" size={22} color="#000000" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>

        {/* Page Title & Period Selector */}
        <View style={styles.titleSection}>
          <View>
            <ThemedText style={styles.pageTitle}>Trends</ThemedText>
            <ThemedText style={styles.pageSubtitle}>
              Historical analytics across nutrition, training, and body composition.
            </ThemedText>
          </View>

          <View style={styles.periodRow}>
            {(['7D', '4W', '3M'] as const).map(period => (
              <Pressable
                key={period}
                style={[styles.periodChip, selectedPeriod === period && styles.periodChipActive]}
                onPress={() => {
                  triggerHaptic('selection');
                  setSelectedPeriod(period);
                }}>
                <ThemedText style={[styles.periodChipText, selectedPeriod === period && styles.periodChipTextActive]}>
                  {period}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Empty State Banner if no logged data */}
        {!hasLoggedData && (
          <View style={styles.emptyStateBanner}>
            <Ionicons name="stats-chart-outline" size={28} color={DS.textMuted} style={{ marginBottom: 8 }} />
            <ThemedText style={styles.emptyStateTitle}>Log food & workouts to see insights</ThemedText>
            <ThemedText style={styles.emptyStateSub}>
              Start tracking your daily meals and workout sessions to generate historical charts, volume graphs, and AI trends.
            </ThemedText>
            <View style={styles.emptyStateActionsRow}>
              <Pressable
                style={styles.emptyActionBtnPrimary}
                onPress={() => router.push('/screens/trackfood' as any)}>
                <ThemedText style={styles.emptyActionTextPrimary}>Log Food</ThemedText>
              </Pressable>
              <Pressable
                style={styles.emptyActionBtnSecondary}
                onPress={() => router.push('/screens/log-workout' as any)}>
                <ThemedText style={styles.emptyActionTextSecondary}>Start Workout</ThemedText>
              </Pressable>
            </View>
          </View>
        )}

        {/* 1. NUTRITION SECTION */}
        <View style={styles.bentoCard}>
          <View style={styles.bentoHeaderRow}>
            <ThemedText style={styles.bentoTitle}>Nutrition</ThemedText>
            <ThemedText style={styles.bentoMeta}>Last 7 Days</ThemedText>
          </View>

          {weekDays.every(d => d.targetRatio === 0) ? (
            <View style={styles.sectionEmptyState}>
              <Ionicons name="nutrition-outline" size={24} color={DS.textMuted} />
              <ThemedText style={styles.sectionEmptyText}>Log meals to see your nutrition trends</ThemedText>
              <Pressable style={styles.sectionEmptyBtn} onPress={() => router.push('/screens/trackfood' as any)}>
                <ThemedText style={styles.sectionEmptyBtnText}>Log Food</ThemedText>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Calorie Bar Chart */}
              <View style={styles.chartContainer}>
                <View style={styles.targetDashedLine} />
                <View style={styles.barsRow}>
                  {weekDays.map((item, idx) => (
                    <View key={idx} style={styles.barCol}>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { height: `${Math.max(item.targetRatio * 100, 4)}%` },
                            item.active && styles.barFillActive,
                          ]}
                        />
                      </View>
                      <ThemedText style={[styles.barDayText, item.active && styles.barDayTextActive]}>
                        {item.day}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Sub-chart: Nutrition Consistency */}
              <View style={styles.subMetricBox}>
                <View style={styles.subMetricHeader}>
                  <ThemedText style={styles.subMetricLabel}>Calorie Target Hit</ThemedText>
                  <ThemedText style={styles.subMetricValMono}>{daysWithGoodNutrition}/7 Days</ThemedText>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.round((daysWithGoodNutrition / 7) * 100)}%` }]} />
                </View>
              </View>
            </>
          )}
        </View>

        {/* 2. TRAINING SECTION */}
        <View style={styles.bentoCard}>
          <View style={styles.bentoHeaderRow}>
            <ThemedText style={styles.bentoTitle}>Training</ThemedText>
            <ThemedText style={styles.bentoMeta}>This Week</ThemedText>
          </View>

          {!workoutStats || workoutStats.weeklyWorkouts === 0 ? (
            <View style={styles.sectionEmptyState}>
              <Ionicons name="barbell-outline" size={24} color={DS.textMuted} />
              <ThemedText style={styles.sectionEmptyText}>Start a workout to see training trends</ThemedText>
              <Pressable style={styles.sectionEmptyBtn} onPress={() => router.push('/screens/log-workout' as any)}>
                <ThemedText style={styles.sectionEmptyBtnText}>Start Workout</ThemedText>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Training Stats Grid */}
              <View style={styles.trainingStatsGrid}>
                <View style={styles.trainingStat}>
                  <ThemedText style={styles.trainingStatValue}>{workoutStats.weeklyWorkouts}</ThemedText>
                  <ThemedText style={styles.trainingStatLabel}>Workouts</ThemedText>
                </View>
                <View style={styles.trainingStat}>
                  <ThemedText style={styles.trainingStatValue}>{workoutStats.weeklyHours}</ThemedText>
                  <ThemedText style={styles.trainingStatLabel}>Duration</ThemedText>
                </View>
                <View style={styles.trainingStat}>
                  <ThemedText style={styles.trainingStatValue}>{workoutStats.weeklyCalories}</ThemedText>
                  <ThemedText style={styles.trainingStatLabel}>Calories</ThemedText>
                </View>
                <View style={styles.trainingStat}>
                  <ThemedText style={styles.trainingStatValue}>{workoutStats.currentStreak}d</ThemedText>
                  <ThemedText style={styles.trainingStatLabel}>Streak</ThemedText>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Sub-chart: Frequency */}
              <View style={styles.freqRow}>
                <ThemedText style={styles.subMetricLabel}>Workout Frequency</ThemedText>
                <View style={styles.dotsRow}>
                  {workoutFreqDots.map((active, idx) => (
                    <View key={idx} style={[styles.heatDot, active && styles.heatDotActive]} />
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        {/* 3. BODY SECTION */}
        <View style={styles.bentoCard}>
          <View style={styles.bentoHeaderRow}>
            <ThemedText style={styles.bentoTitle}>Body</ThemedText>
            {bodyWeight != null && (
              <View style={styles.bodyWeightBadge}>
                <ThemedText style={styles.bodyWeightVal}>{bodyWeight} <ThemedText style={styles.unitText}>kg</ThemedText></ThemedText>
                {goalWeight != null && (
                  <ThemedText style={styles.bodyTrendText}>
                    Goal: {goalWeight} kg
                  </ThemedText>
                )}
              </View>
            )}
          </View>

          {bodyWeight == null ? (
            <View style={styles.sectionEmptyState}>
              <Ionicons name="body-outline" size={24} color={DS.textMuted} />
              <ThemedText style={styles.sectionEmptyText}>Set up your body metrics in Profile</ThemedText>
              <Pressable style={styles.sectionEmptyBtn} onPress={() => router.push('/(tabs)/profile' as any)}>
                <ThemedText style={styles.sectionEmptyBtnText}>Go to Profile</ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.bodyMetricsGrid}>
              <View style={styles.bodyMetricItem}>
                <ThemedText style={styles.bodyMetricValue}>{bodyWeight}</ThemedText>
                <ThemedText style={styles.bodyMetricLabel}>Weight (kg)</ThemedText>
              </View>
              {profile?.bodyMetrics?.bodyFatPercent != null && profile.bodyMetrics.bodyFatPercent > 0 && (
                <View style={styles.bodyMetricItem}>
                  <ThemedText style={styles.bodyMetricValue}>{profile.bodyMetrics.bodyFatPercent}%</ThemedText>
                  <ThemedText style={styles.bodyMetricLabel}>Body Fat</ThemedText>
                </View>
              )}
              {profile?.bodyMetrics?.bmi != null && profile.bodyMetrics.bmi > 0 && (
                <View style={styles.bodyMetricItem}>
                  <ThemedText style={styles.bodyMetricValue}>{profile.bodyMetrics.bmi.toFixed(1)}</ThemedText>
                  <ThemedText style={styles.bodyMetricLabel}>BMI</ThemedText>
                </View>
              )}
              {goalWeight != null && (
                <View style={styles.bodyMetricItem}>
                  <ThemedText style={styles.bodyMetricValue}>{goalWeight}</ThemedText>
                  <ThemedText style={styles.bodyMetricLabel}>Goal (kg)</ThemedText>
                </View>
              )}
            </View>
          )}
        </View>

      </ScrollView>
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
  iconBtn: { padding: 6 },
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
  titleSection: {
    marginBottom: Spacing.lg,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1,
  },
  pageSubtitle: {
    fontSize: 14,
    color: DS.textSecond,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  periodRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  periodChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  periodChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  periodChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: DS.textSecond,
  },
  periodChipTextActive: {
    color: '#FFFFFF',
  },
  bentoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  bentoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bentoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  bentoMeta: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: DS.textSecond,
  },
  chartContainer: {
    height: 140,
    justifyContent: 'flex-end',
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  targetDashedLine: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: DS.border,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 110,
  },
  barCol: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 24,
    height: 85,
    backgroundColor: '#F3F3F3',
    borderRadius: Radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#7E7576',
    borderRadius: Radius.sm,
  },
  barFillActive: {
    backgroundColor: '#000000',
  },
  barDayText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: DS.textSecond,
    marginTop: 6,
  },
  barDayTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: DS.border,
    marginVertical: Spacing.md,
  },
  subMetricBox: {},
  subMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  subMetricLabel: {
    fontSize: 13,
    color: DS.textSecond,
  },
  subMetricValMono: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F3F3F3',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: Radius.full,
  },
  volumeBox: {
    marginTop: Spacing.xs,
  },
  volumeLabel: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: DS.textSecond,
    marginBottom: Spacing.xs,
  },
  volumeSparklineArea: {
    height: 90,
    backgroundColor: '#F9F9F9',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: DS.border,
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
  },
  sparklineGridLine: {
    height: 1,
    backgroundColor: '#E5E5E5',
    width: '100%',
  },
  sparklineNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    left: 20,
    right: 20,
  },
  sparklineNode: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  weeksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 8,
  },
  weekText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: DS.textSecond,
  },
  freqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  heatDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: DS.border,
  },
  heatDotActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  bodyWeightBadge: {
    alignItems: 'flex-end',
  },
  bodyWeightVal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  unitText: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: DS.textSecond,
  },
  bodyTrendText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: DS.textSecond,
  },
  weightChartBox: {
    flexDirection: 'row',
    height: 100,
    marginTop: Spacing.sm,
  },
  yAxisLabels: {
    width: 24,
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  axisText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: DS.textSecond,
  },
  weightLineArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: DS.border,
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
  },
  weightLineProgress: {
    position: 'absolute',
    right: 16,
    top: 30,
  },
  weightPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 30,
    paddingRight: 10,
    marginTop: 6,
  },
  monthText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: DS.textSecond,
  },
  emptyStateBanner: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSub: {
    fontSize: 13,
    color: DS.textSecond,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  emptyStateActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  emptyActionBtnPrimary: {
    backgroundColor: '#000000',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  emptyActionTextPrimary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyActionBtnSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  emptyActionTextSecondary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  sectionEmptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 8,
  },
  sectionEmptyText: {
    fontSize: 13,
    color: DS.textSecond,
    textAlign: 'center',
  },
  sectionEmptyBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginTop: 4,
  },
  sectionEmptyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trainingStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  trainingStat: {
    alignItems: 'center',
    flex: 1,
  },
  trainingStatValue: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    color: '#000000',
    marginBottom: 2,
  },
  trainingStatLabel: {
    fontSize: 11,
    color: DS.textSecond,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bodyMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  bodyMetricItem: {
    alignItems: 'center',
    width: '45%',
    backgroundColor: '#F9F9F9',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  bodyMetricValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    color: '#000000',
    marginBottom: 2,
  },
  bodyMetricLabel: {
    fontSize: 11,
    color: DS.textSecond,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
