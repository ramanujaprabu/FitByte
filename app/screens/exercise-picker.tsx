import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing } from '@/constants/theme';
import { workoutService } from '@/services/api/workout';
import { resolveExercisePick } from '@/utils/pickerBridge';
import { triggerHaptic } from '@/utils/haptics';
import type { Equipment, Exercise } from '@/types';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Cardio', 'Full Body'];
const EQUIPMENT_OPTIONS: Equipment[] = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Other'];

export default function ExercisePickerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const params = useLocalSearchParams<{ multi?: string }>();
  const multi = params.multi !== '0';

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [selected, setSelected] = useState<Exercise[]>([]);

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState('Chest');
  const [customEquipment, setCustomEquipment] = useState<Equipment>('Barbell');
  const [creatingCustom, setCreatingCustom] = useState(false);

  const load = () => {
    setLoading(true);
    workoutService.getExerciseLibrary(search, muscleFilter)
      .then(setExercises)
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handle = setTimeout(load, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, muscleFilter]);

  const toggle = (ex: Exercise) => {
    triggerHaptic('selection');
    setSelected((prev) => {
      const exists = prev.some((e) => e.id === ex.id);
      if (exists) return prev.filter((e) => e.id !== ex.id);
      if (!multi) return [ex];
      return [...prev, ex];
    });
  };

  const confirm = () => {
    if (selected.length === 0) return;
    triggerHaptic('success');
    resolveExercisePick(selected);
    router.back();
  };

  const createCustom = async () => {
    if (!customName.trim()) return;
    setCreatingCustom(true);
    try {
      const created = await workoutService.createCustomExercise(customName.trim(), customMuscle, customEquipment);
      setExercises((prev) => [created, ...prev]);
      setSelected((prev) => (multi ? [...prev, created] : [created]));
      setCustomModalVisible(false);
      setCustomName('');
    } catch {
      // Keep the modal open so the user can retry.
    } finally {
      setCreatingCustom(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topHeader}>
        <Pressable style={styles.iconBtn} onPress={() => { resolveExercisePick([]); router.back(); }}>
          <Ionicons name="close" size={24} color={DS.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Add Exercises</ThemedText>
        <Pressable style={styles.iconBtn} onPress={() => setCustomModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={24} color={DS.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={DS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises"
          placeholderTextColor={DS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {MUSCLE_GROUPS.map((m) => {
          const active = muscleFilter === m;
          return (
            <Pressable key={m} onPress={() => setMuscleFilter(m)} style={[styles.chip, active && styles.chipActive]}>
              <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{m}</ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: insets.bottom + 100 }}>
        {loading ? (
          <ThemedText style={styles.helperText}>Loading exercises…</ThemedText>
        ) : exercises.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
            <ThemedText style={styles.helperText}>No exercises found.</ThemedText>
            <Pressable style={styles.createCustomBtn} onPress={() => setCustomModalVisible(true)}>
              <ThemedText style={styles.createCustomBtnText}>+ Create &quot;{search}&quot;</ThemedText>
            </Pressable>
          </View>
        ) : (
          exercises.map((ex) => {
            const isSelected = selected.some((e) => e.id === ex.id);
            return (
              <Pressable key={ex.id} style={styles.exRow} onPress={() => toggle(ex)}>
                <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color={DS.accentText} />}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.exName}>{ex.name}</ThemedText>
                  <ThemedText style={styles.exSub}>{ex.muscleGroup} · {ex.equipment}</ThemedText>
                </View>
                {ex.isCustom && (
                  <View style={styles.customBadge}>
                    <ThemedText style={styles.customBadgeText}>CUSTOM</ThemedText>
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {selected.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Pressable style={styles.confirmBtn} onPress={confirm}>
            <ThemedText style={styles.confirmBtnText}>
              Add {selected.length} Exercise{selected.length > 1 ? 's' : ''}
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* Create Custom Exercise Modal */}
      <Modal visible={customModalVisible} animationType="fade" transparent onRequestClose={() => setCustomModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalTopRow}>
              <ThemedText style={styles.modalTitle}>Custom Exercise</ThemedText>
              <Pressable onPress={() => setCustomModalVisible(false)}>
                <Ionicons name="close" size={22} color={DS.textPrimary} />
              </Pressable>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Exercise name"
              placeholderTextColor={DS.textMuted}
              value={customName}
              onChangeText={setCustomName}
            />

            <ThemedText style={styles.modalLabel}>Muscle Group</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {MUSCLE_GROUPS.filter((m) => m !== 'All').map((m) => (
                  <Pressable key={m} onPress={() => setCustomMuscle(m)} style={[styles.chip, customMuscle === m && styles.chipActive]}>
                    <ThemedText style={[styles.chipText, customMuscle === m && styles.chipTextActive]}>{m}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <ThemedText style={styles.modalLabel}>Equipment</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <Pressable key={eq} onPress={() => setCustomEquipment(eq)} style={[styles.chip, customEquipment === eq && styles.chipActive]}>
                    <ThemedText style={[styles.chipText, customEquipment === eq && styles.chipTextActive]}>{eq}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Pressable
              style={[styles.confirmBtn, !customName.trim() && { opacity: 0.5 }]}
              disabled={!customName.trim() || creatingCustom}
              onPress={createCustom}>
              <ThemedText style={styles.confirmBtnText}>{creatingCustom ? 'Creating…' : 'Create Exercise'}</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.surface },
    topHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: Spacing.md, height: 54,
    },
    iconBtn: { padding: 6 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: DS.textPrimary },
    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: DS.raised, borderRadius: Radius.full,
      paddingHorizontal: Spacing.md, height: 44,
      marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    },
    searchInput: { flex: 1, fontSize: 15, color: DS.textPrimary },
    chipsRow: { paddingHorizontal: Spacing.md, gap: 8, paddingBottom: Spacing.sm },
    chip: {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full,
      backgroundColor: DS.raised,
    },
    chipActive: { backgroundColor: DS.accent },
    chipText: { fontSize: 12, fontWeight: '600', color: DS.textSecond },
    chipTextActive: { color: DS.accentText },
    helperText: { fontSize: 13, color: DS.textMuted, textAlign: 'center', paddingVertical: Spacing.md },
    createCustomBtn: { marginTop: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 10, backgroundColor: DS.raised, borderRadius: Radius.full },
    createCustomBtnText: { fontSize: 13, fontWeight: '600', color: DS.textPrimary },
    exRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      paddingVertical: Spacing.sm + 4, borderBottomWidth: 1, borderBottomColor: DS.border,
    },
    checkbox: {
      width: 24, height: 24, borderRadius: 12,
      borderWidth: 2, borderColor: DS.border,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxActive: { backgroundColor: DS.accent, borderColor: DS.accent },
    exName: { fontSize: 15, fontWeight: '600', color: DS.textPrimary },
    exSub: { fontSize: 12, color: DS.textMuted, marginTop: 2 },
    customBadge: { backgroundColor: DS.raised, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    customBadgeText: { fontSize: 9, fontWeight: '700', color: DS.textSecond, letterSpacing: 0.3 },
    footer: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: DS.surface, borderTopWidth: 1, borderTopColor: DS.border,
      paddingHorizontal: Spacing.md, paddingTop: Spacing.md,
    },
    confirmBtn: {
      backgroundColor: DS.accent, height: 50, borderRadius: Radius.full,
      alignItems: 'center', justifyContent: 'center',
    },
    confirmBtnText: { fontSize: 15, fontWeight: '700', color: DS.accentText },
    modalOverlay: { flex: 1, backgroundColor: DS.overlay, justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: DS.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg },
    modalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    modalTitle: { fontSize: 17, fontWeight: '700', color: DS.textPrimary },
    modalInput: {
      backgroundColor: DS.raised, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12,
      fontSize: 15, color: DS.textPrimary, marginBottom: Spacing.md,
    },
    modalLabel: { fontSize: 12, fontWeight: '600', color: DS.textSecond, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  });
}
