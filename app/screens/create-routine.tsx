import { BackButton } from '@/components/shared/BackButton';
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

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
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
    </View>
  );
}

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
