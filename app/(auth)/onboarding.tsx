import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { TextField } from '@/components/shared/TextField';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { calculateOnboardingPlan, userService } from '@/services/api/user';
import { triggerHaptic } from '@/utils/haptics';
import type { ActivityLevel, BiologicalSex, GoalType } from '@/types';

type StepKey = 'sex' | 'age' | 'body' | 'goal' | 'goalWeight' | 'activity' | 'meals' | 'review';

const ACTIVITY_OPTIONS: { value: ActivityLevel; icon: keyof typeof Ionicons.glyphMap; label: string; sub: string }[] = [
  { value: 'sedentary', icon: 'bed-outline', label: 'Sedentary', sub: 'Little or no exercise, desk job' },
  { value: 'light', icon: 'walk-outline', label: 'Lightly active', sub: 'Light exercise 1-3 days/week' },
  { value: 'moderate', icon: 'bicycle-outline', label: 'Moderately active', sub: 'Moderate exercise 3-5 days/week' },
  { value: 'active', icon: 'barbell-outline', label: 'Active', sub: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', icon: 'flame-outline', label: 'Very active', sub: 'Hard daily exercise or physical job' },
];

/** One big tappable choice card — the "pick one, auto-advance" pattern used throughout the flow. */
function OptionCard({
  icon, label, sub, active, onPress,
}: { icon: keyof typeof Ionicons.glyphMap; label: string; sub?: string; active?: boolean; onPress: () => void }) {
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  return (
    <Pressable onPress={onPress} style={[styles.optionCard, active && styles.optionCardActive]}>
      <View style={[styles.optionIconWrap, active && styles.optionIconWrapActive]}>
        <Ionicons name={icon} size={22} color={active ? DS.accentText : DS.textSecond} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.optionLabel}>{label}</ThemedText>
        {!!sub && <ThemedText style={styles.optionSub}>{sub}</ThemedText>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={DS.textMuted} />
    </Pressable>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  return (
    <View style={styles.heading}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {!!subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { logout, refreshUser } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [sex, setSex] = useState<BiologicalSex | null>(null);
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [goalWeightKg, setGoalWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [includeSnacks, setIncludeSnacks] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: StepKey[] = useMemo(() => {
    const s: StepKey[] = ['sex', 'age', 'body', 'goal'];
    if (goalType !== 'maintain') s.push('goalWeight');
    s.push('activity', 'meals', 'review');
    return s;
  }, [goalType]);

  const step = steps[Math.min(stepIndex, steps.length - 1)];

  const ageNum = Number(age);
  const heightNum = Number(heightCm);
  const weightNum = Number(weightKg);
  const goalWeightNum = Number(goalWeightKg);

  const ageError = age.length > 0 && (!Number.isFinite(ageNum) || ageNum < 10 || ageNum > 100) ? 'Enter an age between 10 and 100' : undefined;
  const heightError = heightCm.length > 0 && (!Number.isFinite(heightNum) || heightNum < 100 || heightNum > 250) ? 'Enter height in cm (100-250)' : undefined;
  const weightError = weightKg.length > 0 && (!Number.isFinite(weightNum) || weightNum < 30 || weightNum > 300) ? 'Enter weight in kg (30-300)' : undefined;

  const bodyValid = !!heightCm && !heightError && !!weightKg && !weightError;

  const preview = useMemo(() => {
    if (!sex || !age || ageError || !bodyValid || !goalType || !activityLevel || includeSnacks === null) return null;
    return calculateOnboardingPlan({
      weightKg: weightNum,
      heightCm: heightNum,
      age: ageNum,
      sex,
      activityLevel,
      goalType,
      goalWeightKg: goalWeightKg ? goalWeightNum : undefined,
      includeSnacks,
    });
  }, [sex, age, ageError, bodyValid, goalType, activityLevel, includeSnacks, weightNum, heightNum, ageNum, goalWeightKg, goalWeightNum]);

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => { triggerHaptic('light'); setStepIndex((i) => Math.max(i - 1, 0)); };

  const choose = (apply: () => void) => {
    triggerHaptic('selection');
    apply();
    goNext();
  };

  const onSignOut = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const onSubmit = async () => {
    if (!preview || !sex || !goalType || !activityLevel || includeSnacks === null) return;
    setSaving(true);
    setError(null);
    try {
      await userService.completeOnboarding({
        weightKg: weightNum,
        heightCm: heightNum,
        age: ageNum,
        sex,
        activityLevel,
        goalType,
        goalWeightKg: goalWeightKg ? goalWeightNum : undefined,
        includeSnacks,
      });
      await refreshUser();
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message ?? 'Could not save your setup. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        {stepIndex > 0 ? (
          <Pressable onPress={goBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={DS.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <View style={styles.progressWrap}>
          <ProgressBar progress={(stepIndex + 1) / steps.length} height={4} />
        </View>
        <Pressable onPress={onSignOut} style={styles.iconBtn}>
          <ThemedText style={styles.exitText}>Exit</ThemedText>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>

          {step === 'sex' && (
            <>
              <StepHeading title="What's your biological sex?" subtitle="This affects the accuracy of your calorie calculation." />
              <OptionCard icon="man-outline" label="Male" active={sex === 'male'} onPress={() => choose(() => setSex('male'))} />
              <OptionCard icon="woman-outline" label="Female" active={sex === 'female'} onPress={() => choose(() => setSex('female'))} />
            </>
          )}

          {step === 'age' && (
            <>
              <StepHeading title="How old are you?" />
              <TextField placeholder="e.g. 28" keyboardType="numeric" value={age} onChangeText={setAge} error={ageError} autoFocus style={styles.bigInput} />
              <Button label="Continue" onPress={goNext} disabled={!age || !!ageError} style={{ marginTop: Spacing.sm }} />
            </>
          )}

          {step === 'body' && (
            <>
              <StepHeading title="Your height & weight" subtitle="Used to calculate your energy needs." />
              <TextField label="Height (cm)" placeholder="175" keyboardType="numeric" value={heightCm} onChangeText={setHeightCm} error={heightError} autoFocus />
              <TextField label="Current Weight (kg)" placeholder="72" keyboardType="numeric" value={weightKg} onChangeText={setWeightKg} error={weightError} />
              <Button label="Continue" onPress={goNext} disabled={!bodyValid} style={{ marginTop: Spacing.xs }} />
            </>
          )}

          {step === 'goal' && (
            <>
              <StepHeading title="What's your goal?" />
              <OptionCard icon="trending-down-outline" label="Lose weight" active={goalType === 'lose'} onPress={() => choose(() => setGoalType('lose'))} />
              <OptionCard icon="remove-outline" label="Maintain weight" active={goalType === 'maintain'} onPress={() => choose(() => setGoalType('maintain'))} />
              <OptionCard icon="trending-up-outline" label="Gain weight" active={goalType === 'gain'} onPress={() => choose(() => setGoalType('gain'))} />
            </>
          )}

          {step === 'goalWeight' && (
            <>
              <StepHeading title="What's your goal weight?" subtitle="Optional — helps us estimate your timeline." />
              <TextField placeholder="e.g. 65" keyboardType="numeric" value={goalWeightKg} onChangeText={setGoalWeightKg} style={styles.bigInput} autoFocus />
              <Button label="Continue" onPress={goNext} style={{ marginTop: Spacing.sm }} />
              <Pressable onPress={() => { setGoalWeightKg(''); goNext(); }} style={styles.skipBtn}>
                <ThemedText style={styles.skipText}>Skip</ThemedText>
              </Pressable>
            </>
          )}

          {step === 'activity' && (
            <>
              <StepHeading title="How active are you?" />
              {ACTIVITY_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  icon={opt.icon}
                  label={opt.label}
                  sub={opt.sub}
                  active={activityLevel === opt.value}
                  onPress={() => choose(() => setActivityLevel(opt.value))}
                />
              ))}
            </>
          )}

          {step === 'meals' && (
            <>
              <StepHeading title="How do you want to split your meals?" />
              <OptionCard
                icon="restaurant-outline"
                label="3 meals"
                sub="Breakfast, Lunch, Dinner"
                active={includeSnacks === false}
                onPress={() => choose(() => setIncludeSnacks(false))}
              />
              <OptionCard
                icon="nutrition-outline"
                label="4 meals"
                sub="Breakfast, Lunch, Dinner, Snacks"
                active={includeSnacks === true}
                onPress={() => choose(() => setIncludeSnacks(true))}
              />
            </>
          )}

          {step === 'review' && (
            <>
              <StepHeading title="Your Daily Plan" subtitle="Based on what you told us — you can adjust this anytime later." />
              {preview ? (
                <Card style={styles.previewCard}>
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
                  <View style={styles.divider} />
                  {Object.entries(preview.mealCalories).map(([meal, cal]) => (
                    <View key={meal} style={styles.mealSplitRow}>
                      <ThemedText style={styles.mealSplitName}>{meal}</ThemedText>
                      <MonoText style={styles.mealSplitVal}>{cal} kcal</MonoText>
                    </View>
                  ))}
                </Card>
              ) : (
                <ThemedText style={styles.subtitle}>Missing some answers — go back and fill them in.</ThemedText>
              )}

              {!!error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

              <Button label="Get Started" onPress={onSubmit} disabled={!preview} loading={saving} style={{ marginTop: Spacing.sm }} />
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingTop: Spacing.xs },
    iconBtn: { width: 56, height: 40, alignItems: 'center', justifyContent: 'center' },
    progressWrap: { flex: 1, paddingHorizontal: Spacing.sm },
    exitText: { fontSize: 13, color: DS.textMuted },

    scroll: { paddingHorizontal: 20, paddingTop: Spacing.xl, flexGrow: 1 },
    heading: { marginBottom: Spacing.lg },
    title: { fontSize: 24, fontWeight: '700', color: DS.textPrimary, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: DS.textSecond, marginTop: Spacing.xs, lineHeight: 20 },

    bigInput: { fontSize: 20, textAlign: 'center' },

    optionCard: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: DS.surface,
      borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm,
    },
    optionCardActive: { backgroundColor: DS.accentDim },
    optionIconWrap: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: DS.raised,
      alignItems: 'center', justifyContent: 'center',
    },
    optionIconWrapActive: { backgroundColor: DS.accent },
    optionLabel: { fontSize: 15, fontWeight: '600', color: DS.textPrimary },
    optionSub: { fontSize: 12, color: DS.textMuted, marginTop: 2 },

    skipBtn: { alignItems: 'center', marginTop: Spacing.md, padding: Spacing.sm },
    skipText: { fontSize: 13, color: DS.textMuted, fontWeight: '500' },

    previewCard: { backgroundColor: DS.accentDim },
    previewHero: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: Spacing.md },
    previewCal: { fontSize: 36 },
    previewCalUnit: { fontSize: 14, color: DS.textSecond },
    previewMacroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
    previewMacro: { alignItems: 'center', gap: 2 },
    previewMacroVal: { fontSize: 17 },
    previewMacroLabel: { fontSize: 11, color: DS.textMuted },
    divider: { height: 1, backgroundColor: DS.border, marginVertical: Spacing.sm },
    mealSplitRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    mealSplitName: { fontSize: 13, color: DS.textSecond },
    mealSplitVal: { fontSize: 13, color: DS.textPrimary },
    errorText: { color: DS.statusBad, fontSize: 13, textAlign: 'center', marginTop: Spacing.sm },
  });
}
