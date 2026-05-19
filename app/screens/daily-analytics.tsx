import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DailyAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { day } = useLocalSearchParams<{ day?: string }>();
  const dayNum = day ?? '16';

  const macros = [
    { name: 'Protein', consumed: 92, target: 150, pct: 61 },
    { name: 'Carbs', consumed: 148, target: 200, pct: 74 },
    { name: 'Fats', consumed: 48, target: 70, pct: 68 },
  ];

  const extras = [
    { icon: 'water-outline', label: 'Water', val: '2.4L', sub: '6 of 8 glasses' },
    { icon: 'flame-outline', label: 'Burned', val: '540', sub: 'kcal active' },
    { icon: 'moon-outline', label: 'Sleep', val: '7.5h', sub: '85% quality' },
    { icon: 'restaurant-outline', label: 'Meals', val: '3', sub: 'logged today' },
    { icon: 'fitness-outline', label: 'Steps', val: '8,240', sub: 'steps walked' },
    { icon: 'heart-outline', label: 'Avg HR', val: '72', sub: 'bpm resting' },
  ];

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader
          title={`May ${dayNum}`}
          subtitle="Daily analytics overview"
          rightElement={
            <View style={styles.scoreBadge}>
              <MonoText bold style={styles.scoreVal}>82</MonoText>
              <ThemedText style={styles.scoreOf}>/100</ThemedText>
            </View>
          }
        />

        {/* Calorie Summary */}
        <Card>
          <View style={styles.calRow}>
            <View style={styles.calLeft}>
              <MonoText bold style={styles.calBig}>2,140</MonoText>
              <ThemedText style={styles.calLabel}>kcal consumed</ThemedText>
            </View>
            <View style={styles.calRight}>
              <View style={styles.calItem}>
                <MonoText style={styles.calItemVal}>2,400</MonoText>
                <ThemedText style={styles.calItemLabel}>Goal</ThemedText>
              </View>
              <View style={styles.calDivider} />
              <View style={styles.calItem}>
                <MonoText style={styles.calItemVal}>260</MonoText>
                <ThemedText style={styles.calItemLabel}>Remaining</ThemedText>
              </View>
            </View>
          </View>
          <ProgressBar progress={2140 / 2400} />
          <ThemedText style={styles.calSub}>89% of daily goal · +12% vs yesterday</ThemedText>
        </Card>

        {/* Macro detail */}
        <Card>
          <ThemedText style={styles.sectionTitle}>Macronutrients</ThemedText>
          {macros.map(m => (
            <View key={m.name} style={styles.macroRow}>
              <View style={styles.macroLabel}>
                <ThemedText style={styles.macroName}>{m.name}</ThemedText>
                <MonoText style={styles.macroVal}>{m.consumed}g / {m.target}g</MonoText>
              </View>
              <ProgressBar progress={m.pct / 100} />
              <ThemedText style={styles.macroPct}>{m.pct}%</ThemedText>
            </View>
          ))}
        </Card>

        {/* Extra stats grid */}
        <Card>
          <ThemedText style={styles.sectionTitle}>Health Metrics</ThemedText>
          <View style={styles.extrasGrid}>
            {extras.map(e => (
              <View key={e.label} style={styles.extraCard}>
                <Ionicons name={e.icon as any} size={16} color={DS.textSecond} />
                <MonoText bold style={styles.extraVal}>{e.val}</MonoText>
                <ThemedText style={styles.extraLabel}>{e.label}</ThemedText>
                <ThemedText style={styles.extraSub}>{e.sub}</ThemedText>
              </View>
            ))}
          </View>
        </Card>

        {/* Timeline */}
        <Card>
          <ThemedText style={styles.sectionTitle}>Meal Timeline</ThemedText>
          {[
            { time: '8:30 AM', name: 'Peanut Butter Toast', cal: 320, meal: 'Breakfast' },
            { time: '12:45 PM', name: 'Chicken Rice Bowl', cal: 520, meal: 'Lunch' },
            { time: '5:15 PM', name: 'Protein Shake', cal: 180, meal: 'Snack' },
          ].map((item, i, arr) => (
            <View key={item.time} style={[styles.timelineRow, i < arr.length - 1 && styles.timelineBorder]}>
              <View style={styles.timelineDot} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.timelineName}>{item.name}</ThemedText>
                <ThemedText style={styles.timelineMeta}>{item.meal} · {item.time}</ThemedText>
              </View>
              <MonoText style={styles.timelineCal}>{item.cal} kcal</MonoText>
            </View>
          ))}
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },

  scoreBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 1, backgroundColor: DS.raised, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: DS.border },
  scoreVal: { fontSize: 22 },
  scoreOf: { fontSize: 12, color: DS.textMuted },

  calRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  calLeft: {},
  calBig: { fontSize: 32, lineHeight: 36 },
  calLabel: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
  calRight: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 0 },
  calItem: { alignItems: 'center', paddingHorizontal: 14 },
  calItemVal: { fontSize: 16 },
  calItemLabel: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
  calDivider: { width: 1, height: 36, backgroundColor: DS.border },
  calSub: { marginTop: 8, fontSize: 11, color: DS.textMuted },

  sectionTitle: { fontSize: 15, fontWeight: '600', color: DS.textPrimary, marginBottom: 14 },

  macroRow: { marginBottom: 14 },
  macroLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  macroName: { fontSize: 13, fontWeight: '500', color: DS.textPrimary },
  macroVal: { fontSize: 12, color: DS.textSecond },
  macroPct: { fontSize: 11, color: DS.textMuted, marginTop: 4, textAlign: 'right' },

  extrasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  extraCard: { width: '47%', backgroundColor: DS.card, borderRadius: 12, padding: 13, borderWidth: 1, borderColor: DS.border, gap: 3 },
  extraVal: { fontSize: 22, marginTop: 6 },
  extraLabel: { fontSize: 12, fontWeight: '500', color: DS.textPrimary },
  extraSub: { fontSize: 11, color: DS.textMuted },

  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  timelineBorder: { borderBottomWidth: 1, borderBottomColor: DS.border },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: DS.accent },
  timelineName: { fontSize: 14, fontWeight: '500', color: DS.textPrimary },
  timelineMeta: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
  timelineCal: { fontSize: 13, color: DS.textSecond },
});
