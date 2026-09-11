import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { ProgressBar } from '@/components/shared/ProgressBar';
import { SegmentedControl } from '@/components/shared/SegmentedControl';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { useUnits } from '@/contexts/UnitsContext';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { nutritionService } from '@/services/api/nutrition';
import { userService } from '@/services/api/user';
import { workoutService } from '@/services/api/workout';
import type { PeriodSummary, PeriodTrainingStats, ProfileData } from '@/types';
import { triggerHaptic } from '@/utils/haptics';
import { formatWeight, parseWeightToKg, weightUnitLabel } from '@/utils/units';
import { isCurrentOrFuturePeriod, shiftPeriod, type Period } from '@/utils/period';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export default function TrendsTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { units } = useUnits();

  const [period, setPeriod] = useState<Period>('week');
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  const [training, setTraining] = useState<PeriodTrainingStats | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [weightHistory, setWeightHistory] = useState<{ date: string; weightKg: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    return Promise.all([
      nutritionService.getPeriodSummary(period, referenceDate),
      workoutService.getPeriodTrainingStats(period, referenceDate),
      userService.getProfile(),
      userService.getWeightHistory(period === 'month' ? 120 : 30).catch(() => []),
    ]).then(([s, t, p, w]) => {
      setSummary(s);
      setTraining(t);
      setProfile(p);
      setWeightHistory(w);
    }).catch(() => {});
  }, [period, referenceDate]);

  const loadData = useCallback(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  useFocusEffect(loadData);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  const goPrev = () => {
    triggerHaptic('selection');
    setReferenceDate((d) => shiftPeriod(period, d, -1));
  };
  const goNext = () => {
    if (isCurrentOrFuturePeriod(period, referenceDate)) return;
    triggerHaptic('selection');
    setReferenceDate((d) => shiftPeriod(period, d, 1));
  };
  const atCurrentPeriod = isCurrentOrFuturePeriod(period, referenceDate);

  const changePeriod = (label: string) => {
    const opt = PERIOD_OPTIONS.find((o) => o.label === label);
    if (opt) {
      triggerHaptic('selection');
      setPeriod(opt.value);
    }
  };

  const hasNutritionData = !!summary && summary.totalCalories > 0;
  const hasTrainingData = !!training && training.workouts > 0;
  const bodyWeightKg = profile?.bodyMetrics?.weight ?? null;
  const goalWeightKg = profile?.bodyMetrics?.goalWeight ?? null;

  const weightDelta = useMemo(() => {
    if (weightHistory.length < 2) return null;
    const latest = weightHistory[weightHistory.length - 1];
    const earliest = weightHistory[0];
    return Number((latest.weightKg - earliest.weightKg).toFixed(1));
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
      // Keep the modal open so the user can retry.
    } finally {
      setSavingWeight(false);
    }
  };

  const macros = summary
    ? [
        { name: 'Protein', consumed: summary.avgProtein, target: summary.macroTargets.protein, color: DS.textPrimary },
        { name: 'Carbs', consumed: summary.avgCarbs, target: summary.macroTargets.carbs, color: DS.textSecond },
        { name: 'Fats', consumed: summary.avgFats, target: summary.macroTargets.fats, color: DS.borderMid },
      ]
    : [];
  const maxBucket = summary ? Math.max(...summary.buckets.map((b) => b.calories), summary.calorieGoal, 1) : 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar Header */}
      <View style={styles.topHeader}>
        <ThemedText style={styles.appTitle}>FitByte</ThemedText>
        <Pressable style={styles.iconBtn} onPress={() => router.push('/screens/account-settings' as any)}>
          <Ionicons name="settings-outline" size={22} color={DS.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DS.accent} />}>

        {/* Page Title */}
        <ThemedText style={styles.pageTitle}>Trends</ThemedText>

        {/* Period Selector */}
        <SegmentedControl
          options={PERIOD_OPTIONS.map((o) => o.label)}
          value={PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? 'Week'}
          onChange={changePeriod}
        />

        {/* Date Navigator */}
        <View style={styles.dateNavRow}>
          <Pressable style={styles.dateNavBtn} onPress={goPrev} hitSlop={8}>
            <Ionicons name="chevron-back" size={16} color={DS.textPrimary} />
          </Pressable>
          <ThemedText style={styles.dateRangeLabel}>{summary?.rangeLabel ?? '—'}</ThemedText>
          <Pressable
            style={[styles.dateNavBtn, atCurrentPeriod && styles.dateNavBtnDisabled]}
            onPress={goNext}
            disabled={atCurrentPeriod}
            hitSlop={8}>
            <Ionicons name="chevron-forward" size={16} color={atCurrentPeriod ? DS.textMuted : DS.textPrimary} />
          </Pressable>
        </View>

        {loading && !summary ? (
          <View style={styles.initialSpinner}>
            <ActivityIndicator color={DS.accent} />
          </View>
        ) : (
        <>

        {!loading && !hasNutritionData && !hasTrainingData && (
          <View style={styles.emptyStateBanner}>
            <Ionicons name="stats-chart-outline" size={26} color={DS.textMuted} style={{ marginBottom: 8 }} />
            <ThemedText style={styles.emptyStateTitle}>Nothing logged for this {period}</ThemedText>
            <ThemedText style={styles.emptyStateSub}>
              Log meals and workouts to see charts, trends, and top foods here.
            </ThemedText>
          </View>
        )}

        {/* 1. CALORIES */}
        {summary && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <ThemedText style={styles.cardTitle}>Calories</ThemedText>
              {summary.calorieDeltaPercent != null && (
                <View style={styles.deltaBadge}>
                  <Ionicons
                    name={summary.calorieDeltaPercent >= 0 ? 'arrow-up-outline' : 'arrow-down-outline'}
                    size={11}
                    color={DS.textPrimary}
                  />
                  <ThemedText style={styles.deltaText}>{Math.abs(summary.calorieDeltaPercent)}% vs last {period}</ThemedText>
                </View>
              )}
            </View>

            {hasNutritionData ? (
              <>
                <View style={styles.calorieHeroRow}>
                  <ThemedText style={styles.calorieHeroVal}>
                    {(period === 'day' ? summary.totalCalories : summary.avgCalories).toLocaleString()}
                  </ThemedText>
                  <ThemedText style={styles.calorieHeroUnit}>
                    kcal{period !== 'day' ? '/day avg' : ''} · goal {summary.calorieGoal.toLocaleString()}
                  </ThemedText>
                </View>

                <View style={styles.barChartContainer}>
                  {summary.buckets.map((b, idx) => {
                    const ratio = Math.min(1, b.calories / maxBucket);
                    return (
                      <View key={idx} style={styles.barColumn}>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { height: `${b.calories > 0 ? Math.max(ratio * 100, 4) : 0}%` }]} />
                        </View>
                        <ThemedText style={styles.barLabel}>{b.label}</ThemedText>
                      </View>
                    );
                  })}
                </View>

                {period !== 'day' && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.subMetricRow}>
                      <ThemedText style={styles.subMetricLabel}>Calorie Target Hit</ThemedText>
                      <ThemedText style={styles.subMetricVal}>{summary.daysOnTarget}/{summary.totalDays} days</ThemedText>
                    </View>
                    <ProgressBar progress={summary.totalDays ? summary.daysOnTarget / summary.totalDays : 0} height={6} />
                  </>
                )}

                <View style={styles.divider} />
                <View style={styles.netRow}>
                  <View style={styles.netItem}>
                    <ThemedText style={styles.netVal}>{summary.totalCalories.toLocaleString()}</ThemedText>
                    <ThemedText style={styles.netLabel}>Consumed</ThemedText>
                  </View>
                  <View style={styles.netItem}>
                    <ThemedText style={styles.netVal}>{summary.caloriesBurned.toLocaleString()}</ThemedText>
                    <ThemedText style={styles.netLabel}>Burned</ThemedText>
                  </View>
                  <View style={styles.netItem}>
                    <ThemedText style={styles.netVal}>{summary.netCalories.toLocaleString()}</ThemedText>
                    <ThemedText style={styles.netLabel}>Net</ThemedText>
                  </View>
                </View>
              </>
            ) : (
              <SectionEmpty DS={DS} styles={styles} icon="nutrition-outline" text="Log meals to see calorie trends" actionLabel="Log Food" onAction={() => router.push('/screens/trackfood' as any)} />
            )}
          </View>
        )}

        {/* 2. MACROS */}
        {summary && hasNutritionData && (
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>Macros</ThemedText>
            <View style={styles.macroDonutRow}>
              <MacroDonut macros={macros} trackColor={DS.ringTrack} size={110} strokeWidth={16} />
              <View style={styles.macroLegend}>
                {macros.map((m) => (
                  <View key={m.name} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: m.color }]} />
                    <ThemedText style={styles.legendLabel}>{m.name}</ThemedText>
                    <ThemedText style={styles.legendVal}>{m.consumed}g</ThemedText>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.divider} />
            {macros.map((m) => {
              const pct = m.target ? Math.min(1, m.consumed / m.target) : 0;
              return (
                <View key={m.name} style={styles.macroTargetRow}>
                  <ThemedText style={styles.macroTargetLabel}>{m.name} avg vs target</ThemedText>
                  <ThemedText style={styles.macroTargetVal}>{m.consumed}g / {m.target}g</ThemedText>
                  <ProgressBar progress={pct} color={m.color} height={5} />
                </View>
              );
            })}
          </View>
        )}

        {/* 3. MEALS */}
        {summary && hasNutritionData && summary.mealBreakdown.length > 0 && (
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>Meal Split</ThemedText>
            <ThemedText style={styles.cardSubtitle}>Actual share of calories vs your planned split</ThemedText>
            {summary.mealBreakdown.map((m) => (
              <View key={m.meal} style={styles.mealRow}>
                <View style={styles.mealRowHeader}>
                  <ThemedText style={styles.mealName}>{m.meal}</ThemedText>
                  <ThemedText style={styles.mealVal}>{m.calories} kcal · {m.actualPercent}%</ThemedText>
                </View>
                <View style={styles.mealTrack}>
                  <View style={[styles.mealFill, { width: `${Math.min(100, m.actualPercent)}%` }]} />
                  <View style={[styles.mealTargetTick, { left: `${Math.min(100, m.targetPercent)}%` }]} />
                </View>
              </View>
            ))}
            <View style={styles.mealLegendRow}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: DS.accent }]} />
                <ThemedText style={styles.legendLabel}>Actual</ThemedText>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendTick, { backgroundColor: DS.statusBad }]} />
                <ThemedText style={styles.legendLabel}>Planned target</ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* 4. TOP FOODS */}
        {summary && hasNutritionData && (summary.topFoodsByCalories.length > 0) && (
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>Top Foods</ThemedText>
            <ThemedText style={styles.sectionLabelCaps}>BY CALORIES</ThemedText>
            {summary.topFoodsByCalories.map((f, i) => (
              <View key={f.name} style={styles.topFoodRow}>
                <ThemedText style={styles.topFoodRank}>{i + 1}</ThemedText>
                <ThemedText style={styles.topFoodName} numberOfLines={1}>{f.name}{f.count > 1 ? ` ×${f.count}` : ''}</ThemedText>
                <ThemedText style={styles.topFoodVal}>{f.calories} kcal</ThemedText>
              </View>
            ))}
            {summary.topFoodsByProtein.length > 0 && (
              <>
                <ThemedText style={[styles.sectionLabelCaps, { marginTop: Spacing.md }]}>BY PROTEIN</ThemedText>
                {summary.topFoodsByProtein.map((f, i) => (
                  <View key={f.name} style={styles.topFoodRow}>
                    <ThemedText style={styles.topFoodRank}>{i + 1}</ThemedText>
                    <ThemedText style={styles.topFoodName} numberOfLines={1}>{f.name}{f.count > 1 ? ` ×${f.count}` : ''}</ThemedText>
                    <ThemedText style={styles.topFoodVal}>{f.protein}g</ThemedText>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* 5. TRAINING */}
        {training && (
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>Training</ThemedText>
            {hasTrainingData ? (
              <>
                <View style={styles.trainingStatsGrid}>
                  <View style={styles.trainingStat}>
                    <ThemedText style={styles.trainingStatValue}>{training.workouts}</ThemedText>
                    <ThemedText style={styles.trainingStatLabel}>Workouts</ThemedText>
                  </View>
                  <View style={styles.trainingStat}>
                    <ThemedText style={styles.trainingStatValue}>{(training.totalMinutes / 60).toFixed(1)}h</ThemedText>
                    <ThemedText style={styles.trainingStatLabel}>Duration</ThemedText>
                  </View>
                  <View style={styles.trainingStat}>
                    <ThemedText style={styles.trainingStatValue}>{(training.totalVolumeKg / 1000).toFixed(1)}k</ThemedText>
                    <ThemedText style={styles.trainingStatLabel}>Volume (kg)</ThemedText>
                  </View>
                  <View style={styles.trainingStat}>
                    <ThemedText style={styles.trainingStatValue}>{training.currentStreak}d</ThemedText>
                    <ThemedText style={styles.trainingStatLabel}>Streak</ThemedText>
                  </View>
                </View>

                {training.muscleBreakdown.length > 0 && (
                  <>
                    <View style={styles.divider} />
                    <ThemedText style={styles.sectionLabelCaps}>SETS BY MUSCLE GROUP</ThemedText>
                    {training.muscleBreakdown.slice(0, 6).map((m) => {
                      const maxSets = training.muscleBreakdown[0]?.sets || 1;
                      return (
                        <View key={m.muscleGroup} style={styles.muscleRow}>
                          <ThemedText style={styles.muscleLabel} numberOfLines={1}>{m.muscleGroup}</ThemedText>
                          <View style={styles.muscleBarTrack}>
                            <View style={[styles.muscleBarFill, { width: `${Math.max(6, (m.sets / maxSets) * 100)}%` }]} />
                          </View>
                          <ThemedText style={styles.muscleSets}>{m.sets}</ThemedText>
                        </View>
                      );
                    })}
                  </>
                )}
              </>
            ) : (
              <SectionEmpty DS={DS} styles={styles} icon="barbell-outline" text="Start a workout to see training trends" actionLabel="Start Workout" onAction={() => router.push('/screens/log-workout' as any)} />
            )}
          </View>
        )}

        {/* 6. BODY / WEIGHT */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ThemedText style={styles.cardTitle}>Body</ThemedText>
            <Pressable style={styles.logWeightBtn} onPress={openWeightModal}>
              <Ionicons name="add" size={13} color={DS.accentText} />
              <ThemedText style={styles.logWeightBtnText}>Log Weight</ThemedText>
            </Pressable>
          </View>

          {bodyWeightKg == null || bodyWeightKg === 0 ? (
            <SectionEmpty DS={DS} styles={styles} icon="body-outline" text="Log your weight to start tracking your body trend" actionLabel="Log Weight" onAction={openWeightModal} />
          ) : (
            <>
              <View style={styles.bodyMetricsGrid}>
                <View style={styles.bodyMetricItem}>
                  <ThemedText style={styles.bodyMetricValue}>{formatWeight(bodyWeightKg, units, 1)}</ThemedText>
                  <ThemedText style={styles.bodyMetricLabel}>Current</ThemedText>
                </View>
                {!!goalWeightKg && (
                  <View style={styles.bodyMetricItem}>
                    <ThemedText style={styles.bodyMetricValue}>{formatWeight(goalWeightKg, units, 1)}</ThemedText>
                    <ThemedText style={styles.bodyMetricLabel}>Goal</ThemedText>
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

              {weightHistory.length >= 2 && (
                <>
                  <View style={styles.divider} />
                  <WeightChart
                    DS={DS}
                    history={weightHistory}
                    goalWeightKg={goalWeightKg}
                  />
                  {weightDelta !== null && (
                    <ThemedText style={styles.weightDeltaText}>
                      {weightDelta === 0 ? 'No change' : `${weightDelta > 0 ? '+' : ''}${formatWeight(Math.abs(weightDelta), units, 1)} ${weightDelta > 0 ? 'gained' : 'lost'}`} over this range
                    </ThemedText>
                  )}
                </>
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

/** Small "log something to see this" placeholder used inside multiple cards. */
function SectionEmpty({
  DS, styles, icon, text, actionLabel, onAction,
}: {
  DS: ReturnType<typeof useDS>;
  styles: ReturnType<typeof makeStyles>;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  text: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.sectionEmptyState}>
      <Ionicons name={icon} size={22} color={DS.textMuted} />
      <ThemedText style={styles.sectionEmptyText}>{text}</ThemedText>
      <Pressable style={styles.sectionEmptyBtn} onPress={onAction}>
        <ThemedText style={styles.sectionEmptyBtnText}>{actionLabel}</ThemedText>
      </Pressable>
    </View>
  );
}

/** Three-segment donut — each macro's share of the day's calories (protein/carbs × 4, fats × 9). */
function MacroDonut({
  macros, trackColor, size, strokeWidth,
}: {
  macros: { name: string; consumed: number; color: string }[];
  trackColor: string;
  size: number;
  strokeWidth: number;
}) {
  const CAL_PER_GRAM: Record<string, number> = { Protein: 4, Carbs: 4, Fats: 9 };
  const calorieShares = macros.map((m) => (m.consumed || 0) * (CAL_PER_GRAM[m.name] ?? 4));
  const total = calorieShares.reduce((s, v) => s + v, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
      </Svg>
    );
  }

  let cumulative = 0;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
      {macros.map((m, i) => {
        const fraction = calorieShares[i] / total;
        const dashArray = `${fraction * circumference} ${circumference}`;
        const dashOffset = -cumulative * circumference;
        cumulative += fraction;
        return (
          <Circle
            key={m.name}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={m.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        );
      })}
    </Svg>
  );
}

/** Weight trend line with an optional goal reference line. */
function WeightChart({
  DS, history, goalWeightKg,
}: {
  DS: ReturnType<typeof useDS>;
  history: { date: string; weightKg: number }[];
  goalWeightKg: number | null;
}) {
  const width = 300;
  const height = 90;
  const padding = 8;

  const values = history.map((h) => h.weightKg);
  const allValues = goalWeightKg ? [...values, goalWeightKg] : values;
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  const points = history.map((h, i) => {
    const x = padding + (i / (history.length - 1)) * (width - padding * 2);
    const y = height - padding - ((h.weightKg - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const goalY = goalWeightKg != null ? height - padding - ((goalWeightKg - min) / range) * (height - padding * 2) : null;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      {goalY != null && (
        <Line x1={padding} y1={goalY} x2={width - padding} y2={goalY} stroke={DS.textMuted} strokeWidth={1} strokeDasharray="3,4" />
      )}
      <Polyline points={points} fill="none" stroke={DS.accent} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
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
    pageTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -1,
      marginBottom: Spacing.md,
    },
    dateNavRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
      marginTop: Spacing.md,
      marginBottom: Spacing.lg,
    },
    dateNavBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: DS.raised,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateNavBtnDisabled: { opacity: 0.4 },
    initialSpinner: {
      paddingVertical: Spacing.xxl,
      alignItems: 'center',
    },
    dateRangeLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: DS.textSecond,
      minWidth: 140,
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
    },
    card: {
      backgroundColor: DS.surface,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: DS.textPrimary,
    },
    cardSubtitle: {
      fontSize: 12,
      color: DS.textSecond,
      marginTop: -Spacing.sm,
      marginBottom: Spacing.md,
    },
    deltaBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: DS.raised,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: Radius.sm,
    },
    deltaText: {
      fontSize: 11,
      fontWeight: '600',
      color: DS.textPrimary,
    },
    calorieHeroRow: {
      marginBottom: Spacing.md,
    },
    calorieHeroVal: {
      fontFamily: Fonts.mono,
      fontSize: 32,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -0.5,
    },
    calorieHeroUnit: {
      fontSize: 12,
      color: DS.textSecond,
      marginTop: 2,
    },
    barChartContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 120,
      marginBottom: Spacing.sm,
    },
    barColumn: {
      alignItems: 'center',
      flex: 1,
    },
    barTrack: {
      width: 22,
      height: 95,
      backgroundColor: DS.raised,
      borderRadius: Radius.sm,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    barFill: {
      width: '100%',
      backgroundColor: DS.accent,
      borderRadius: Radius.sm,
    },
    barLabel: {
      fontFamily: Fonts.mono,
      fontSize: 10,
      color: DS.textSecond,
      marginTop: 6,
    },
    divider: {
      height: 1,
      backgroundColor: DS.border,
      marginVertical: Spacing.md,
    },
    subMetricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    subMetricLabel: { fontSize: 13, color: DS.textSecond },
    subMetricVal: { fontFamily: Fonts.mono, fontSize: 12, color: DS.textPrimary, fontWeight: '600' },
    netRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    netItem: { alignItems: 'center', flex: 1 },
    netVal: { fontFamily: Fonts.mono, fontSize: 16, fontWeight: '700', color: DS.textPrimary },
    netLabel: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
    macroDonutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    macroLegend: { flex: 1, gap: 10 },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendTick: { width: 10, height: 2, borderRadius: 1 },
    legendLabel: { fontSize: 13, color: DS.textSecond, flex: 1 },
    legendVal: { fontFamily: Fonts.mono, fontSize: 13, fontWeight: '600', color: DS.textPrimary },
    macroTargetRow: { marginBottom: Spacing.sm },
    macroTargetLabel: { fontSize: 12, color: DS.textSecond, marginBottom: 2 },
    macroTargetVal: { fontFamily: Fonts.mono, fontSize: 11, color: DS.textMuted, marginBottom: 4 },
    mealRow: { marginBottom: Spacing.md },
    mealRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    mealName: { fontSize: 14, fontWeight: '600', color: DS.textPrimary },
    mealVal: { fontFamily: Fonts.mono, fontSize: 11, color: DS.textSecond },
    mealTrack: {
      height: 8,
      backgroundColor: DS.raised,
      borderRadius: 4,
      overflow: 'visible',
      position: 'relative',
    },
    mealFill: {
      height: 8,
      backgroundColor: DS.accent,
      borderRadius: 4,
    },
    mealTargetTick: {
      position: 'absolute',
      top: -3,
      width: 2,
      height: 14,
      backgroundColor: DS.statusBad,
      borderRadius: 1,
    },
    mealLegendRow: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.xs },
    sectionLabelCaps: {
      fontSize: 11,
      fontWeight: '600',
      color: DS.textMuted,
      letterSpacing: 0.5,
      marginBottom: Spacing.sm,
    },
    topFoodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: 7,
    },
    topFoodRank: {
      fontFamily: Fonts.mono,
      fontSize: 11,
      color: DS.textMuted,
      width: 14,
    },
    topFoodName: { flex: 1, fontSize: 13, color: DS.textPrimary },
    topFoodVal: { fontFamily: Fonts.mono, fontSize: 12, color: DS.textSecond },
    trainingStatsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    trainingStat: { alignItems: 'center', flex: 1 },
    trainingStatValue: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily: Fonts.mono,
      color: DS.textPrimary,
      marginBottom: 2,
    },
    trainingStatLabel: {
      fontSize: 10,
      color: DS.textSecond,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    muscleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
    muscleLabel: { width: 76, fontSize: 12, color: DS.textSecond },
    muscleBarTrack: { flex: 1, height: 8, backgroundColor: DS.raised, borderRadius: 4, overflow: 'hidden' },
    muscleBarFill: { height: 8, backgroundColor: DS.accent, borderRadius: 4 },
    muscleSets: { fontFamily: Fonts.mono, fontSize: 11, color: DS.textPrimary, width: 20, textAlign: 'right' },
    logWeightBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: DS.accent,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: Radius.full,
    },
    logWeightBtnText: { fontSize: 12, fontWeight: '600', color: DS.accentText },
    bodyMetricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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
      fontSize: 18,
      fontWeight: '700',
      fontFamily: Fonts.mono,
      color: DS.textPrimary,
      marginBottom: 2,
    },
    bodyMetricLabel: {
      fontSize: 10,
      color: DS.textSecond,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    weightDeltaText: {
      fontSize: 12,
      color: DS.textSecond,
      marginTop: Spacing.sm,
      textAlign: 'center',
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
