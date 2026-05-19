import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { BackButton } from '@/components/shared/BackButton';
import { MonoText } from '@/components/shared/MonoText';
import { DS } from '@/constants/theme';
import { MOCK_ROUTINES } from '@/data/workout';

function useTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LogWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const routine = MOCK_ROUTINES.find(r => r.id === id) ?? MOCK_ROUTINES[0];

  const [running, setRunning] = useState(true);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>(() => {
    const init: Record<string, boolean[]> = {};
    routine.exerciseList.forEach(ex => { init[ex] = [false, false, false]; });
    return init;
  });

  const timer = useTimer(running);

  const toggleSet = (ex: string, idx: number) => {
    setCompletedSets(prev => {
      const next = { ...prev };
      next[ex] = [...prev[ex]];
      next[ex][idx] = !next[ex][idx];
      return next;
    });
  };

  const totalSets = Object.values(completedSets).reduce((s, arr) => s + arr.length, 0);
  const doneSets  = Object.values(completedSets).reduce((s, arr) => s + arr.filter(Boolean).length, 0);

  return (
    <View style={styles.container}>
      <BackButton onPress={() => { setRunning(false); router.back(); }} />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        {/* Timer Card */}
        <View style={styles.timerCard}>
          <MonoText bold style={styles.timerVal}>{timer}</MonoText>
          <ThemedText style={styles.timerLabel}>{routine.name}</ThemedText>
          <View style={styles.timerControls}>
            <Pressable onPress={() => setRunning(r => !r)} style={styles.timerBtn}>
              <Ionicons name={running ? 'pause' : 'play'} size={20} color={DS.textPrimary} />
            </Pressable>
          </View>
          <View style={styles.progressRow}>
            <ThemedText style={styles.progressText}>{doneSets} / {totalSets} sets</ThemedText>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(doneSets / totalSets) * 100}%` as any }]} />
            </View>
          </View>
        </View>

        {/* Exercise Sets */}
        {routine.exerciseList.map(ex => (
          <View key={ex} style={styles.exCard}>
            <ThemedText style={styles.exName}>{ex}</ThemedText>
            <View style={styles.setsRow}>
              {completedSets[ex]?.map((done, i) => (
                <Pressable key={i} onPress={() => toggleSet(ex, i)}
                  style={[styles.setCircle, done && styles.setCircleDone]}>
                  {done
                    ? <Ionicons name="checkmark" size={14} color={DS.bg} />
                    : <MonoText style={styles.setNum}>{i + 1}</MonoText>
                  }
                </Pressable>
              ))}
              <Pressable
                onPress={() => setCompletedSets(prev => ({ ...prev, [ex]: [...prev[ex], false] }))}
                style={styles.addSetBtn}>
                <Ionicons name="add" size={14} color={DS.textMuted} />
              </Pressable>
            </View>
          </View>
        ))}

        {/* Finish Button */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.finishBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <ThemedText style={styles.finishBtnText}>Finish Workout</ThemedText>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },
  timerCard: { backgroundColor: DS.surface, borderRadius: 20, borderWidth: 1, borderColor: DS.border, padding: 24, alignItems: 'center', marginBottom: 20 },
  timerVal: { fontSize: 54, letterSpacing: 2, color: DS.textPrimary },
  timerLabel: { fontSize: 14, color: DS.textSecond, marginTop: 4 },
  timerControls: { flexDirection: 'row', marginTop: 16, gap: 12 },
  timerBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: DS.raised, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  progressRow: { width: '100%', marginTop: 16, gap: 6 },
  progressText: { fontSize: 12, color: DS.textMuted, textAlign: 'center' },
  progressBar: { height: 4, borderRadius: 2, backgroundColor: DS.raised, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: DS.accent, borderRadius: 2 },
  exCard: { backgroundColor: DS.surface, borderRadius: 14, borderWidth: 1, borderColor: DS.border, padding: 16, marginBottom: 10 },
  exName: { fontWeight: '600', fontSize: 15, color: DS.textPrimary, marginBottom: 12 },
  setsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  setCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: DS.card, borderWidth: 2, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  setCircleDone: { backgroundColor: DS.accent, borderColor: DS.accent },
  setNum: { fontSize: 14, color: DS.textSecond },
  addSetBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: DS.card, borderWidth: 2, borderColor: DS.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  finishBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: DS.accent, paddingVertical: 16, borderRadius: 14, marginTop: 8 },
  finishBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
