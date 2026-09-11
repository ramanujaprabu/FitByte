import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MACROS = [
  { name: 'Protein', consumed: 92, target: 150, cal: 368, icon: 'barbell-outline', pct: 61 },
  { name: 'Carbs', consumed: 148, target: 200, cal: 592, icon: 'leaf-outline', pct: 74 },
  { name: 'Fats', consumed: 48, target: 70, cal: 432, icon: 'water-outline', pct: 68 },
];

const WEEKLY_DATA = [62, 84, 55, 91, 73, 88, 68];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function MacroBreakdownScreen() {
  const insets = useSafeAreaInsets();
  const totalConsumed = MACROS.reduce((s, m) => s + m.cal, 0);
  const totalTarget = 2400;

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
              <MonoText style={styles.calSideVal}>{(totalTarget - totalConsumed).toLocaleString()}</MonoText>
              <ThemedText style={styles.calSideLabel}>Remaining</ThemedText>
            </View>
          </View>
          <ProgressBar progress={totalConsumed / totalTarget} />
          <ThemedText style={styles.calSub}>{Math.round((totalConsumed / totalTarget) * 100)}% of daily goal</ThemedText>
        </Card>

        {/* Per-Macro Detail */}
        {MACROS.map(m => (
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
                <MonoText bold style={styles.macroStatVal}>{m.target - m.consumed}g</MonoText>
                <ThemedText style={styles.macroStatLabel}>Remaining</ThemedText>
              </View>
            </View>
          </Card>
        ))}

        {/* Weekly trend chart */}
        <Card>
          <ThemedText style={styles.sectionTitle}>Weekly Trend</ThemedText>
          <View style={styles.chart}>
            {WEEKLY_DATA.map((h, i) => (
              <View key={i} style={styles.chartCol}>
                <MonoText style={styles.chartVal}>{h}</MonoText>
                <View style={[styles.chartBar, { height: h * 1.2 }]} />
                <ThemedText style={styles.chartDay}>{DAYS[i]}</ThemedText>
              </View>
            ))}
          </View>
        </Card>

        {/* AI Tip */}
        <Card>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles-outline" size={15} color={DS.textSecond} />
            <ThemedText style={styles.aiTitle}>AI Suggestion</ThemedText>
          </View>
          <ThemedText style={styles.aiText}>
            You're consistently hitting carb targets but falling short on protein.
            Consider adding a post-workout protein shake to close the gap.
          </ThemedText>
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  macroIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  macroName: { fontWeight: '600', fontSize: 15, color: DS.textPrimary },
  macroSub: { marginTop: 2, fontSize: 12, color: DS.textMuted },
  macroPctBox: { backgroundColor: DS.raised, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: DS.border },
  macroPct: { fontSize: 14 },
  macroStats: { flexDirection: 'row', gap: 0, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: DS.border },
  macroStat: { flex: 1, alignItems: 'center', gap: 3 },
  macroStatVal: { fontSize: 17 },
  macroStatLabel: { fontSize: 11, color: DS.textMuted },

  sectionTitle: { fontSize: 15, fontWeight: '600', color: DS.textPrimary, marginBottom: 16 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130 },
  chartCol: { alignItems: 'center', gap: 4 },
  chartVal: { fontSize: 9, color: DS.textMuted },
  chartBar: { width: 20, borderRadius: 4, backgroundColor: DS.raised },
  chartDay: { fontSize: 11, color: DS.textMuted },

  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiTitle: { fontSize: 14, fontWeight: '600', color: DS.textPrimary },
  aiText: { fontSize: 13, color: DS.textSecond, lineHeight: 20 },
});
