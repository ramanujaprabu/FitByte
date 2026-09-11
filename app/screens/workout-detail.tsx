import { BackButton } from '@/components/shared/BackButton';
import { MonoText } from '@/components/shared/MonoText';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing } from '@/constants/theme';
import { workoutService } from '@/services/api/workout';
import type { WorkoutRoutine } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WorkoutDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    workoutService.getRoutine(id).then(setRoutine).finally(() => setLoading(false));
  }, [id]));

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
            Routine not found.
          </ThemedText>
        </View>
      </View>
    );
  }

  const totalSets = routine.exercises.reduce((s, e) => s + e.targetSets, 0);
  const estMinutes = Math.round(totalSets * 2.5); // ~2.5 min per set incl. rest — a display estimate only

  return (
    <View style={styles.container}>
      <BackButton />
      <Pressable
        style={[styles.editBtn, { top: insets.top + 12 }]}
        onPress={() => router.push({ pathname: '/screens/create-routine', params: { id: routine.id } })}>
        <Ionicons name="create-outline" size={18} color={DS.textPrimary} />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 100 }]}>

        {/* Header Card */}
        <View style={styles.heroCard}>
          <ThemedText style={styles.routineName}>{routine.name}</ThemedText>
          <ThemedText style={styles.routineMuscles}>{routine.muscles}</ThemedText>
          <View style={styles.statsRow}>
            {[
              { icon: 'barbell-outline', val: `${routine.exercises.length}`, label: 'Exercises' },
              { icon: 'layers-outline', val: `${totalSets}`, label: 'Sets' },
              { icon: 'time-outline', val: `~${estMinutes}m`, label: 'Est. Time' },
            ].map(s => (
              <View key={s.label} style={styles.statBlock}>
                <Ionicons name={s.icon as any} size={16} color={DS.textSecond} />
                <MonoText bold style={styles.statVal}>{s.val}</MonoText>
                <ThemedText style={styles.statLabel}>{s.label}</ThemedText>
              </View>
            ))}
          </View>
          <ThemedText style={styles.lastPerformed}>Last performed · {routine.lastPerformed}</ThemedText>
        </View>

        {/* Exercise List */}
        <ThemedText style={styles.sectionTitle}>Exercises</ThemedText>
        {routine.exercises.map((ex, i) => (
          <View key={ex.id} style={styles.exCard}>
            <View style={styles.exNum}>
              <MonoText style={styles.exNumText}>{i + 1}</MonoText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.exName}>{ex.name}</ThemedText>
              <ThemedText style={styles.exMeta}>{ex.targetSets} sets · {ex.targetReps} reps · {ex.restSeconds}s rest</ThemedText>
            </View>
          </View>
        ))}

        {/* Start Button */}
        <Pressable
          onPress={() => router.push({ pathname: '/screens/log-workout', params: { id: routine.id } })}
          style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name="play" size={18} color={DS.accentText} />
          <ThemedText style={styles.startBtnText}>Start Workout</ThemedText>
        </Pressable>

      </ScrollView>
    </View>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    scroll: { paddingHorizontal: 20 },
    editBtn: {
      position: 'absolute', right: 16, zIndex: 100,
      width: 44, height: 44, borderRadius: 22, backgroundColor: DS.surface,
      alignItems: 'center', justifyContent: 'center',
    },
    heroCard: { backgroundColor: DS.surface, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: 20 },
    routineName: { fontSize: 24, fontWeight: '600', color: DS.textPrimary },
    routineMuscles: { marginTop: 4, fontSize: 13, color: DS.textSecond, marginBottom: 20 },
    statsRow: { flexDirection: 'row', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: DS.border },
    statBlock: { flex: 1, alignItems: 'center', gap: 4 },
    statVal: { fontSize: 18, marginTop: 4 },
    statLabel: { fontSize: 11, color: DS.textMuted },
    lastPerformed: { marginTop: 14, fontSize: 12, color: DS.textMuted },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: DS.textPrimary, marginBottom: 12 },
    exCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: DS.surface, borderRadius: Radius.md, padding: 14, marginBottom: 8,
    },
    exNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: DS.raised, justifyContent: 'center', alignItems: 'center' },
    exNumText: { fontSize: 12, color: DS.textSecond },
    exName: { fontWeight: '600', fontSize: 14, color: DS.textPrimary },
    exMeta: { marginTop: 2, fontSize: 11, color: DS.textMuted },
    startBtn: {
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
      backgroundColor: DS.accent, paddingVertical: 15, borderRadius: Radius.full, marginTop: 8,
    },
    startBtnText: { color: DS.accentText, fontWeight: '600', fontSize: 15 },
  });
}
