import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/shared/BottomSheet';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StatCard } from '@/components/shared/StatCard';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';

import {
  MOCK_RECENT_SESSIONS,
  MOCK_ROUTINES,
  MOCK_WORKOUT_DAYS,
  MOCK_WORKOUT_STATS,
} from '@/data/workout';
import type { WorkoutDayLevel } from '@/types';
import { formatMonthYear } from '@/utils/format';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const HM_COLORS: Record<WorkoutDayLevel, string> = {
  empty: DS.hmEmpty, low: DS.hmLow, mid: DS.hmMid, high: '#E8E8E8',
};

export default function WorkoutTrackerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = new Date();
  const currentDate = today.getDate();
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [sheetDay, setSheetDay] = useState<number | null>(null);

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const calendarDays = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [firstDay, daysInMonth]);

  const getDayLevel = (day: number): WorkoutDayLevel =>
    (MOCK_WORKOUT_DAYS[day] as WorkoutDayLevel) ?? 'empty';
  const getDayBg = (day: number) => HM_COLORS[getDayLevel(day)];
  const isDarkTile = (day: number) => getDayLevel(day) === 'empty' || getDayLevel(day) === 'low';

  const handleDayPress = (day: number) => {
    setSelectedDate(day);
    if (MOCK_WORKOUT_DAYS[day]) setSheetDay(day);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}>

        {/* HEADER */}
        <Card style={{ marginBottom: 16 }}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText style={styles.monthText}>{formatMonthYear()}</ThemedText>
              <ThemedText type="title" style={styles.title}>Workout Tracker</ThemedText>
              <ThemedText style={styles.subtitle}>Stay consistent. Build strength.</ThemedText>
            </View>
            <Image source={{ uri: 'https://i.pravatar.cc/200?img=12' }} style={styles.avatar} />
          </View>
          <View style={styles.headerBottom}>
            <View style={styles.streakBadge}>
              <Ionicons name="flame-outline" size={13} color={DS.textSecond} />
              <ThemedText style={styles.streakText}>12 Day Streak</ThemedText>
            </View>
            <Pressable style={styles.addBtn} onPress={() => router.push('/screens/log-workout')}>
              <Ionicons name="add" size={15} color="#fff" />
              <ThemedText style={styles.addBtnText}>Log Workout</ThemedText>
            </Pressable>
          </View>
        </Card>

        {/* QUICK STATS */}
        <View style={styles.statsRow}>
          <StatCard icon="barbell-outline" value={String(MOCK_WORKOUT_STATS.weeklyWorkouts)} label="Workouts" />
          <StatCard icon="time-outline" value={MOCK_WORKOUT_STATS.weeklyHours} label="Hours" />
          <StatCard icon="flame-outline" value={MOCK_WORKOUT_STATS.weeklyCalories} label="Calories" />
          <StatCard icon="flash-outline" value={`${MOCK_WORKOUT_STATS.currentStreak}d`} label="Streak" />
        </View>

        {/* CREATE ROUTINE */}
        <Card>
          <SectionHeader title="Create Routine"
            rightElement={
              <Pressable style={styles.createBtn} onPress={() => router.push('/screens/create-routine')}>
                <Ionicons name="sparkles-outline" size={13} color="#fff" />
                <ThemedText style={styles.createBtnText}>Create</ThemedText>
              </Pressable>
            }
          />
          <Pressable style={styles.routinePreview} onPress={() => router.push({ pathname: '/screens/workout-detail', params: { id: 'r1' } })}>
            <View style={styles.routinePreviewTop}>
              <View>
                <ThemedText style={styles.routineName}>Push Day</ThemedText>
                <ThemedText style={styles.routineMuscles}>Chest + Triceps + Shoulders</ThemedText>
              </View>
              <View style={styles.durationBadge}>
                <MonoText style={styles.durationText}>75 mins</MonoText>
              </View>
            </View>
            <View style={styles.exChips}>
              {['Bench Press', 'Incline DB', 'Dips', 'OHP'].map(ex => (
                <View key={ex} style={styles.chip}>
                  <ThemedText style={styles.chipText}>{ex}</ThemedText>
                </View>
              ))}
            </View>
          </Pressable>
        </Card>

        {/* SAVED ROUTINES */}
        <View style={styles.rowHeader}>
          <ThemedText type="subtitle">Saved Routines</ThemedText>
          <ThemedText style={styles.mutedText}>8 Routines</ThemedText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routineScroll}>
          {MOCK_ROUTINES.map(r => (
            <Pressable key={r.id} style={styles.routineCard}
              onPress={() => router.push({ pathname: '/screens/workout-detail', params: { id: r.id } })}>
              <View style={styles.routineCardTop}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.cardTitle}>{r.name}</ThemedText>
                  <ThemedText style={styles.cardSub}>{r.muscles}</ThemedText>
                </View>
                {r.isFavorite && <Ionicons name="star-outline" size={15} color={DS.textSecond} />}
              </View>
              <View style={styles.cardStats}>
                {[
                  { icon: 'barbell-outline', val: `${r.exercises} Ex` },
                  { icon: 'time-outline', val: `${r.durationMins} min` },
                  { icon: 'flame-outline', val: r.estimatedCalories },
                ].map((s, i) => (
                  <View key={i} style={styles.cardStat}>
                    <Ionicons name={s.icon as any} size={11} color={DS.textMuted} />
                    <ThemedText style={styles.cardStatText}>{s.val}</ThemedText>
                  </View>
                ))}
              </View>
              <View style={styles.cardBottom}>
                <ThemedText style={styles.lastText}>Last · {r.lastPerformed}</ThemedText>
                <Pressable style={styles.playBtn}
                  onPress={() => router.push({ pathname: '/screens/log-workout', params: { id: r.id } })}>
                  <Ionicons name="play" size={11} color="#fff" />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* WORKOUT CALENDAR */}
        <Card>
          <SectionHeader title="Workout Calendar" subtitle="Monthly consistency"
            rightElement={
              <View style={styles.consistBadge}>
                <MonoText bold style={styles.consistText}>78%</MonoText>
              </View>
            }
          />
          <View style={styles.calDayHeader}>
            {DAY_LABELS.map((d, i) => (
              <ThemedText key={`h${i}`} style={styles.calDayLabel}>{d}</ThemedText>
            ))}
          </View>
          <View style={styles.calGrid}>
            {calendarDays.map((day, idx) => {
              if (day === null) return <View key={`e${idx}`} style={styles.calCell} />;
              const isSelected = day === selectedDate;
              const isToday = day === currentDate;
              return (
                <Pressable key={day} onPress={() => handleDayPress(day)}
                  style={[styles.calCell, { justifyContent: 'center', alignItems: 'center' }]}>
                  <View style={[
                    styles.calCircle,
                    { backgroundColor: getDayBg(day) },
                    isToday && styles.calToday,
                    isSelected && styles.calSelected,
                  ]}>
                    <ThemedText style={[
                      styles.calNum,
                      { color: isDarkTile(day) ? DS.textMuted : '#1A1A1A' },
                      isSelected && { fontWeight: '700', color: isDarkTile(day) ? DS.textPrimary : '#1A1A1A' },
                    ]}>
                      {day}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.calStats}>
            {[
              { val: '18', label: 'Workouts' },
              { val: '32h', label: 'Training' },
              { val: '12', label: 'Streak' },
            ].map(s => (
              <View key={s.label} style={styles.calStat}>
                <MonoText bold style={styles.calStatVal}>{s.val}</MonoText>
                <ThemedText style={styles.calStatLabel}>{s.label}</ThemedText>
              </View>
            ))}
          </View>
        </Card>

        {/* RECENT ACTIVITY */}
        <View style={styles.rowHeader}>
          <ThemedText type="subtitle">Recent Activity</ThemedText>
          <Pressable onPress={() => router.push('/screens/recent-activities')}>
            <ThemedText style={styles.mutedText}>View All</ThemedText>
          </Pressable>
        </View>

        {MOCK_RECENT_SESSIONS.map(session => (
          <Pressable key={session.id}
            onPress={() => router.push('/screens/workout-detail')}
            style={styles.activityCard}>
            <View style={styles.activityLeft}>
              <View style={styles.activityIcon}>
                <Ionicons name="fitness-outline" size={17} color={DS.textSecond} />
              </View>
              <View>
                <ThemedText style={styles.activityTitle}>{session.routineName}</ThemedText>
                <ThemedText style={styles.activitySub}>{session.muscles}</ThemedText>
                <ThemedText style={styles.activityTime}>{session.timestamp}</ThemedText>
              </View>
            </View>
            <View style={styles.activityRight}>
              <MonoText bold style={styles.activityDuration}>{session.durationMins}</MonoText>
              <ThemedText style={styles.activityCalories}>{session.caloriesBurned}</ThemedText>
              <View style={styles.intensityBadge}>
                <ThemedText style={styles.intensityText}>{session.intensity}</ThemedText>
              </View>
            </View>
          </Pressable>
        ))}

      </ScrollView>

      {/* FLOATING ACTIONS */}
      <View style={[styles.floatingActions, { bottom: insets.bottom + 80 }]}>
        <Pressable style={[styles.fab, styles.fabPrimary]} onPress={() => router.push('/screens/log-workout')}>
          <Ionicons name="play" size={17} color="#fff" />
        </Pressable>
        <Pressable style={styles.fab} onPress={() => router.push('/screens/create-routine')}>
          <Ionicons name="add" size={17} color={DS.textPrimary} />
        </Pressable>
        <Pressable style={styles.fab} onPress={() => router.push('/screens/recent-activities')}>
          <Ionicons name="time-outline" size={17} color={DS.textPrimary} />
        </Pressable>
      </View>

      {/* Day Bottom Sheet */}
      <BottomSheet visible={sheetDay !== null} onClose={() => setSheetDay(null)}>
        <ThemedText style={styles.sheetTitle}>May {sheetDay}, 2026</ThemedText>
        <ThemedText style={styles.sheetSubtitle}>Workout logged this day</ThemedText>
        <View style={styles.sheetStats}>
          {[
            { label: 'Duration', val: '74 mins' },
            { label: 'Calories', val: '620 kcal' },
            { label: 'Intensity', val: 'High' },
          ].map(s => (
            <View key={s.label} style={styles.sheetStat}>
              <MonoText bold style={styles.sheetStatVal}>{s.val}</MonoText>
              <ThemedText style={styles.sheetStatLabel}>{s.label}</ThemedText>
            </View>
          ))}
        </View>
        <Pressable style={styles.sheetBtn} onPress={() => { setSheetDay(null); router.push('/screens/workout-detail'); }}>
          <ThemedText style={styles.sheetBtnText}>View Session Details</ThemedText>
        </Pressable>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scrollContent: { paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between' },
  monthText: { fontSize: 13, color: DS.textMuted },
  title: { marginTop: 6, color: DS.textPrimary },
  subtitle: { marginTop: 6, fontSize: 13, color: DS.textSecond },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: DS.border },
  headerBottom: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: DS.border },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: DS.raised, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: DS.border },
  streakText: { fontSize: 12, fontWeight: '500', color: DS.textSecond },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: DS.accent, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: DS.accent, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999 },
  createBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  routinePreview: { backgroundColor: DS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: DS.border },
  routinePreviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  routineName: { fontWeight: '600', fontSize: 14, color: DS.textPrimary },
  routineMuscles: { marginTop: 3, fontSize: 12, color: DS.textMuted },
  durationBadge: { backgroundColor: DS.raised, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7, borderWidth: 1, borderColor: DS.border },
  durationText: { fontSize: 12, color: DS.textSecond },
  exChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: { backgroundColor: DS.raised, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: DS.border },
  chipText: { fontSize: 11, fontWeight: '500', color: DS.textSecond },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  mutedText: { fontSize: 13, color: DS.textMuted },
  routineScroll: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  routineCard: { width: 185, backgroundColor: DS.surface, borderRadius: 14, borderWidth: 1, borderColor: DS.border, padding: 15 },
  routineCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontWeight: '600', fontSize: 14, color: DS.textPrimary },
  cardSub: { marginTop: 2, fontSize: 11, color: DS.textMuted },
  cardStats: { gap: 6, marginBottom: 12 },
  cardStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardStatText: { fontSize: 11, color: DS.textSecond },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: DS.border },
  lastText: { fontSize: 10, color: DS.textMuted },
  playBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: DS.accent, justifyContent: 'center', alignItems: 'center' },
  consistBadge: { backgroundColor: DS.raised, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: DS.border },
  consistText: { fontSize: 13 },
  calDayHeader: { flexDirection: 'row', marginBottom: 6 },
  calDayLabel: { width: `${100 / 7}%` as any, textAlign: 'center', fontSize: 10, color: DS.textMuted, fontWeight: '500' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%` as any, aspectRatio: 1, padding: 4 },
  calCircle: { width: '100%', height: '100%', borderRadius: 999, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  calToday: { borderColor: DS.textSecond, borderWidth: 1.5 },
  calSelected: { borderColor: DS.accent, borderWidth: 2 },
  calNum: { fontSize: 10, fontWeight: '500', fontFamily: DS.fontMono },
  calStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: DS.border },
  calStat: { alignItems: 'center', gap: 3 },
  calStatVal: { fontSize: 20 },
  calStatLabel: { fontSize: 11, color: DS.textMuted },
  activityCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: DS.surface, borderRadius: 12, borderWidth: 1, borderColor: DS.border, padding: 14, marginBottom: 8 },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  activityIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  activityTitle: { fontWeight: '600', fontSize: 14, color: DS.textPrimary },
  activitySub: { fontSize: 11, color: DS.textSecond, marginTop: 2 },
  activityTime: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
  activityRight: { alignItems: 'flex-end', gap: 2 },
  activityDuration: { fontSize: 13 },
  activityCalories: { fontSize: 11, color: DS.textSecond },
  intensityBadge: { backgroundColor: DS.raised, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, borderWidth: 1, borderColor: DS.border, marginTop: 3 },
  intensityText: { fontSize: 10, color: DS.textSecond, fontWeight: '500' },
  floatingActions: { position: 'absolute', right: 20, gap: 8 },
  fab: { width: 44, height: 44, borderRadius: 22, backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  fabPrimary: { backgroundColor: DS.accent, borderColor: DS.accent },
  // Sheet
  sheetTitle: { fontSize: 20, fontWeight: '600', color: DS.textPrimary },
  sheetSubtitle: { fontSize: 13, color: DS.textSecond, marginTop: 4, marginBottom: 20 },
  sheetStats: { flexDirection: 'row', gap: 0, marginBottom: 20 },
  sheetStat: { flex: 1, alignItems: 'center', gap: 4 },
  sheetStatVal: { fontSize: 18 },
  sheetStatLabel: { fontSize: 11, color: DS.textMuted },
  sheetBtn: { backgroundColor: DS.accent, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  sheetBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});