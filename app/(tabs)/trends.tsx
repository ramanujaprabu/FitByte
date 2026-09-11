import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { useUnits } from '@/contexts/UnitsContext';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { nutritionService } from '@/services/api/nutrition';
import { userService } from '@/services/api/user';
import { workoutService } from '@/services/api/workout';
import type { ProfileData, WorkoutStats } from '@/types';
import { triggerHaptic } from '@/utils/haptics';
import { formatWeight, parseWeightToKg, weightUnitLabel } from '@/utils/units';

type WeeklySummary = Awaited<ReturnType<typeof nutritionService.getWeeklySummary>>;

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function TrendsTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { units } = useUnits();

  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [workoutDaysWithSession, setWorkoutDaysWithSession] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [weightHistory, setWeightHistory] = useState<{ date: string; weightKg: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      nutritionService.getWeeklySummary(),
      workoutService.getWeeklyStats(),
      workoutService.getRecentSessions(30),
      userService.getProfile(),
      userService.getWeightHistory(90).catch(() => []),
    ])
      .then(([s, w, sessions, p, weights]) => {
        setSummary(s);
        setWorkoutStats(w);
        setWorkoutDaysWithSession(new Set(sessions.map((sess) => startOfDay(new Date(sess.performedAt)).toDateString())));
        setProfile(p);
        setWeightHistory(weights);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadData);

  const hasLoggedData = (summary && summary.days.some((d) => d.calories > 0)) || (workoutStats && workoutStats.weeklyWorkouts > 0);

  const weekDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const isToday = i === 6;
      const worked = workoutDaysWithSession.has(startOfDay(d).toDateString());
      return { day: DAY_LABELS[d.getDay()], isToday, worked };
    });
  }, [workoutDaysWithSession]);

  const maxCal = summary ? Math.max(summary.calorieGoal, ...summary.days.map((d) => d.calories), 1) : 1;
  const daysHitTarget = summary ? summary.days.filter((d) => summary.calorieGoal && d.calories >= summary.calorieGoal * 0.85 && d.calories <= summary.calorieGoal * 1.1).length : 0;

  // Body metrics from profile + weight history
  const bodyWeightKg = profile?.bodyMetrics?.weight ?? null;
  const goalWeightKg = profile?.bodyMetrics?.goalWeight ?? null;
  const weightDelta = useMemo(() => {
    if (weightHistory.length < 2) return null;
    const latest = weightHistory[weightHistory.length - 1];
    const twoWeeksAgo = new Date(latest.date);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const reference = weightHistory.find((w) => new Date(w.date) >= twoWeeksAgo) ?? weightHistory[0];
    return Number((latest.weightKg - reference.weightKg).toFixed(1));
  }, [weightHistory]);

  const openWeightModal = () => {
    triggerHaptic('light');
    const current = bodyWeightKg ?? 0;
    setWeightInput(current ? (units === 'imperial' ? (current / 0.45359237).toFixed(1) : current.toFixed(1)) : '');
    setWeightModalVisible(true);
  };

  const saveWeight = async () => {
    const val = parseFloat(weightInput);
    if (!Number.isFinite(val) || val <= 0) return;
    setSavingWeight(true);
    try {
      await userService.logWeight(parseWeightToKg(val, units));
      setWeightModalVisible(false);
      loadData();
    } catch {
      // Keep the modal open with the value the user typed so they can retry.
    } finally {
      setSavingWeight(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar Header */}
      <View style={styles.topHeader}>
        <ThemedText style={styles.appTitle}>FitByte</ThemedText>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.push('/screens/account-settings' as any)}>
          <Ionicons name="settings-outline" size={22} color={DS.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>

        {/* Page Title */}
        <View style={styles.titleSection}>
          <ThemedText style={styles.pageTitle}>Trends</ThemedText>
          <ThemedText style={styles.pageSubtitle}>
            Historical analytics across nutrition, training, and body composition.
          </ThemedText>
        </View>

        {loading && !summary && !workoutStats ? (
          <View style={styles.initialSpinner}>
            <ActivityIndicator color={DS.accent} />
          </View>
        ) : (
        <>
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

          {!summary || summary.days.every((d) => d.calories === 0) ? (
            <View style={styles.sectionEmptyState}>
              <Ionicons name="nutrition-outline" size={24} color={DS.textMuted} />
              <ThemedText style={styles.sectionEmptyText}>Log meals to see your nutrition trends</ThemedText>
              <Pressable style={styles.sectionEmptyBtn} onPress={() => router.push('/screens/trackfood' as any)}>
                <ThemedText style={styles.sectionEmptyBtnText}>Log Food</ThemedText>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Calorie Bar Chart — real day-by-day totals, not a heatmap approximation */}
              <View style={styles.chartContainer}>
                <View style={styles.barsRow}>
                  {summary.days.map((item, idx) => {
                    const ratio = Math.min(1, item.calories / maxCal);
                    const isToday = idx === summary.days.length - 1;
                    return (
                      <View key={idx} style={styles.barCol}>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              { height: `${item.calories > 0 ? Math.max(ratio * 100, 4) : 0}%` },
                              isToday && styles.barFillActive,
                            ]}
                          />
                        </View>
                        <ThemedText style={[styles.barDayText, isToday && styles.barDayTextActive]}>
                          {item.label}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Sub-chart: Nutrition Consistency */}
              <View style={styles.subMetricBox}>
                <View style={styles.subMetricHeader}>
                  <ThemedText style={styles.subMetricLabel}>Calorie Target Hit</ThemedText>
                  <ThemedText style={styles.subMetricValMono}>{daysHitTarget}/7 Days</ThemedText>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.round((daysHitTarget / 7) * 100)}%` }]} />
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

              {/* Sub-chart: real per-day workout frequency (not derived from food data) */}
              <View style={styles.freqRow}>
                <ThemedText style={styles.subMetricLabel}>Workout Frequency</ThemedText>
                <View style={styles.dotsRow}>
                  {weekDays.map((d, idx) => (
                    <View key={idx} style={[styles.heatDot, d.worked && styles.heatDotActive]} />
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
            <Pressable style={styles.logWeightBtn} onPress={openWeightModal}>
              <Ionicons name="add" size={13} color={DS.accentText} />
              <ThemedText style={styles.logWeightBtnText}>Log Weight</ThemedText>
            </Pressable>
          </View>

          {bodyWeightKg == null || bodyWeightKg === 0 ? (
            <View style={styles.sectionEmptyState}>
              <Ionicons name="body-outline" size={24} color={DS.textMuted} />
              <ThemedText style={styles.sectionEmptyText}>Log your weight to start tracking your body trend</ThemedText>
              <Pressable style={styles.sectionEmptyBtn} onPress={openWeightModal}>
                <ThemedText style={styles.sectionEmptyBtnText}>Log Weight</ThemedText>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.bodyMetricsGrid}>
                <View style={styles.bodyMetricItem}>
                  <ThemedText style={styles.bodyMetricValue}>{formatWeight(bodyWeightKg, units, 1)}</ThemedText>
                  <ThemedText style={styles.bodyMetricLabel}>Current Weight</ThemedText>
                </View>
                {!!goalWeightKg && (
                  <View style={styles.bodyMetricItem}>
                    <ThemedText style={styles.bodyMetricValue}>{formatWeight(goalWeightKg, units, 1)}</ThemedText>
                    <ThemedText style={styles.bodyMetricLabel}>Goal Weight</ThemedText>
                  </View>
                )}
                {profile?.bodyMetrics?.bmi != null && profile.bodyMetrics.bmi > 0 && (
                  <View style={styles.bodyMetricItem}>
                    <ThemedText style={styles.bodyMetricValue}>{profile.bodyMetrics.bmi.toFixed(1)}</ThemedText>
                    <ThemedText style={styles.bodyMetricLabel}>BMI</ThemedText>
                  </View>
                )}
                {profile?.bodyMetrics?.bodyFatPercent != null && profile.bodyMetrics.bodyFatPercent > 0 && (
                  <View style={styles.bodyMetricItem}>
                    <ThemedText style={styles.bodyMetricValue}>{profile.bodyMetrics.bodyFatPercent}%</ThemedText>
                    <ThemedText style={styles.bodyMetricLabel}>Body Fat</ThemedText>
                  </View>
                )}
              </View>
              {weightDelta !== null && (
                <ThemedText style={styles.weightDeltaText}>
                  {weightDelta === 0 ? 'No change' : `${weightDelta > 0 ? '+' : ''}${formatWeight(Math.abs(weightDelta), units, 1)} ${weightDelta > 0 ? 'gained' : 'lost'}`} vs ~2 weeks ago
                </ThemedText>
              )}
            </>
          )}
        </View>
        </>
        )}

      </ScrollView>

      {/* Log Weight Modal */}
      <Modal visible={weightModalVisible} animationType="fade" transparent onRequestClose={() => setWeightModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalTopRow}>
              <ThemedText style={styles.modalTitle}>Log Weight</ThemedText>
              <Pressable onPress={() => setWeightModalVisible(false)}>
                <Ionicons name="close" size={22} color={DS.textPrimary} />
              </Pressable>
            </View>
            <View style={styles.weightInputRow}>
              <TextInput
                style={styles.weightInput}
                keyboardType="decimal-pad"
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="0.0"
                placeholderTextColor={DS.textMuted}
                autoFocus
              />
              <ThemedText style={styles.weightUnitLabel}>{weightUnitLabel(units)}</ThemedText>
            </View>
            <Pressable
              style={[styles.saveWeightBtn, savingWeight && { opacity: 0.6 }]}
              onPress={saveWeight}
              disabled={savingWeight || !weightInput}>
              <ThemedText style={styles.saveWeightBtnText}>{savingWeight ? 'Saving…' : 'Save'}</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    iconBtn: { padding: 6 },
    appTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: DS.textPrimary,
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
      color: DS.textPrimary,
      letterSpacing: -1,
    },
    pageSubtitle: {
      fontSize: 14,
      color: DS.textSecond,
      marginTop: 4,
    },
    initialSpinner: {
      paddingVertical: Spacing.xxl,
      alignItems: 'center',
    },
    bentoCard: {
      backgroundColor: DS.surface,
      borderRadius: Radius.xl,
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
      color: DS.textPrimary,
    },
    bentoMeta: {
      fontFamily: Fonts.mono,
      fontSize: 12,
      color: DS.textSecond,
    },
    logWeightBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: DS.accent,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: Radius.full,
    },
    logWeightBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: DS.accentText,
    },
    chartContainer: {
      height: 140,
      justifyContent: 'flex-end',
      marginBottom: Spacing.sm,
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
      backgroundColor: DS.raised,
      borderRadius: Radius.sm,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    barFill: {
      width: '100%',
      backgroundColor: DS.textMuted,
      borderRadius: Radius.sm,
    },
    barFillActive: {
      backgroundColor: DS.accent,
    },
    barDayText: {
      fontFamily: Fonts.mono,
      fontSize: 11,
      color: DS.textSecond,
      marginTop: 6,
    },
    barDayTextActive: {
      color: DS.textPrimary,
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
      color: DS.textPrimary,
      fontWeight: '600',
    },
    progressTrack: {
      height: 8,
      backgroundColor: DS.raised,
      borderRadius: Radius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: DS.accent,
      borderRadius: Radius.full,
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
      borderRadius: 4,
      backgroundColor: DS.raised,
    },
    heatDotActive: {
      backgroundColor: DS.accent,
    },
    weightDeltaText: {
      fontSize: 12,
      color: DS.textSecond,
      marginTop: Spacing.sm,
      textAlign: 'center',
    },
    emptyStateBanner: {
      backgroundColor: DS.surface,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    emptyStateTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: DS.textPrimary,
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
      backgroundColor: DS.accent,
      paddingHorizontal: Spacing.md,
      paddingVertical: 10,
      borderRadius: Radius.full,
    },
    emptyActionTextPrimary: {
      fontSize: 13,
      fontWeight: '600',
      color: DS.accentText,
    },
    emptyActionBtnSecondary: {
      backgroundColor: DS.raised,
      paddingHorizontal: Spacing.md,
      paddingVertical: 10,
      borderRadius: Radius.full,
    },
    emptyActionTextSecondary: {
      fontSize: 13,
      fontWeight: '600',
      color: DS.textPrimary,
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
      backgroundColor: DS.accent,
      paddingHorizontal: Spacing.md,
      paddingVertical: 8,
      borderRadius: Radius.full,
      marginTop: 4,
    },
    sectionEmptyBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: DS.accentText,
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
      color: DS.textPrimary,
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
      backgroundColor: DS.raised,
      borderRadius: Radius.md,
      paddingVertical: Spacing.md,
    },
    bodyMetricValue: {
      fontSize: 20,
      fontWeight: '700',
      fontFamily: Fonts.mono,
      color: DS.textPrimary,
      marginBottom: 2,
    },
    bodyMetricLabel: {
      fontSize: 11,
      color: DS.textSecond,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: DS.overlay,
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: DS.surface,
      borderTopLeftRadius: Radius.xl,
      borderTopRightRadius: Radius.xl,
      padding: Spacing.lg,
    },
    modalTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: DS.textPrimary,
    },
    weightInputRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 8,
      marginBottom: Spacing.lg,
    },
    weightInput: {
      fontFamily: Fonts.mono,
      fontSize: 40,
      fontWeight: '700',
      color: DS.textPrimary,
      minWidth: 120,
      textAlign: 'right',
    },
    weightUnitLabel: {
      fontSize: 16,
      color: DS.textSecond,
    },
    saveWeightBtn: {
      backgroundColor: DS.accent,
      height: 50,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveWeightBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: DS.accentText,
    },
  });
}
