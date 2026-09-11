import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { DS, Fonts, Radius, Spacing } from '@/constants/theme';
import { nutritionService } from '@/services/api/nutrition';
import { userService } from '@/services/api/user';
import type { AIInsight, ProfileData } from '@/types';

type WeeklySummary = Awaited<ReturnType<typeof nutritionService.getWeeklySummary>>;

export default function DailyAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      nutritionService.getWeeklySummary(),
      userService.getProfile(),
      nutritionService.getAIInsights().catch(() => []),
    ])
      .then(([s, p, i]) => {
        setSummary(s);
        setProfile(p);
        setInsights(i);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  if (loading || !summary) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <ActivityIndicator color="#000000" />
      </SafeAreaView>
    );
  }

  const hasWeekData = summary.days.some((d) => d.calories > 0);
  const bodyWeight = profile?.bodyMetrics?.weight ?? null;
  const goalWeight = profile?.bodyMetrics?.goalWeight ?? null;
  const bmi = profile?.bodyMetrics?.bmi ?? null;
  const bodyFat = profile?.bodyMetrics?.bodyFatPercent ?? null;
  const maxCal = Math.max(summary.calorieGoal, ...summary.days.map((d) => d.calories), 1);

  const macroRows = [
    { name: 'Protein', consumed: summary.avgProtein, target: summary.macroTargets.protein },
    { name: 'Carbs', consumed: summary.avgCarbs, target: summary.macroTargets.carbs },
    { name: 'Fats', consumed: summary.avgFats, target: summary.macroTargets.fats },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000000" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Trends & Analytics</ThemedText>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>

        {!hasWeekData ? (
          <View style={styles.card}>
            <View style={styles.emptyState}>
              <Ionicons name="stats-chart-outline" size={26} color={DS.textMuted} />
              <ThemedText style={styles.emptyTitle}>No meals logged this week</ThemedText>
              <ThemedText style={styles.emptySub}>
                Log food to see your calorie and macro trends here.
              </ThemedText>
            </View>
          </View>
        ) : (
          <>
            {/* Calorie Intake Bar Chart Card */}
            <View style={styles.card}>
              <ThemedText style={styles.sectionHeaderCaps}>AVG CALORIES</ThemedText>
              <View style={styles.chartHeaderRow}>
                <ThemedText style={styles.chartBigVal}>
                  {summary.avgCalories.toLocaleString()} <ThemedText style={styles.chartUnit}>kcal/day</ThemedText>
                </ThemedText>
                {summary.calorieDeltaPercent != null && (
                  <View style={styles.deltaBadge}>
                    <Ionicons
                      name={summary.calorieDeltaPercent >= 0 ? 'arrow-up-outline' : 'arrow-down-outline'}
                      size={12}
                      color="#000000"
                    />
                    <ThemedText style={styles.deltaText}>
                      {Math.abs(summary.calorieDeltaPercent)}% vs last week
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Bar Chart Bars */}
              <View style={styles.barChartContainer}>
                {summary.days.map((item, idx) => {
                  const heightPct = Math.round((item.calories / maxCal) * 100);
                  const isToday = idx === summary.days.length - 1;
                  return (
                    <View key={idx} style={styles.barColumn}>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { height: `${item.calories > 0 ? Math.max(heightPct, 4) : 0}%` },
                            isToday && styles.barFillActive,
                          ]}
                        />
                      </View>
                      <ThemedText style={[styles.barDayLabel, isToday && styles.barDayLabelActive]}>
                        {item.label}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Macros Breakdown Card */}
            <View style={styles.card}>
              <ThemedText style={styles.sectionHeaderCaps}>MACRO AVERAGES (DAILY)</ThemedText>
              {macroRows.map((m, idx) => {
                const pct = m.target ? Math.min(100, Math.round((m.consumed / m.target) * 100)) : 0;
                return (
                  <View key={m.name}>
                    <View style={styles.macroProgressRow}>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.macroName}>{m.name}</ThemedText>
                        <ThemedText style={styles.macroValMono}>{m.consumed}g / {m.target}g</ThemedText>
                      </View>
                      <ThemedText style={styles.macroPctText}>{pct}%</ThemedText>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                    {idx < macroRows.length - 1 && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Body Section */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionHeaderCaps}>BODY</ThemedText>
          {bodyWeight == null || bodyWeight === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="body-outline" size={22} color={DS.textMuted} />
              <ThemedText style={styles.emptySub}>Set up your body metrics in Profile to see this here.</ThemedText>
            </View>
          ) : (
            <View style={styles.bodyGrid}>
              <View style={styles.bodyStat}>
                <ThemedText style={styles.chartBigValSmall}>
                  {bodyWeight}<ThemedText style={styles.chartUnit}> kg</ThemedText>
                </ThemedText>
                <ThemedText style={styles.macroName}>Current Weight</ThemedText>
              </View>
              {!!goalWeight && (
                <View style={styles.bodyStat}>
                  <ThemedText style={styles.chartBigValSmall}>
                    {goalWeight}<ThemedText style={styles.chartUnit}> kg</ThemedText>
                  </ThemedText>
                  <ThemedText style={styles.macroName}>Goal Weight</ThemedText>
                </View>
              )}
              {!!bmi && (
                <View style={styles.bodyStat}>
                  <ThemedText style={styles.chartBigValSmall}>{bmi.toFixed(1)}</ThemedText>
                  <ThemedText style={styles.macroName}>BMI</ThemedText>
                </View>
              )}
              {!!bodyFat && (
                <View style={styles.bodyStat}>
                  <ThemedText style={styles.chartBigValSmall}>{bodyFat}%</ThemedText>
                  <ThemedText style={styles.macroName}>Body Fat</ThemedText>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Insights Section — only shown once real insights exist */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionHeaderCaps}>KEY INSIGHTS</ThemedText>
            <View style={styles.cardGroup}>
              {insights.map((insight, idx) => (
                <View
                  key={insight.id}
                  style={[styles.insightRow, idx === insights.length - 1 && { borderBottomWidth: 0 }]}>
                  <Ionicons name={(insight.icon as any) || 'sparkles-outline'} size={20} color="#000000" />
                  <ThemedText style={styles.insightSub}>{insight.text}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  centered: { alignItems: 'center', justifyContent: 'center' },
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
    width: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeaderCaps: {
    fontSize: 11,
    fontWeight: '600',
    color: DS.textSecond,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  emptySub: {
    fontSize: 13,
    color: DS.textSecond,
    textAlign: 'center',
    lineHeight: 18,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  chartBigVal: {
    fontFamily: Fonts.mono,
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  chartBigValSmall: {
    fontFamily: Fonts.mono,
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  chartUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: DS.textSecond,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: DS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: Spacing.md,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 24,
    height: 110,
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
  barDayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: DS.textSecond,
    marginTop: 6,
  },
  barDayLabelActive: {
    color: '#000000',
  },
  macroProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  macroValMono: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: DS.textSecond,
  },
  macroPctText: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F3F3F3',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: DS.border,
    marginVertical: Spacing.md,
  },
  bodyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.xs,
  },
  bodyStat: {
    minWidth: '40%',
    gap: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
  },
  insightSub: {
    flex: 1,
    fontSize: 13,
    color: '#000000',
  },
});
