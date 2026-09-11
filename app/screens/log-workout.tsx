import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { DS, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import { workoutService } from '@/services/api/workout';
import { triggerHaptic } from '@/utils/haptics';

interface SetData {
  id: number;
  prev: string;
  weight: string;
  reps: string;
  completed: boolean;
}

export default function LogWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [workoutName, setWorkoutName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timerStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const [sets, setSets] = useState<SetData[]>([
    { id: 1, prev: '—', weight: '', reps: '', completed: false },
  ]);

  const toggleSetCompleted = (setId: number) => {
    triggerHaptic('success');
    setSets(prev => prev.map(s => s.id === setId ? { ...s, completed: !s.completed } : s));
  };

  const addSet = () => {
    triggerHaptic('light');
    setSets(prev => [
      ...prev,
      { id: prev.length + 1, prev: '—', weight: '', reps: '', completed: false },
    ]);
  };

  const completedSets = sets.filter(s => s.completed);
  const totalVol = completedSets.reduce((sum, s) => {
    const w = parseFloat(s.weight) || 0;
    const r = parseFloat(s.reps) || 0;
    return sum + (w * r);
  }, 0);
  const estCalories = Math.round(mins * 6.5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000000" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Live Workout</ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={styles.finishLink}>Cancel</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}>

        {/* Hero Timer Banner */}
        <View style={styles.timerBanner}>
          <TextInput
            style={styles.workoutNameInput}
            placeholder="Workout Name (e.g. Push Day)"
            placeholderTextColor={DS.textMuted}
            value={workoutName}
            onChangeText={setWorkoutName}
          />
          <ThemedText style={styles.timerMonoVal}>{timerStr}</ThemedText>
          <ThemedText style={styles.timerSubStats}>
            VOL: {totalVol.toLocaleString()} kg • SETS: {completedSets.length}/{sets.length}
          </ThemedText>
        </View>

        {/* Muscle group input */}
        <View style={styles.muscleInputRow}>
          <Ionicons name="body-outline" size={18} color={DS.textSecond} />
          <TextInput
            style={styles.muscleInput}
            placeholder="Muscle Groups (e.g. Chest, Triceps)"
            placeholderTextColor={DS.textMuted}
            value={muscleGroup}
            onChangeText={setMuscleGroup}
          />
        </View>

        {/* Exercise Card */}
        <View style={styles.card}>
          <View style={styles.exHeaderRow}>
            <View>
              <ThemedText style={styles.exName}>Exercise Sets</ThemedText>
              <ThemedText style={styles.exMuscle}>Log your sets below</ThemedText>
            </View>
          </View>

          {/* Sets Table Header */}
          <View style={styles.tableHeader}>
            <ThemedText style={[styles.colHeader, { width: 36 }]}>SET</ThemedText>
            <ThemedText style={[styles.colHeader, { flex: 1 }]}>PREV</ThemedText>
            <ThemedText style={[styles.colHeader, { width: 64 }]}>KG</ThemedText>
            <ThemedText style={[styles.colHeader, { width: 64 }]}>REPS</ThemedText>
            <ThemedText style={[styles.colHeader, { width: 44, textAlign: 'center' }]}>DONE</ThemedText>
          </View>

          {/* Sets Rows */}
          {sets.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <ThemedText style={[styles.setIndexText, { width: 36 }]}>{item.id}</ThemedText>

              <ThemedText style={[styles.prevText, { flex: 1 }]}>{item.prev}</ThemedText>

              <TextInput
                style={[styles.inputBox, { width: 64 }]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={DS.textMuted}
                value={item.weight}
                onChangeText={(val) => setSets(prev => prev.map(s => s.id === item.id ? { ...s, weight: val } : s))}
              />

              <TextInput
                style={[styles.inputBox, { width: 64 }]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={DS.textMuted}
                value={item.reps}
                onChangeText={(val) => setSets(prev => prev.map(s => s.id === item.id ? { ...s, reps: val } : s))}
              />

              <Pressable
                style={[styles.checkBtn, item.completed && styles.checkBtnCompleted]}
                onPress={() => toggleSetCompleted(item.id)}>
                <Ionicons name="checkmark" size={16} color={item.completed ? '#FFFFFF' : '#000000'} />
              </Pressable>
            </View>
          ))}

          {/* Add Set Button */}
          <Pressable style={styles.addSetRow} onPress={addSet}>
            <Ionicons name="add" size={18} color="#000000" />
            <ThemedText style={styles.addSetText}>Add Set</ThemedText>
          </Pressable>
        </View>

      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom || Spacing.md }]}>
        <Pressable
          style={[styles.finishWorkoutBtn, completedSets.length === 0 && { opacity: 0.4 }]}
          disabled={completedSets.length === 0}
          onPress={async () => {
            triggerHaptic('success');
            const sessionName = workoutName.trim() || 'Quick Workout';
            const sessionMuscles = muscleGroup.trim() || 'General';
            // logSession already saves to the per-user offline cache before
            // attempting Supabase, and never throws — no fallback needed here.
            await workoutService.logSession({
              routineName: sessionName,
              durationMins: `${mins}`,
              caloriesBurned: `${estCalories}`,
              muscles: sessionMuscles,
              intensity: 'High',
              timestamp: new Date().toISOString(),
            });
            router.back();
          }}>
          <ThemedText style={styles.finishWorkoutBtnText}>FINISH WORKOUT</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  finishLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  timerBanner: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  workoutNameInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
    width: '100%',
  },
  timerMonoVal: {
    fontFamily: Fonts.mono,
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1,
  },
  timerSubStats: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: DS.textSecond,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  exHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  exName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  exMuscle: {
    fontSize: 12,
    color: DS.textSecond,
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
    marginBottom: 8,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: DS.textSecond,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  setIndexText: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  prevText: {
    fontSize: 13,
    color: DS.textSecond,
  },
  inputBox: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.sm,
    height: 36,
    textAlign: 'center',
    fontFamily: Fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginRight: 6,
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: DS.border,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnCompleted: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  addSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: DS.border,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: DS.border,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  finishWorkoutBtn: {
    backgroundColor: '#000000',
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishWorkoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  muscleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.lg,
    gap: 8,
  },
  muscleInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
});
