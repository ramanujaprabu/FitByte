import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { workoutService, type LogSessionExerciseInput } from '@/services/api/workout';
import { setExercisePickerCallback } from '@/utils/pickerBridge';
import { triggerHaptic } from '@/utils/haptics';
import type { Exercise, ExerciseRecord, SetType } from '@/types';

interface LiveSet {
  key: string;
  weight: string;
  reps: string;
  setType: SetType;
  completed: boolean;
}

interface LiveExercise {
  key: string;
  exerciseId: string | null;
  name: string;
  restSeconds: number;
  sets: LiveSet[];
  previous: { weightKg: number; reps: number }[];
}

const SET_TYPE_ORDER: SetType[] = ['normal', 'warmup', 'dropset', 'failure'];
const SET_TYPE_LABEL: Record<SetType, string> = { normal: '', warmup: 'W', dropset: 'D', failure: 'F' };

function newSetKey() {
  return `set-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function LogWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { id: routineId } = useLocalSearchParams<{ id?: string }>();

  const startedAtRef = useRef(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<LiveExercise[]>([]);
  const [loadingRoutine, setLoadingRoutine] = useState(!!routineId);
  const [finishing, setFinishing] = useState(false);
  const [recordsByExercise, setRecordsByExercise] = useState<Record<string, ExerciseRecord | null>>({});

  const [restEndAt, setRestEndAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  // Elapsed time — recomputed from wall-clock each tick, so backgrounding the app doesn't stall it.
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current.getTime()) / 1000));
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Block the swipe-back gesture is handled via screens/_layout.tsx (gestureEnabled: false);
  // this covers the Android hardware back button with the same confirm-before-discard.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmDiscard();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises]);

  const fetchPreviousAndRecords = useCallback(async (exerciseId: string) => {
    const [previous, record] = await Promise.all([
      workoutService.getPreviousSets(exerciseId).catch(() => []),
      workoutService.getExerciseRecords(exerciseId).catch(() => null),
    ]);
    setRecordsByExercise((prev) => ({ ...prev, [exerciseId]: record }));
    return previous;
  }, []);

  // Prefill from a routine, if one was passed in.
  useEffect(() => {
    if (!routineId) return;
    workoutService.getRoutine(routineId).then(async (routine) => {
      if (!routine) return;
      setWorkoutName(routine.name);
      const built: LiveExercise[] = [];
      for (const re of routine.exercises) {
        const previous = re.exerciseId ? await fetchPreviousAndRecords(re.exerciseId) : [];
        built.push({
          key: `${re.id}-${Date.now()}`,
          exerciseId: re.exerciseId,
          name: re.name,
          restSeconds: re.restSeconds,
          previous,
          sets: Array.from({ length: Math.max(1, re.targetSets) }, () => ({
            key: newSetKey(), weight: '', reps: '', setType: 'normal' as SetType, completed: false,
          })),
        });
      }
      setExercises(built);
    }).finally(() => setLoadingRoutine(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineId]);

  const addExercises = () => {
    setExercisePickerCallback(async (picked: Exercise[]) => {
      for (const ex of picked) {
        const previous = await fetchPreviousAndRecords(ex.id);
        setExercises((prev) => [
          ...prev,
          {
            key: `${ex.id}-${Date.now()}`,
            exerciseId: ex.id,
            name: ex.name,
            restSeconds: 90,
            previous,
            sets: [{ key: newSetKey(), weight: '', reps: '', setType: 'normal', completed: false }],
          },
        ]);
      }
    });
    router.push({ pathname: '/screens/exercise-picker' as any, params: { multi: '1' } });
  };

  const addSet = (exKey: string) => {
    triggerHaptic('light');
    setExercises((prev) => prev.map((e) => {
      if (e.key !== exKey) return e;
      const last = e.sets[e.sets.length - 1];
      return {
        ...e,
        sets: [...e.sets, { key: newSetKey(), weight: last?.weight ?? '', reps: last?.reps ?? '', setType: 'normal', completed: false }],
      };
    }));
  };

  const removeSet = (exKey: string, setKey: string) => {
    triggerHaptic('light');
    setExercises((prev) => prev.map((e) => (e.key === exKey ? { ...e, sets: e.sets.filter((s) => s.key !== setKey) } : e)));
  };

  const updateSet = (exKey: string, setKey: string, patch: Partial<LiveSet>) => {
    setExercises((prev) => prev.map((e) => (
      e.key !== exKey ? e : { ...e, sets: e.sets.map((s) => (s.key === setKey ? { ...s, ...patch } : s)) }
    )));
  };

  const cycleSetType = (exKey: string, setKey: string) => {
    triggerHaptic('selection');
    setExercises((prev) => prev.map((e) => (
      e.key !== exKey ? e : {
        ...e,
        sets: e.sets.map((s) => {
          if (s.key !== setKey) return s;
          const idx = SET_TYPE_ORDER.indexOf(s.setType);
          return { ...s, setType: SET_TYPE_ORDER[(idx + 1) % SET_TYPE_ORDER.length] };
        }),
      }
    )));
  };

  const toggleSetComplete = (exKey: string, setKey: string) => {
    const exercise = exercises.find((e) => e.key === exKey);
    const set = exercise?.sets.find((s) => s.key === setKey);
    if (!set) return;
    const willComplete = !set.completed;
    triggerHaptic(willComplete ? 'success' : 'light');
    updateSet(exKey, setKey, { completed: willComplete });
    if (willComplete && exercise) {
      setRestEndAt(Date.now() + exercise.restSeconds * 1000);
    }
  };

  const removeExercise = (exKey: string) => {
    triggerHaptic('light');
    setExercises((prev) => prev.filter((e) => e.key !== exKey));
  };

  const restRemaining = restEndAt ? Math.max(0, Math.ceil((restEndAt - now) / 1000)) : 0;
  useEffect(() => {
    if (restEndAt && restRemaining === 0) setRestEndAt(null);
  }, [restRemaining, restEndAt]);

  const completedSetsCount = exercises.reduce((s, e) => s + e.sets.filter((set) => set.completed).length, 0);
  const totalVolume = exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).reduce((s2, set) => s2 + (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0), 0),
    0
  );

  const confirmDiscard = () => {
    if (completedSetsCount === 0) {
      router.back();
      return;
    }
    Alert.alert('Discard workout?', 'You have logged sets that will be lost.', [
      { text: 'Keep Going', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const handleFinish = async () => {
    if (completedSetsCount === 0 || finishing) return;
    triggerHaptic('success');
    setFinishing(true);
    try {
      const input: LogSessionExerciseInput[] = exercises
        .filter((e) => e.sets.some((s) => s.completed))
        .map((e) => ({
          exerciseId: e.exerciseId,
          name: e.name,
          sets: e.sets
            .filter((s) => s.completed)
            .map((s) => ({
              weightKg: parseFloat(s.weight) || 0,
              reps: parseInt(s.reps, 10) || 0,
              setType: s.setType,
              completed: true,
            })),
        }));

      // Detect PRs by comparing this session's best set against the record
      // fetched when each exercise was added (i.e. before this workout).
      const prNames: string[] = [];
      for (const e of exercises) {
        if (!e.exerciseId) continue;
        const prior = recordsByExercise[e.exerciseId];
        const completed = e.sets.filter((s) => s.completed);
        if (completed.length === 0) continue;
        const bestWeight = Math.max(...completed.map((s) => parseFloat(s.weight) || 0));
        const bestVolume = Math.max(...completed.map((s) => (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0)));
        if (!prior || bestWeight > prior.heaviestWeightKg || bestVolume > prior.bestSetVolumeKg) {
          prNames.push(e.name);
        }
      }

      await workoutService.logSession({
        routineId: routineId ?? null,
        routineName: workoutName.trim() || 'Quick Workout',
        durationMins: Math.max(1, Math.round(elapsedSeconds / 60)),
        exercises: input,
      });

      if (prNames.length > 0) {
        Alert.alert('🏆 New Personal Records!', prNames.join('\n'), [{ text: 'Nice!', onPress: () => router.back() }]);
      } else {
        router.back();
      }
    } catch (e: any) {
      // logSession itself is resilient (it caches offline before ever
      // touching the network), so this only fires for something upstream
      // like an expired session — keep the user on screen with their sets
      // intact instead of failing silently.
      Alert.alert('Could not finish workout', e?.message ?? 'Please try again.');
    } finally {
      setFinishing(false);
    }
  };

  if (loadingRoutine) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={DS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable style={styles.iconBtn} onPress={confirmDiscard}>
          <ThemedText style={styles.cancelLink}>Cancel</ThemedText>
        </Pressable>
        <View style={styles.timerPill}>
          <ThemedText style={styles.timerPillText}>{formatTimer(elapsedSeconds)}</ThemedText>
        </View>
        <Pressable onPress={handleFinish} disabled={completedSetsCount === 0 || finishing}>
          {finishing ? <ActivityIndicator color={DS.textPrimary} /> : (
            <ThemedText style={[styles.finishLink, completedSetsCount === 0 && { opacity: 0.4 }]}>Finish</ThemedText>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>

        <TextInput
          style={styles.workoutNameInput}
          placeholder="Workout Name (e.g. Push Day)"
          placeholderTextColor={DS.textMuted}
          value={workoutName}
          onChangeText={setWorkoutName}
        />
        <ThemedText style={styles.statsLine}>
          {completedSetsCount} sets · {Math.round(totalVolume).toLocaleString()} kg volume
        </ThemedText>

        {exercises.map((ex) => (
          <View key={ex.key} style={styles.exCard}>
            <View style={styles.exHeaderRow}>
              <ThemedText style={styles.exName}>{ex.name}</ThemedText>
              <Pressable onPress={() => removeExercise(ex.key)} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={DS.textMuted} />
              </Pressable>
            </View>

            <View style={styles.tableHeader}>
              <ThemedText style={[styles.colHeader, { width: 32 }]}>SET</ThemedText>
              <ThemedText style={[styles.colHeader, { flex: 1 }]}>PREVIOUS</ThemedText>
              <ThemedText style={[styles.colHeader, { width: 60 }]}>KG</ThemedText>
              <ThemedText style={[styles.colHeader, { width: 60 }]}>REPS</ThemedText>
              <ThemedText style={[styles.colHeader, { width: 40, textAlign: 'center' }]}>✓</ThemedText>
            </View>

            {ex.sets.map((set, si) => {
              const prev = ex.previous[si];
              const typeLabel = SET_TYPE_LABEL[set.setType];
              return (
                <View key={set.key} style={styles.tableRow}>
                  <Pressable style={[styles.setBadge, { width: 32 }]} onPress={() => cycleSetType(ex.key, set.key)}>
                    <ThemedText style={[styles.setIndexText, !!typeLabel && { color: DS.statusBad }]}>
                      {typeLabel || si + 1}
                    </ThemedText>
                  </Pressable>

                  <ThemedText style={[styles.prevText, { flex: 1 }]}>
                    {prev ? `${prev.weightKg}kg × ${prev.reps}` : '—'}
                  </ThemedText>

                  <TextInput
                    style={[styles.inputBox, { width: 60 }]}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={DS.textMuted}
                    value={set.weight}
                    onChangeText={(val) => updateSet(ex.key, set.key, { weight: val })}
                  />

                  <TextInput
                    style={[styles.inputBox, { width: 60 }]}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={DS.textMuted}
                    value={set.reps}
                    onChangeText={(val) => updateSet(ex.key, set.key, { reps: val })}
                  />

                  <Pressable
                    style={[styles.checkBtn, set.completed && styles.checkBtnCompleted]}
                    onPress={() => toggleSetComplete(ex.key, set.key)}>
                    <Ionicons name="checkmark" size={16} color={set.completed ? DS.accentText : DS.textPrimary} />
                  </Pressable>

                  <Pressable onPress={() => removeSet(ex.key, set.key)} hitSlop={6} style={{ marginLeft: 6 }}>
                    <Ionicons name="trash-outline" size={14} color={DS.textMuted} />
                  </Pressable>
                </View>
              );
            })}

            <Pressable style={styles.addSetRow} onPress={() => addSet(ex.key)}>
              <Ionicons name="add" size={16} color={DS.textPrimary} />
              <ThemedText style={styles.addSetText}>Add Set</ThemedText>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.addExerciseBtn} onPress={addExercises}>
          <Ionicons name="add-circle-outline" size={18} color={DS.textPrimary} />
          <ThemedText style={styles.addExerciseText}>Add Exercise</ThemedText>
        </Pressable>

      </ScrollView>

      {/* Rest Timer Banner */}
      {restEndAt && (
        <View style={[styles.restBanner, { bottom: insets.bottom + 84 }]}>
          <ThemedText style={styles.restLabel}>Rest</ThemedText>
          <Pressable onPress={() => { setRestEndAt((t) => (t ? t - 15000 : t)); }} hitSlop={8}>
            <ThemedText style={styles.restAdjust}>−15</ThemedText>
          </Pressable>
          <ThemedText style={styles.restTimer}>{formatTimer(restRemaining)}</ThemedText>
          <Pressable onPress={() => setRestEndAt((t) => (t ? t + 15000 : t))} hitSlop={8}>
            <ThemedText style={styles.restAdjust}>+15</ThemedText>
          </Pressable>
          <Pressable onPress={() => setRestEndAt(null)} hitSlop={8}>
            <ThemedText style={styles.restSkip}>Skip</ThemedText>
          </Pressable>
        </View>
      )}

      {/* Sticky Bottom Action */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom || Spacing.md }]}>
        <Pressable
          style={[styles.finishWorkoutBtn, completedSetsCount === 0 && { opacity: 0.4 }]}
          disabled={completedSetsCount === 0 || finishing}
          onPress={handleFinish}>
          {finishing ? <ActivityIndicator color={DS.accentText} /> : (
            <ThemedText style={styles.finishWorkoutBtnText}>FINISH WORKOUT</ThemedText>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    topHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.md, height: 54,
    },
    iconBtn: { padding: 6 },
    cancelLink: { fontSize: 15, fontWeight: '600', color: DS.textSecond },
    finishLink: { fontSize: 15, fontWeight: '700', color: DS.textPrimary },
    timerPill: { backgroundColor: DS.raised, paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full },
    timerPillText: { fontFamily: Fonts.mono, fontSize: 15, fontWeight: '700', color: DS.textPrimary },
    scroll: { paddingHorizontal: Spacing.md },
    workoutNameInput: {
      fontSize: 20, fontWeight: '700', color: DS.textPrimary,
      paddingVertical: 8, marginBottom: 2,
    },
    statsLine: { fontFamily: Fonts.mono, fontSize: 12, color: DS.textSecond, marginBottom: Spacing.lg },
    exCard: { backgroundColor: DS.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
    exHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
    exName: { fontSize: 16, fontWeight: '700', color: DS.textPrimary, flex: 1 },
    tableHeader: {
      flexDirection: 'row', alignItems: 'center', paddingBottom: 8,
      borderBottomWidth: 1, borderBottomColor: DS.border, marginBottom: 8,
    },
    colHeader: { fontSize: 10, fontWeight: '600', color: DS.textMuted, letterSpacing: 0.3 },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
    setBadge: { height: 32, alignItems: 'center', justifyContent: 'center' },
    setIndexText: { fontFamily: Fonts.mono, fontSize: 13, fontWeight: '700', color: DS.textPrimary },
    prevText: { fontSize: 12, color: DS.textMuted },
    inputBox: {
      backgroundColor: DS.raised, borderRadius: Radius.sm, height: 32,
      textAlign: 'center', fontFamily: Fonts.mono, fontSize: 13, fontWeight: '600',
      color: DS.textPrimary, marginRight: 6,
    },
    checkBtn: {
      width: 32, height: 32, borderRadius: Radius.sm,
      backgroundColor: DS.raised, alignItems: 'center', justifyContent: 'center',
    },
    checkBtnCompleted: { backgroundColor: DS.accent },
    addSetRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      paddingTop: Spacing.sm + 4, marginTop: 4, borderTopWidth: 1, borderTopColor: DS.border,
    },
    addSetText: { fontSize: 13, fontWeight: '600', color: DS.textPrimary },
    addExerciseBtn: {
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
      backgroundColor: DS.raised, height: 50, borderRadius: Radius.full, marginBottom: Spacing.md,
    },
    addExerciseText: { fontSize: 14, fontWeight: '600', color: DS.textPrimary },
    restBanner: {
      position: 'absolute', left: Spacing.md, right: Spacing.md,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: DS.accent, borderRadius: Radius.full,
      paddingHorizontal: Spacing.md, height: 44,
    },
    restLabel: { fontSize: 12, fontWeight: '700', color: DS.accentText, letterSpacing: 0.5 },
    restAdjust: { fontSize: 12, fontWeight: '600', color: DS.accentText, opacity: 0.8 },
    restTimer: { fontFamily: Fonts.mono, fontSize: 16, fontWeight: '700', color: DS.accentText },
    restSkip: { fontSize: 12, fontWeight: '700', color: DS.accentText },
    stickyFooter: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: DS.bg, paddingHorizontal: Spacing.md, paddingTop: Spacing.md,
    },
    finishWorkoutBtn: {
      backgroundColor: DS.accent, height: 52, borderRadius: Radius.full,
      alignItems: 'center', justifyContent: 'center',
    },
    finishWorkoutBtnText: { fontSize: 15, fontWeight: '700', color: DS.accentText, letterSpacing: 0.5 },
  });
}
