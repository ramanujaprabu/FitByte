/**
 * edit-goals.tsx — the settings destination for everything onboarding only
 * ever asked once: height, activity level, goal type/weight, and meal
 * split. Re-runs the same BMR/TDEE calculation onboarding uses and saves
 * through the same persistence path, so editing here is exactly as correct
 * as the original setup — not a second, divergent code path.
 */
import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { useUnits } from '@/contexts/UnitsContext';
import { Radius, Spacing } from '@/constants/theme';
import { calculateOnboardingPlan, userService } from '@/services/api/user';
import { triggerHaptic } from '@/utils/haptics';
import { cmToFeetInches, feetInchesToCm, formatWeight } from '@/utils/units';
import type { ActivityLevel, BiologicalSex, GoalType } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; sub: string }[] = [
  { value: 'sedentary', label: 'Sedentary', sub: 'Little or no exercise, desk job' },
  { value: 'light', label: 'Lightly active', sub: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately active', sub: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Active', sub: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Very active', sub: 'Hard daily exercise or physical job' },
];

const GOAL_OPTIONS: { value: GoalType; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { value: 'lose', label: 'Lose weight', icon: 'trending-down-outline' },
  { value: 'maintain', label: 'Maintain weight', icon: 'remove-outline' },
  { value: 'gain', label: 'Gain weight', icon: 'trending-up-outline' },
];

export default function EditGoalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { units } = useUnits();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sex, setSex] = useState<BiologicalSex>('male');
  const [age, setAge] = useState('');
  const [currentWeightKg, setCurrentWeightKg] = useState(0);
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('maintain');
  const [goalWeightInput, setGoalWeightInput] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [includeSnacks, setIncludeSnacks] = useState(true);

  useEffect(() => {
    userService.getProfile().then((profile) => {
      setSex(profile.user.sex ?? 'male');
      setAge(profile.user.age ? String(profile.user.age) : '');
      setCurrentWeightKg(profile.bodyMetrics.weight || 0);
      if (profile.bodyMetrics.heightCm) {
        setHeightCm(String(Math.round(profile.bodyMetrics.heightCm)));
        const { feet, inches } = cmToFeetInches(profile.bodyMetrics.heightCm);
        setHeightFt(String(feet));
        setHeightIn(String(inches));
      }
      if (profile.fitnessGoal.goalType) setGoalType(profile.fitnessGoal.goalType);
      if (profile.fitnessGoal.activityLevel) setActivityLevel(profile.fitnessGoal.activityLevel);
      setIncludeSnacks(profile.fitnessGoal.includesSnacks);
      if (profile.bodyMetrics.goalWeight) {
        setGoalWeightInput(units === 'imperial'
          ? (profile.bodyMetrics.goalWeight / 0.45359237).toFixed(0)
          : String(Math.round(profile.bodyMetrics.goalWeight)));
      }
    }).catch(() => setError('Could not load your goals.')).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ageNum = Number(age);
  const heightNum = units === 'imperial'
    ? feetInchesToCm(Number(heightFt) || 0, Number(heightIn) || 0)
    : Number(heightCm);
  const goalWeightNum = goalWeightInput
    ? (units === 'imperial' ? Number(goalWeightInput) * 0.45359237 : Number(goalWeightInput))
    : undefined;

  const ageValid = Number.isFinite(ageNum) && ageNum >= 10 && ageNum <= 100;
  const heightValid = Number.isFinite(heightNum) && heightNum >= 100 && heightNum <= 250;
  const formValid = ageValid && heightValid && currentWeightKg > 0;

  const preview = useMemo(() => {
    if (!formValid) return null;
    return calculateOnboardingPlan({
      weightKg: currentWeightKg,
      heightCm: heightNum,
      age: ageNum,
      sex,
      activityLevel,
      goalType,
      goalWeightKg: goalWeightNum,
      includeSnacks,
    });
  }, [formValid, currentWeightKg, heightNum, ageNum, sex, activityLevel, goalType, goalWeightNum, includeSnacks]);

  const handleSave = async () => {
    if (!preview || !formValid) return;
    triggerHaptic('success');
    setSaving(true);
    setError(null);
    try {
      await userService.completeOnboarding({
        weightKg: currentWeightKg,
        heightCm: heightNum,
        age: ageNum,
        sex,
        activityLevel,
        goalType,
        goalWeightKg: goalWeightNum,
        includeSnacks,
      });
      router.back();
    } catch (e: any) {
      setError(e?.message ?? 'Could not save your goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={DS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 120 }]}>

        <ScreenHeader title="Fitness Goals" subtitle="Update your stats to recalculate your targets" />

        <Card>
          <ThemedText style={styles.sectionLabel}>Biological Sex</ThemedText>
          <View style={styles.chipRow}>
            {(['male', 'female'] as BiologicalSex[]).map((s) => (
              <Pressable key={s} onPress={() => setSex(s)} style={[styles.chip, sex === s && styles.chipActive]}>
                <ThemedText style={[styles.chipText, sex === s && styles.chipTextActive]}>
                  {s === 'male' ? 'Male' : 'Female'}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.sectionLabel}>Age</ThemedText>
            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="e.g. 28"
              placeholderTextColor={DS.textMuted}
              style={styles.input}
            />
            {age.length > 0 && !ageValid && <ThemedText style={styles.fieldError}>Enter an age between 10 and 100</ThemedText>}
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.sectionLabel}>Height</ThemedText>
            {units === 'imperial' ? (
              <View style={styles.heightRow}>
                <TextInput value={heightFt} onChangeText={setHeightFt} keyboardType="numeric" placeholder="5" placeholderTextColor={DS.textMuted} style={[styles.input, { flex: 1 }]} />
                <ThemedText style={styles.unitSuffix}>ft</ThemedText>
                <TextInput value={heightIn} onChangeText={setHeightIn} keyboardType="numeric" placeholder="9" placeholderTextColor={DS.textMuted} style={[styles.input, { flex: 1 }]} />
                <ThemedText style={styles.unitSuffix}>in</ThemedText>
              </View>
            ) : (
              <TextInput value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" placeholder="175" placeholderTextColor={DS.textMuted} style={styles.input} />
            )}
            {(heightCm.length > 0 || heightFt.length > 0) && !heightValid && (
              <ThemedText style={styles.fieldError}>Enter a height between 100–250cm (3&apos;3&quot;–8&apos;2&quot;)</ThemedText>
            )}
          </View>

          <View style={styles.currentWeightRow}>
            <ThemedText style={styles.currentWeightLabel}>Current weight</ThemedText>
            <ThemedText style={styles.currentWeightVal}>{formatWeight(currentWeightKg, units, 1)}</ThemedText>
          </View>
          <ThemedText style={styles.currentWeightHint}>Update your weight from Trends → Log Weight.</ThemedText>
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Goal</ThemedText>
          <View style={styles.optionList}>
            {GOAL_OPTIONS.map((opt) => {
              const active = goalType === opt.value;
              return (
                <Pressable key={opt.value} onPress={() => setGoalType(opt.value)} style={[styles.optionRow, active && styles.optionRowActive]}>
                  <Ionicons name={opt.icon} size={18} color={active ? DS.accentText : DS.textSecond} />
                  <ThemedText style={[styles.optionRowText, active && { color: DS.accentText }]}>{opt.label}</ThemedText>
                </Pressable>
              );
            })}
          </View>

          {goalType !== 'maintain' && (
            <View style={[styles.fieldGroup, { marginTop: Spacing.md }]}>
              <ThemedText style={styles.sectionLabel}>Goal Weight ({units === 'imperial' ? 'lb' : 'kg'})</ThemedText>
              <TextInput
                value={goalWeightInput}
                onChangeText={setGoalWeightInput}
                keyboardType="numeric"
                placeholder="Optional"
                placeholderTextColor={DS.textMuted}
                style={styles.input}
              />
            </View>
          )}
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Activity Level</ThemedText>
          <View style={styles.optionList}>
            {ACTIVITY_OPTIONS.map((opt) => {
              const active = activityLevel === opt.value;
              return (
                <Pressable key={opt.value} onPress={() => setActivityLevel(opt.value)} style={[styles.optionRow, active && styles.optionRowActive]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.optionRowText, active && { color: DS.accentText }]}>{opt.label}</ThemedText>
                    <ThemedText style={[styles.optionRowSub, active && { color: DS.accentText, opacity: 0.8 }]}>{opt.sub}</ThemedText>
                  </View>
                  {active && <Ionicons name="checkmark" size={16} color={DS.accentText} />}
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Meal Split</ThemedText>
          <View style={styles.chipRow}>
            <Pressable onPress={() => setIncludeSnacks(false)} style={[styles.chip, { flex: 1 }, !includeSnacks && styles.chipActive]}>
              <ThemedText style={[styles.chipText, !includeSnacks && styles.chipTextActive]}>3 meals</ThemedText>
            </Pressable>
            <Pressable onPress={() => setIncludeSnacks(true)} style={[styles.chip, { flex: 1 }, includeSnacks && styles.chipActive]}>
              <ThemedText style={[styles.chipText, includeSnacks && styles.chipTextActive]}>4 meals</ThemedText>
            </Pressable>
          </View>
        </Card>

        {preview && (
          <Card style={styles.previewCard}>
            <ThemedText style={styles.sectionLabel}>New Daily Targets</ThemedText>
            <View style={styles.previewHero}>
              <MonoText bold style={styles.previewCal}>{preview.dailyCalories}</MonoText>
              <ThemedText style={styles.previewCalUnit}>kcal / day</ThemedText>
            </View>
            <View style={styles.previewMacroRow}>
              <View style={styles.previewMacro}>
                <MonoText bold style={styles.previewMacroVal}>{preview.macros.protein}g</MonoText>
                <ThemedText style={styles.previewMacroLabel}>Protein</ThemedText>
              </View>
              <View style={styles.previewMacro}>
                <MonoText bold style={styles.previewMacroVal}>{preview.macros.carbs}g</MonoText>
                <ThemedText style={styles.previewMacroLabel}>Carbs</ThemedText>
              </View>
              <View style={styles.previewMacro}>
                <MonoText bold style={styles.previewMacroVal}>{preview.macros.fats}g</MonoText>
                <ThemedText style={styles.previewMacroLabel}>Fats</ThemedText>
              </View>
            </View>
          </Card>
        )}

        {!!error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Pressable
          onPress={handleSave}
          disabled={!formValid || saving}
          style={[styles.saveBtn, (!formValid || saving) && styles.saveBtnDisabled]}>
          {saving ? <ActivityIndicator color={DS.accentText} /> : (
            <ThemedText style={styles.saveBtnText}>Save Goals</ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    scroll: { paddingHorizontal: 20 },
    sectionLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    fieldGroup: { marginBottom: 14 },
    input: { backgroundColor: DS.raised, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: DS.textPrimary },
    fieldError: { fontSize: 11, color: DS.statusBad, marginTop: 6 },
    heightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    unitSuffix: { fontSize: 13, color: DS.textSecond },
    currentWeightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    currentWeightLabel: { fontSize: 14, color: DS.textPrimary },
    currentWeightVal: { fontFamily: 'JetBrainsMono_600SemiBold', fontSize: 15, color: DS.textPrimary },
    currentWeightHint: { fontSize: 11, color: DS.textMuted, marginTop: 4 },
    chipRow: { flexDirection: 'row', gap: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: DS.raised, alignItems: 'center' },
    chipActive: { backgroundColor: DS.accent },
    chipText: { fontSize: 13, fontWeight: '600', color: DS.textSecond },
    chipTextActive: { color: DS.accentText },
    optionList: { gap: 8 },
    optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: DS.raised, borderRadius: Radius.md, padding: 12 },
    optionRowActive: { backgroundColor: DS.accent },
    optionRowText: { fontSize: 14, fontWeight: '600', color: DS.textPrimary },
    optionRowSub: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
    previewCard: { backgroundColor: DS.accentDim },
    previewHero: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: Spacing.sm },
    previewCal: { fontSize: 32 },
    previewCalUnit: { fontSize: 13, color: DS.textSecond },
    previewMacroRow: { flexDirection: 'row', justifyContent: 'space-between' },
    previewMacro: { alignItems: 'center', gap: 2 },
    previewMacroVal: { fontSize: 16 },
    previewMacroLabel: { fontSize: 11, color: DS.textMuted },
    errorText: { color: DS.statusBad, fontSize: 13, textAlign: 'center', marginTop: Spacing.sm },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: DS.bg, paddingHorizontal: 20, paddingTop: Spacing.md },
    saveBtn: { backgroundColor: DS.accent, height: 52, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
    saveBtnDisabled: { opacity: 0.4 },
    saveBtnText: { fontSize: 15, fontWeight: '700', color: DS.accentText },
  });
}
