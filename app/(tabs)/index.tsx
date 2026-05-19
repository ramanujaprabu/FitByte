import Ionicons from '@expo/vector-icons/Ionicons';
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
            </Pressable>
          </View>
        </View>

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