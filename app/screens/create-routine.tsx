import { BackButton } from '@/components/shared/BackButton';
<<<<<<< HEAD
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing } from '@/constants/theme';
import { workoutService, type RoutineExerciseInput } from '@/services/api/workout';
import { setExercisePickerCallback } from '@/utils/pickerBridge';
import { triggerHaptic } from '@/utils/haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DraftExercise extends RoutineExerciseInput {
  key: string;
}

export default function CreateRoutineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    workoutService.getRoutine(id).then((routine) => {
      if (!routine) return;
      setName(routine.name);
      setExercises(
        routine.exercises.map((e, i) => ({
          key: `${e.id}-${i}`,
          exerciseId: e.exerciseId ?? '',
          name: e.name,
          muscleGroup: e.muscleGroup,
          targetSets: e.targetSets,
          targetReps: e.targetReps,
          restSeconds: e.restSeconds,
        }))
      );
    }).finally(() => setLoading(false));
  }, [id]);

  const openPicker = () => {
    setExercisePickerCallback((picked) => {
      setExercises((prev) => [
        ...prev,
        ...picked.map((ex, i) => ({
          key: `${ex.id}-${Date.now()}-${i}`,
          exerciseId: ex.id,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          targetSets: 3,
          targetReps: 10,
          restSeconds: 90,
        })),
      ]);
    });
    router.push({ pathname: '/screens/exercise-picker' as any, params: { multi: '1' } });
  };

  const updateExercise = (key: string, patch: Partial<DraftExercise>) => {
    setExercises((prev) => prev.map((e) => (e.key === key ? { ...e, ...patch } : e)));
  };

  const removeExercise = (key: string) => {
    triggerHaptic('light');
    setExercises((prev) => prev.filter((e) => e.key !== key));
  };

  const moveExercise = (index: number, direction: -1 | 1) => {
    setExercises((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const canSave = name.trim().length > 0 && exercises.length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    triggerHaptic('success');
    setSaving(true);
    try {
      const input: RoutineExerciseInput[] = exercises.map((e) => ({
        exerciseId: e.exerciseId,
        name: e.name,
        muscleGroup: e.muscleGroup,
        targetSets: e.targetSets,
        targetReps: e.targetReps,
        restSeconds: e.restSeconds,
      }));
      if (isEditing && id) {
        await workoutService.updateRoutine(id, name.trim(), input);
      } else {
        await workoutService.createRoutine(name.trim(), input);
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Delete routine?', `Remove "${name}". This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await workoutService.deleteRoutine(id);
          router.back();
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
=======
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps', 'Legs', 'Core', 'Full Body'];
const EXERCISE_POOL = ['Bench Press', 'Squat', 'Deadlift', 'Pull-ups', 'OHP', 'Dips', 'Rows', 'Lunges', 'Planks', 'RDL', 'Curls', 'Pushdowns'];

export default function CreateRoutineScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const toggleMuscle = (m: string) =>
    setSelectedMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const toggleExercise = (e: string) =>
    setSelectedExercises(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
<<<<<<< HEAD
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 120 }]}>

        <ThemedText style={styles.pageTitle}>{isEditing ? 'Edit Routine' : 'Create Routine'}</ThemedText>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Routine name (e.g. Push Day)"
          placeholderTextColor={DS.textMuted}
          style={styles.nameInput}
        />

        {exercises.map((ex, i) => (
          <View key={ex.key} style={styles.exCard}>
            <View style={styles.exCardTop}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.exName}>{ex.name}</ThemedText>
                {!!ex.muscleGroup && <ThemedText style={styles.exMuscle}>{ex.muscleGroup}</ThemedText>}
              </View>
              <View style={styles.exCardActions}>
                <Pressable onPress={() => moveExercise(i, -1)} disabled={i === 0} hitSlop={6}>
                  <Ionicons name="chevron-up" size={18} color={i === 0 ? DS.textMuted : DS.textSecond} />
                </Pressable>
                <Pressable onPress={() => moveExercise(i, 1)} disabled={i === exercises.length - 1} hitSlop={6}>
                  <Ionicons name="chevron-down" size={18} color={i === exercises.length - 1 ? DS.textMuted : DS.textSecond} />
                </Pressable>
                <Pressable onPress={() => removeExercise(ex.key)} hitSlop={6}>
                  <Ionicons name="close-circle" size={20} color={DS.textMuted} />
                </Pressable>
              </View>
            </View>

            <View style={styles.targetsRow}>
              <Stepper DS={DS} styles={styles} label="Sets" value={ex.targetSets}
                onChange={(v) => updateExercise(ex.key, { targetSets: v })} min={1} max={10} />
              <Stepper DS={DS} styles={styles} label="Reps" value={ex.targetReps}
                onChange={(v) => updateExercise(ex.key, { targetReps: v })} min={1} max={50} />
              <Stepper DS={DS} styles={styles} label="Rest" value={ex.restSeconds}
                onChange={(v) => updateExercise(ex.key, { restSeconds: v })} min={0} max={300} step={15} suffix="s" />
            </View>
          </View>
        ))}

        <Pressable style={styles.addExercisesBtn} onPress={openPicker}>
          <Ionicons name="add" size={18} color={DS.textPrimary} />
          <ThemedText style={styles.addExercisesText}>Add Exercises</ThemedText>
        </Pressable>

        {isEditing && (
          <Pressable style={styles.deleteLink} onPress={handleDelete}>
            <ThemedText style={styles.deleteLinkText}>Delete Routine</ThemedText>
          </Pressable>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Pressable onPress={handleSave} disabled={!canSave} style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}>
          {saving ? <ActivityIndicator color={DS.accentText} /> : (
            <ThemedText style={styles.saveBtnText}>{isEditing ? 'Save Changes' : 'Save Routine'}</ThemedText>
          )}
        </Pressable>
      </View>
=======
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Create Routine" subtitle="Build your custom workout" />

        <Card>
          <ThemedText style={styles.fieldLabel}>Routine Name</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Upper Body Power"
            placeholderTextColor={DS.textMuted}
            style={styles.input}
          />
        </Card>

        <Card>
          <ThemedText style={styles.fieldLabel}>Target Muscle Groups</ThemedText>
          <View style={styles.chipGrid}>
            {MUSCLE_GROUPS.map(m => {
              const active = selectedMuscles.includes(m);
              return (
                <Pressable key={m} onPress={() => toggleMuscle(m)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{m}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <ThemedText style={styles.fieldLabel}>Add Exercises</ThemedText>
          <View style={styles.chipGrid}>
            {EXERCISE_POOL.map(e => {
              const active = selectedExercises.includes(e);
              return (
                <Pressable key={e} onPress={() => toggleExercise(e)}
                  style={[styles.chip, active && styles.chipActive]}>
                  {active && <Ionicons name="checkmark" size={12} color="#fff" />}
                  <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{e}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {selectedExercises.length > 0 && (
          <Card>
            <ThemedText style={styles.fieldLabel}>Selected ({selectedExercises.length} exercises)</ThemedText>
            {selectedExercises.map((ex, i) => (
              <View key={ex} style={[styles.exRow, i < selectedExercises.length - 1 && styles.exBorder]}>
                <View style={styles.exNum}><ThemedText style={styles.exNumText}>{i + 1}</ThemedText></View>
                <ThemedText style={styles.exName}>{ex}</ThemedText>
                <Pressable onPress={() => toggleExercise(ex)}>
                  <Ionicons name="close-circle-outline" size={18} color={DS.textMuted} />
                </Pressable>
              </View>
            ))}
          </Card>
        )}

        <Pressable onPress={handleSave}
          style={({ pressed }) => [styles.saveBtn, (!name || selectedExercises.length === 0) && styles.saveBtnDisabled, pressed && { opacity: 0.8 }]}
          disabled={!name || selectedExercises.length === 0}>
          <Ionicons name={saved ? 'checkmark-circle-outline' : 'save-outline'} size={18} color="#fff" />
          <ThemedText style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Routine'}</ThemedText>
        </Pressable>

      </ScrollView>
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
    </View>
  );
}

<<<<<<< HEAD
function Stepper({
  DS, styles, label, value, onChange, min, max, step = 1, suffix = '',
}: {
  DS: ReturnType<typeof useDS>;
  styles: ReturnType<typeof makeStyles>;
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; suffix?: string;
}) {
  return (
    <View style={styles.stepperCol}>
      <ThemedText style={styles.stepperLabel}>{label}</ThemedText>
      <View style={styles.stepperRow}>
        <Pressable style={styles.stepperBtn} onPress={() => onChange(Math.max(min, value - step))} hitSlop={6}>
          <Ionicons name="remove" size={14} color={DS.textPrimary} />
        </Pressable>
        <ThemedText style={styles.stepperValue}>{value}{suffix}</ThemedText>
        <Pressable style={styles.stepperBtn} onPress={() => onChange(Math.min(max, value + step))} hitSlop={6}>
          <Ionicons name="add" size={14} color={DS.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    scroll: { paddingHorizontal: 20 },
    pageTitle: { fontSize: 26, fontWeight: '700', color: DS.textPrimary, letterSpacing: -0.5, marginBottom: Spacing.lg },
    nameInput: {
      backgroundColor: DS.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 14,
      fontSize: 17, fontWeight: '600', color: DS.textPrimary, marginBottom: Spacing.lg,
    },
    exCard: { backgroundColor: DS.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm },
    exCardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
    exCardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    exName: { fontSize: 15, fontWeight: '600', color: DS.textPrimary },
    exMuscle: { fontSize: 12, color: DS.textMuted, marginTop: 2 },
    targetsRow: { flexDirection: 'row', gap: Spacing.sm },
    stepperCol: { flex: 1, alignItems: 'center', gap: 6 },
    stepperLabel: { fontSize: 10, fontWeight: '600', color: DS.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
    stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: DS.raised, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 6 },
    stepperBtn: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    stepperValue: { fontSize: 13, fontWeight: '700', color: DS.textPrimary, minWidth: 28, textAlign: 'center' },
    addExercisesBtn: {
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
      backgroundColor: DS.raised, paddingVertical: 14, borderRadius: Radius.md, marginTop: Spacing.sm,
    },
    addExercisesText: { fontSize: 14, fontWeight: '600', color: DS.textPrimary },
    deleteLink: { alignItems: 'center', paddingVertical: Spacing.lg },
    deleteLinkText: { fontSize: 13, fontWeight: '600', color: DS.statusBad },
    footer: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: DS.bg, paddingHorizontal: 20, paddingTop: Spacing.md,
    },
    saveBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: DS.accent, paddingVertical: 15, borderRadius: Radius.full },
    saveBtnDisabled: { opacity: 0.4 },
    saveBtnText: { color: DS.accentText, fontWeight: '600', fontSize: 15 },
  });
}
=======
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },
  fieldLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: DS.card, borderRadius: 10, borderWidth: 1, borderColor: DS.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: DS.textPrimary },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border },
  chipActive: { backgroundColor: DS.accent, borderColor: DS.accent },
  chipText: { fontSize: 13, fontWeight: '500', color: DS.textSecond },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  exBorder: { borderBottomWidth: 1, borderBottomColor: DS.border },
  exNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: DS.raised, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  exNumText: { fontSize: 11, color: DS.textSecond },
  exName: { flex: 1, fontSize: 14, color: DS.textPrimary, fontWeight: '500' },
  saveBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: DS.accent, paddingVertical: 15, borderRadius: 14 },
  saveBtnDisabled: { backgroundColor: DS.raised },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
