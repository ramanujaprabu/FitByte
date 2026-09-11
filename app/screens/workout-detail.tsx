import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import { workoutService } from '@/services/api/workout';
import type { WorkoutRoutine } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Fallback set/rep/rest suggestions for exercises without a specific entry.
const EXERCISE_DETAILS: Record<string, { sets: number; reps: string; rest: string }> = {
  'Bench Press': { sets: 4, reps: '8-10', rest: '90s' },
  'Incline DB': { sets: 3, reps: '10-12', rest: '75s' },
  'Dips': { sets: 3, reps: '12-15', rest: '60s' },
  'OHP': { sets: 3, reps: '8-10', rest: '90s' },
  'Deadlift': { sets: 4, reps: '5-6', rest: '120s' },
  'Pull-ups': { sets: 3, reps: '8-12', rest: '90s' },
  'Cable Row': { sets: 3, reps: '10-12', rest: '75s' },
  'Curl': { sets: 3, reps: '12-15', rest: '60s' },
  'Squat': { sets: 4, reps: '6-8', rest: '120s' },
  'Leg Press': { sets: 3, reps: '12-15', rest: '90s' },
  'RDL': { sets: 3, reps: '10-12', rest: '90s' },
  'Lunges': { sets: 3, reps: '12/leg', rest: '75s' },
  'Burpees': { sets: 4, reps: '15', rest: '45s' },
  'Jump Squat': { sets: 3, reps: '15', rest: '45s' },
  'Mountain Climber': { sets: 3, reps: '30s', rest: '30s' },
  'Box Jump': { sets: 3, reps: '10', rest: '60s' },
};

export default function WorkoutDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    workoutService
      .getRoutines()
      .then(routines => setRoutine(routines.find(r => r.id === id) ?? routines[0] ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={DS.accent} />
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={styles.container}>
        <BackButton />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
          <ThemedText style={{ color: DS.textSecond, textAlign: 'center' }}>
            No routines yet. Create one from the Workouts tab.
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        {/* Header Card */}
        <Card style={styles.heroCard}>
          <ThemedText style={styles.routineName}>{routine.name}</ThemedText>
          <ThemedText style={styles.routineMuscles}>{routine.muscles}</ThemedText>
          <View style={styles.statsRow}>
            {[
              { icon: 'barbell-outline', val: `${routine.exercises}`, label: 'Exercises' },
              { icon: 'time-outline', val: `${routine.durationMins}m`, label: 'Duration' },
              { icon: 'flame-outline', val: routine.estimatedCalories, label: 'Est. Burn' },
            ].map(s => (
              <View key={s.label} style={styles.statBlock}>
                <Ionicons name={s.icon as any} size={16} color={DS.textSecond} />
                <MonoText bold style={styles.statVal}>{s.val}</MonoText>
                <ThemedText style={styles.statLabel}>{s.label}</ThemedText>
              </View>
            ))}
          </View>
          <ThemedText style={styles.lastPerformed}>Last performed · {routine.lastPerformed}</ThemedText>
        </Card>

        {/* Exercise List */}
        <ThemedText style={styles.sectionTitle}>Exercise List</ThemedText>
        {routine.exerciseList.map((ex, i) => {
          const detail = EXERCISE_DETAILS[ex] ?? { sets: 3, reps: '10-12', rest: '60s' };
          const isOpen = expanded === ex;
          return (
            <Pressable key={ex} onPress={() => setExpanded(isOpen ? null : ex)} style={styles.exCard}>
              <View style={styles.exTop}>
                <View style={styles.exNum}>
                  <MonoText style={styles.exNumText}>{i + 1}</MonoText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.exName}>{ex}</ThemedText>
                  <ThemedText style={styles.exMeta}>{detail.sets} sets · {detail.reps} reps · {detail.rest} rest</ThemedText>
                </View>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={DS.textMuted} />
              </View>
              {isOpen && (
                <View style={styles.exDetail}>
                  {Array.from({ length: detail.sets }, (_, s) => (
                    <View key={s} style={styles.setRow}>
                      <ThemedText style={styles.setLabel}>Set {s + 1}</ThemedText>
                      <MonoText style={styles.setReps}>{detail.reps} reps</MonoText>
                      <ThemedText style={styles.setRest}>Rest {detail.rest}</ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}

        {/* Start Button */}
        <Pressable
          onPress={() => router.push({ pathname: '/screens/log-workout', params: { id: routine.id } })}
          style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name="play" size={18} color="#fff" />
          <ThemedText style={styles.startBtnText}>Start Workout</ThemedText>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },
  heroCard: { marginBottom: 20 },
  routineName: { fontSize: 24, fontWeight: '600', color: DS.textPrimary },
  routineMuscles: { marginTop: 4, fontSize: 13, color: DS.textSecond, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 0, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: DS.border },
  statBlock: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 18, marginTop: 4 },
  statLabel: { fontSize: 11, color: DS.textMuted },
  lastPerformed: { marginTop: 14, fontSize: 12, color: DS.textMuted },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: DS.textPrimary, marginBottom: 12 },
  exCard: { backgroundColor: DS.surface, borderRadius: 12, borderWidth: 1, borderColor: DS.border, marginBottom: 8, overflow: 'hidden' },
  exTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  exNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: DS.raised, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  exNumText: { fontSize: 12, color: DS.textSecond },
  exName: { fontWeight: '600', fontSize: 14, color: DS.textPrimary },
  exMeta: { marginTop: 2, fontSize: 11, color: DS.textMuted },
  exDetail: { backgroundColor: DS.card, paddingHorizontal: 14, paddingBottom: 12, borderTopWidth: 1, borderTopColor: DS.border },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: DS.border },
  setLabel: { fontSize: 13, color: DS.textSecond, width: 48 },
  setReps: { fontSize: 14, color: DS.textPrimary },
  setRest: { fontSize: 12, color: DS.textMuted },
  startBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: DS.accent, paddingVertical: 15, borderRadius: 14, marginTop: 8 },
  startBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
