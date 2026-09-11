import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { LoadingState } from '@/components/shared/LoadingState';
import { MonoText } from '@/components/shared/MonoText';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { nutritionService } from '@/services/api/nutrition';
import type { AIInsight, DailyNutrition } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WeeklySummary = Awaited<ReturnType<typeof nutritionService.getWeeklySummary>>;

// Calories per gram, for deriving "kcal from Xg" per macro.
const CAL_PER_GRAM = { Protein: 4, Carbs: 4, Fats: 9 } as const;

export default function MacroBreakdownScreen() {
  const insets = useSafeAreaInsets();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const [today, setToday] = useState<DailyNutrition | null>(null);
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      nutritionService.getDailyNutrition(),
      nutritionService.getWeeklySummary(),
      nutritionService.getAIInsights().catch(() => []),
    ])
      .then(([d, w, i]) => {
        setToday(d);
        setWeekly(w);
        setInsights(i);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  if (loading || !today || !weekly) {
    return (
      <View style={styles.container}>
        <BackButton />
        <LoadingState />
      </View>
    );
  }

  const macros = [
    { name: 'Protein' as const, consumed: Math.round(today.macros.protein.consumed), target: today.macros.protein.target, icon: 'barbell-outline' },
    { name: 'Carbs' as const, consumed: Math.round(today.macros.carbs.consumed), target: today.macros.carbs.target, icon: 'leaf-outline' },
    { name: 'Fats' as const, consumed: Math.round(today.macros.fats.consumed), target: today.macros.fats.target, icon: 'water-outline' },
  ].map((m) => ({
    ...m,
    cal: m.consumed * CAL_PER_GRAM[m.name],
    pct: m.target ? Math.min(100, Math.round((m.consumed / m.target) * 100)) : 0,
  }));

  const totalConsumed = today.caloriesConsumed;
  const totalTarget = today.calorieGoal;

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Macro Breakdown" subtitle="Today's detailed nutrition" />

        {/* Calorie Summary */}
        <Card>
          <View style={styles.calRow}>
            <View style={styles.calMain}>
              <MonoText bold style={styles.calBig}>{totalConsumed.toLocaleString()}</MonoText>
              <ThemedText style={styles.calLabel}>kcal consumed</ThemedText>
            </View>
            <View style={styles.calDivider} />
            <View style={styles.calSide}>
              <MonoText style={styles.calSideVal}>{totalTarget.toLocaleString()}</MonoText>
              <ThemedText style={styles.calSideLabel}>Goal</ThemedText>
            </View>
            <View style={styles.calSide}>
              <MonoText style={styles.calSideVal}>{Math.max(0, totalTarget - totalConsumed).toLocaleString()}</MonoText>
              <ThemedText style={styles.calSideLabel}>Remaining</ThemedText>
            </View>
          </View>
          <ProgressBar progress={totalTarget ? totalConsumed / totalTarget : 0} />
          <ThemedText style={styles.calSub}>
            {totalTarget ? Math.round((totalConsumed / totalTarget) * 100) : 0}% of daily goal
          </ThemedText>
        </Card>

        {/* Per-Macro Detail */}
        {macros.map(m => (
          <Card key={m.name}>
            <View style={styles.macroTop}>
              <View style={styles.macroIcon}>
                <Ionicons name={m.icon as any} size={17} color={DS.textSecond} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.macroName}>{m.name}</ThemedText>
                <ThemedText style={styles.macroSub}>{m.cal} kcal from {m.consumed}g</ThemedText>
              </View>
              <View style={styles.macroPctBox}>
                <MonoText bold style={styles.macroPct}>{m.pct}%</MonoText>
              </View>
            </View>
            <ProgressBar progress={m.pct / 100} />
            <View style={styles.macroStats}>
              <View style={styles.macroStat}>
                <MonoText bold style={styles.macroStatVal}>{m.consumed}g</MonoText>
                <ThemedText style={styles.macroStatLabel}>Consumed</ThemedText>
              </View>
              <View style={styles.macroStat}>
                <MonoText bold style={styles.macroStatVal}>{m.target}g</MonoText>
                <ThemedText style={styles.macroStatLabel}>Target</ThemedText>
              </View>
              <View style={styles.macroStat}>
                <MonoText bold style={styles.macroStatVal}>{Math.max(0, m.target - m.consumed)}g</MonoText>
                <ThemedText style={styles.macroStatLabel}>Remaining</ThemedText>
              </View>
            </View>
          </Card>
        ))}

        {/* Weekly trend chart — % of calorie goal hit each day */}
        <Card>
          <ThemedText style={styles.sectionTitle}>Weekly Trend</ThemedText>
          <ThemedText style={styles.sectionSub}>% of calorie goal hit per day</ThemedText>
          <View style={styles.chart}>
            {weekly.days.map((d, i) => {
              const pct = weekly.calorieGoal ? Math.round((d.calories / weekly.calorieGoal) * 100) : 0;
              return (
                <View key={i} style={styles.chartCol}>
                  <MonoText style={styles.chartVal}>{pct}</MonoText>
                  <View style={[styles.chartBar, { height: Math.max(Math.min(pct, 100) * 1.2, d.calories > 0 ? 4 : 1) }]} />
                  <ThemedText style={styles.chartDay}>{d.label}</ThemedText>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Real insights only — hidden until something is actually generated */}
        {insights.length > 0 && (
          <Card>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles-outline" size={15} color={DS.textSecond} />
              <ThemedText style={styles.aiTitle}>Insight</ThemedText>
            </View>
            <ThemedText style={styles.aiText}>{insights[0].text}</ThemedText>
          </Card>
        )}

      </ScrollView>
    </View>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    scroll: { paddingHorizontal: 20 },

    calRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
    calMain: {},
    calBig: { fontSize: 34, lineHeight: 38 },
    calLabel: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
    calDivider: { width: 1, height: 40, backgroundColor: DS.border },
    calSide: { flex: 1 },
    calSideVal: { fontSize: 16 },
    calSideLabel: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
    calSub: { fontSize: 11, color: DS.textMuted, marginTop: 8 },

    macroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    macroIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: DS.raised, justifyContent: 'center', alignItems: 'center' },
    macroName: { fontWeight: '600', fontSize: 15, color: DS.textPrimary },
    macroSub: { marginTop: 2, fontSize: 12, color: DS.textMuted },
    macroPctBox: { backgroundColor: DS.raised, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    macroPct: { fontSize: 14 },
    macroStats: { flexDirection: 'row', gap: 0, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: DS.border },
    macroStat: { flex: 1, alignItems: 'center', gap: 3 },
    macroStatVal: { fontSize: 17 },
    macroStatLabel: { fontSize: 11, color: DS.textMuted },

    sectionTitle: { fontSize: 15, fontWeight: '600', color: DS.textPrimary, marginBottom: 2 },
    sectionSub: { fontSize: 11, color: DS.textMuted, marginBottom: 16 },
    chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130 },
    chartCol: { alignItems: 'center', gap: 4 },
    chartVal: { fontSize: 9, color: DS.textMuted },
    chartBar: { width: 20, borderRadius: 4, backgroundColor: DS.raised },
    chartDay: { fontSize: 11, color: DS.textMuted },

    aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    aiTitle: { fontSize: 14, fontWeight: '600', color: DS.textPrimary },
    aiText: { fontSize: 13, color: DS.textSecond, lineHeight: 20 },
  });
}
