import { BackButton } from '@/components/shared/BackButton';
import { MonoText } from '@/components/shared/MonoText';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing } from '@/constants/theme';
import { workoutService } from '@/services/api/workout';
import type { SetType, WorkoutSession } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SET_TYPE_LABEL: Record<SetType, string> = { normal: '', warmup: 'W', dropset: 'D', failure: 'F' };

export default function SessionDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { id } = useLocalSearchParams<{ id: string }>();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    workoutService.getSessionDetail(id).then(setSession).finally(() => setLoading(false));
  }, [id]);

  const totalVolume = (session?.exercises ?? []).reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).reduce((s2, set) => s2 + set.weightKg * set.reps, 0),
    0
  );
  const totalSets = (session?.exercises ?? []).reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0);

  const confirmDelete = () => {
    if (!id) return;
    Alert.alert('Delete workout?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setDeleting(true);
          try {
            await workoutService.deleteSession(id);
            router.back();
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={DS.accent} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <BackButton />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
          <ThemedText style={{ color: DS.textSecond, textAlign: 'center' }}>Workout not found.</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <Pressable style={[styles.deleteBtn, { top: insets.top + 12 }]} onPress={confirmDelete} disabled={deleting}>
        <Ionicons name="trash-outline" size={18} color={DS.statusBad} />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ThemedText style={styles.routineName}>{session.routineName}</ThemedText>
        <ThemedText style={styles.timestamp}>{session.timestamp}</ThemedText>

        <View style={styles.statsRow}>
          {[
            { icon: 'time-outline', val: session.durationMins.replace(' mins', 'm'), label: 'Duration' },
            { icon: 'flame-outline', val: session.caloriesBurned.replace(' kcal', ''), label: 'Calories' },
            { icon: 'barbell-outline', val: `${Math.round(totalVolume).toLocaleString()}kg`, label: 'Volume' },
            { icon: 'checkmark-done-outline', val: `${totalSets}`, label: 'Sets' },
          ].map((s) => (
            <View key={s.label} style={styles.statBlock}>
              <Ionicons name={s.icon as any} size={16} color={DS.textSecond} />
              <MonoText bold style={styles.statVal}>{s.val}</MonoText>
              <ThemedText style={styles.statLabel}>{s.label}</ThemedText>
            </View>
          ))}
        </View>

        {(session.exercises ?? []).map((ex) => (
          <View key={ex.id} style={styles.exCard}>
            <ThemedText style={styles.exName}>{ex.name}</ThemedText>
            <View style={styles.tableHeader}>
              <ThemedText style={[styles.colHeader, { width: 32 }]}>SET</ThemedText>
              <ThemedText style={[styles.colHeader, { flex: 1 }]}>WEIGHT × REPS</ThemedText>
            </View>
            {ex.sets.map((set, si) => {
              const typeLabel = SET_TYPE_LABEL[set.setType];
              return (
                <View key={set.id} style={styles.setRow}>
                  <View style={styles.setBadge}>
                    <ThemedText style={[styles.setIndexText, !!typeLabel && { color: DS.statusBad }]}>
                      {typeLabel || si + 1}
                    </ThemedText>
                  </View>
                  <MonoText style={styles.setValue}>{set.weightKg}kg × {set.reps}</MonoText>
                  {!set.completed && <ThemedText style={styles.skippedTag}>skipped</ThemedText>}
                </View>
              );
            })}
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    scroll: { paddingHorizontal: 20 },
    deleteBtn: {
      position: 'absolute', right: 16, zIndex: 100,
      width: 44, height: 44, borderRadius: 22, backgroundColor: DS.surface,
      alignItems: 'center', justifyContent: 'center',
    },
    routineName: { fontSize: 26, fontWeight: '700', color: DS.textPrimary, letterSpacing: -0.5 },
    timestamp: { fontSize: 13, color: DS.textSecond, marginTop: 4, marginBottom: Spacing.lg },
    statsRow: {
      flexDirection: 'row', backgroundColor: DS.surface, borderRadius: Radius.lg,
      paddingVertical: Spacing.md, marginBottom: Spacing.lg,
    },
    statBlock: { flex: 1, alignItems: 'center', gap: 4 },
    statVal: { fontSize: 16, marginTop: 4 },
    statLabel: { fontSize: 10, color: DS.textMuted },
    exCard: { backgroundColor: DS.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm },
    exName: { fontSize: 15, fontWeight: '700', color: DS.textPrimary, marginBottom: Spacing.sm },
    tableHeader: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: DS.border, marginBottom: 6 },
    colHeader: { fontSize: 10, fontWeight: '600', color: DS.textMuted, letterSpacing: 0.3 },
    setRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
    setBadge: { width: 32, alignItems: 'center' },
    setIndexText: { fontSize: 13, fontWeight: '700', color: DS.textPrimary },
    setValue: { fontSize: 13, color: DS.textPrimary },
    skippedTag: { fontSize: 10, color: DS.textMuted, marginLeft: 6, fontStyle: 'italic' },
  });
}
