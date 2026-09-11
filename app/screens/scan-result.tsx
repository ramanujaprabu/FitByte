<<<<<<< HEAD
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { nutritionService } from '@/services/api/nutrition';
import { triggerHaptic } from '@/utils/haptics';
import type { MealType } from '@/types';

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
=======
import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Animated, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { MonoText } from '@/components/shared/MonoText';
import { DS } from '@/constants/theme';

const MOCK_RESULT = {
  name: 'Grilled Chicken Bowl',
  confidence: 94,
  calories: 520,
  protein: 42,
  carbs: 48,
  fats: 14,
  imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200',
  ingredients: ['Grilled Chicken Breast', 'Brown Rice', 'Avocado', 'Cherry Tomatoes', 'Mixed Greens'],
};
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

export default function ScanResultScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
<<<<<<< HEAD
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const params = useLocalSearchParams<{
    barcode?: string;
    name?: string;
    brand?: string;
    imageUrl?: string;
    servingLabel?: string;
    calories?: string;
    protein?: string;
    carbs?: string;
    fats?: string;
  }>();

  const [selectedMeal, setSelectedMeal] = useState<MealType>('Breakfast');
  const [quantity, setQuantity] = useState(1);
  const [logging, setLogging] = useState(false);

  const name = params.name || 'Unknown product';
  const brand = params.brand || '';
  const servingLabel = params.servingLabel || '100 g';
  const baseCal = Number(params.calories) || 0;
  const baseP = Number(params.protein) || 0;
  const baseC = Number(params.carbs) || 0;
  const baseF = Number(params.fats) || 0;

  const totalCal = Math.round(baseCal * quantity);
  const totalP = Math.round(baseP * quantity);
  const totalC = Math.round(baseC * quantity);
  const totalF = Math.round(baseF * quantity);

  const onLog = async () => {
    setLogging(true);
    try {
      await nutritionService.logFood({
        name,
        meal: selectedMeal,
        calories: totalCal,
        protein: totalP,
        carbs: totalC,
        fats: totalF,
        imageUrl: params.imageUrl || '',
      });
      triggerHaptic('success');
      router.back();
    } finally {
      setLogging(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color={DS.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Scan Result</ThemedText>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}>

        {!!params.imageUrl && (
          <Image source={{ uri: params.imageUrl }} style={styles.productImage} contentFit="contain" />
        )}

        {/* Barcode Badge & Title */}
        <View style={styles.titleSection}>
          {!!params.barcode && (
            <View style={styles.barcodeBadge}>
              <Ionicons name="barcode-outline" size={14} color={DS.textSecond} />
              <ThemedText style={styles.barcodeText}>{params.barcode}</ThemedText>
            </View>
          )}
          <ThemedText style={styles.foodTitle}>{name}</ThemedText>
          {!!brand && <ThemedText style={styles.foodSubtitle}>{brand}</ThemedText>}
        </View>

        {/* Meal Selector Chips */}
        <View style={styles.mealSegmentRow}>
          {MEAL_TYPES.map(meal => (
            <Pressable
              key={meal}
              style={[styles.mealChip, selectedMeal === meal && styles.mealChipActive]}
              onPress={() => setSelectedMeal(meal)}>
              <ThemedText style={[styles.mealChipText, selectedMeal === meal && styles.mealChipTextActive]}>
                {meal}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Serving Size & Quantity Controls Card */}
        <View style={styles.card}>
          <View style={styles.controlRow}>
            <ThemedText style={styles.controlLabel}>Serving Size</ThemedText>
            <View style={styles.unitSelector}>
              <ThemedText style={styles.unitText}>{servingLabel}</ThemedText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.controlRow}>
            <ThemedText style={styles.controlLabel}>Servings</ThemedText>
            <View style={styles.stepperRow}>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setQuantity(q => Math.max(0.5, q - 0.5))}>
                <Ionicons name="remove" size={18} color={DS.textPrimary} />
              </Pressable>
              <ThemedText style={styles.stepperValue}>{quantity.toFixed(1)}</ThemedText>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setQuantity(q => q + 0.5)}>
                <Ionicons name="add" size={18} color={DS.textPrimary} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Nutrition Facts Hero */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionHeaderCaps}>PER SERVING NUTRITION</ThemedText>

          <View style={styles.heroCalRow}>
            <ThemedText style={styles.heroCalBig}>{totalCal}</ThemedText>
            <ThemedText style={styles.heroCalUnit}>kcal</ThemedText>
          </View>

          {/* Macro Distribution */}
          <View style={styles.macrosRow}>
            <View style={styles.macroBlock}>
              <ThemedText style={styles.macroName}>Protein</ThemedText>
              <ThemedText style={styles.macroVal}>{totalP}g</ThemedText>
            </View>

            <View style={styles.macroBlock}>
              <ThemedText style={styles.macroName}>Carbs</ThemedText>
              <ThemedText style={styles.macroVal}>{totalC}g</ThemedText>
            </View>

            <View style={styles.macroBlock}>
              <ThemedText style={styles.macroName}>Fat</ThemedText>
              <ThemedText style={styles.macroVal}>{totalF}g</ThemedText>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom || Spacing.md }]}>
        <Pressable style={styles.logBtn} onPress={onLog} disabled={logging}>
          {logging ? (
            <ActivityIndicator color={DS.accentText} />
          ) : (
            <ThemedText style={styles.logBtnText}>Log to {selectedMeal} - {totalCal} kcal</ThemedText>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: DS.bg,
    },
    topHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      height: 54,
      backgroundColor: DS.bg,
    },
    iconBtn: {
      padding: 6,
      width: 36,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: DS.textPrimary,
    },
    scroll: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.lg,
    },
    productImage: {
      width: '100%',
      height: 160,
      borderRadius: Radius.lg,
      marginBottom: Spacing.lg,
      backgroundColor: DS.raised,
    },
    titleSection: {
      marginBottom: Spacing.lg,
    },
    barcodeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    barcodeText: {
      fontFamily: Fonts.mono,
      fontSize: 12,
      color: DS.textSecond,
    },
    foodTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    foodSubtitle: {
      fontSize: 14,
      color: DS.textSecond,
    },
    mealSegmentRow: {
      flexDirection: 'row',
      gap: Spacing.xs,
      marginBottom: Spacing.lg,
    },
    mealChip: {
      flex: 1,
      backgroundColor: DS.raised,
      borderRadius: Radius.full,
      paddingVertical: 8,
      alignItems: 'center',
    },
    mealChipActive: {
      backgroundColor: DS.accent,
    },
    mealChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: DS.textSecond,
    },
    mealChipTextActive: {
      color: DS.accentText,
    },
    card: {
      backgroundColor: DS.surface,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    controlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    controlLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: DS.textPrimary,
    },
    unitSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: DS.raised,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: Radius.sm,
    },
    unitText: {
      fontSize: 13,
      color: DS.textSecond,
    },
    divider: {
      height: 1,
      backgroundColor: DS.border,
      marginVertical: Spacing.md,
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    stepperBtn: {
      width: 34,
      height: 34,
      borderRadius: Radius.sm,
      backgroundColor: DS.raised,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperValue: {
      fontFamily: Fonts.mono,
      fontSize: 16,
      fontWeight: '600',
      color: DS.textPrimary,
      minWidth: 32,
      textAlign: 'center',
    },
    sectionHeaderCaps: {
      fontSize: 11,
      fontWeight: '600',
      color: DS.textSecond,
      letterSpacing: 0.5,
      marginBottom: Spacing.md,
    },
    heroCalRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
      marginBottom: Spacing.lg,
    },
    heroCalBig: {
      fontFamily: Fonts.mono,
      fontSize: 48,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -1,
    },
    heroCalUnit: {
      fontSize: 16,
      color: DS.textSecond,
    },
    macrosRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: DS.border,
    },
    macroBlock: {
      gap: 4,
    },
    macroName: {
      fontSize: 13,
      color: DS.textSecond,
    },
    macroVal: {
      fontFamily: Fonts.mono,
      fontSize: 20,
      fontWeight: '600',
      color: DS.textPrimary,
    },
    stickyFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: DS.bg,
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
    },
    logBtn: {
      backgroundColor: DS.accent,
      height: 50,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logBtnText: {
      fontSize: 15,
      fontWeight: '600',
      color: DS.accentText,
    },
  });
}
=======
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const [analyzing, setAnalyzing] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalyzing(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        {/* Image */}
        <Image
          source={imageUri ?? MOCK_RESULT.imageUrl}
          style={styles.resultImage}
          contentFit="cover"
        />

        {analyzing ? (
          <Card style={styles.analyzingCard}>
            <ActivityIndicator size="large" color={DS.accent} />
            <ThemedText style={styles.analyzingTitle}>Analyzing meal…</ThemedText>
            <ThemedText style={styles.analyzingSubtitle}>AI is identifying ingredients and calculating nutrition</ThemedText>
          </Card>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Result Card */}
            <Card>
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.resultName}>{MOCK_RESULT.name}</ThemedText>
                  <View style={styles.confidenceRow}>
                    <Ionicons name="sparkles-outline" size={12} color={DS.textSecond} />
                    <ThemedText style={styles.confidenceText}>{MOCK_RESULT.confidence}% confidence</ThemedText>
                  </View>
                </View>
                <View style={styles.calBadge}>
                  <MonoText bold style={styles.calNum}>{MOCK_RESULT.calories}</MonoText>
                  <ThemedText style={styles.calUnit}>kcal</ThemedText>
                </View>
              </View>

              {/* Macro cards */}
              <View style={styles.macroGrid}>
                {[
                  { label: 'Protein', val: MOCK_RESULT.protein, unit: 'g', pct: MOCK_RESULT.protein / 150 },
                  { label: 'Carbs',   val: MOCK_RESULT.carbs,   unit: 'g', pct: MOCK_RESULT.carbs / 200 },
                  { label: 'Fats',    val: MOCK_RESULT.fats,    unit: 'g', pct: MOCK_RESULT.fats / 70 },
                ].map(m => (
                  <View key={m.label} style={styles.macroBox}>
                    <MonoText bold style={styles.macroVal}>{m.val}</MonoText>
                    <ThemedText style={styles.macroUnit}>{m.unit}</ThemedText>
                    <ThemedText style={styles.macroLabel}>{m.label}</ThemedText>
                    <ProgressBar progress={m.pct} height={3} />
                  </View>
                ))}
              </View>
            </Card>

            {/* Detected Ingredients */}
            <Card>
              <ThemedText style={styles.sectionTitle}>Detected Ingredients</ThemedText>
              {MOCK_RESULT.ingredients.map((ing, i) => (
                <View key={i} style={[styles.ingredRow, i < MOCK_RESULT.ingredients.length - 1 && styles.ingredBorder]}>
                  <View style={styles.ingredDot} />
                  <ThemedText style={styles.ingredText}>{ing}</ThemedText>
                </View>
              ))}
            </Card>

            {/* Actions */}
            <View style={styles.actionRow}>
              <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
                <Ionicons name="refresh-outline" size={16} color={DS.textPrimary} />
                <ThemedText style={styles.secondaryBtnText}>Rescan</ThemedText>
              </Pressable>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => router.push('/screens/add-food')}>
                <Ionicons name="add-circle-outline" size={16} color="#fff" />
                <ThemedText style={styles.primaryBtnText}>Add to Log</ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },

  resultImage: { width: '100%', height: 220, borderRadius: 16, marginBottom: 16 },

  analyzingCard: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  analyzingTitle: { fontSize: 18, fontWeight: '600', color: DS.textPrimary },
  analyzingSubtitle: { fontSize: 13, color: DS.textSecond, textAlign: 'center', lineHeight: 20 },

  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  resultName: { fontSize: 18, fontWeight: '600', color: DS.textPrimary },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  confidenceText: { fontSize: 12, color: DS.textSecond },
  calBadge: { alignItems: 'center', backgroundColor: DS.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: DS.border },
  calNum: { fontSize: 22 },
  calUnit: { fontSize: 10, color: DS.textMuted, marginTop: 1 },

  macroGrid: { flexDirection: 'row', gap: 8 },
  macroBox: { flex: 1, backgroundColor: DS.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: DS.border, gap: 2 },
  macroVal: { fontSize: 20 },
  macroUnit: { fontSize: 10, color: DS.textMuted },
  macroLabel: { fontSize: 11, color: DS.textSecond, marginBottom: 6 },

  sectionTitle: { fontSize: 15, fontWeight: '600', color: DS.textPrimary, marginBottom: 12 },
  ingredRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  ingredBorder: { borderBottomWidth: 1, borderBottomColor: DS.border },
  ingredDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: DS.textSecond },
  ingredText: { fontSize: 14, color: DS.textPrimary },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  secondaryBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 14, borderRadius: 12, backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border },
  secondaryBtnText: { fontSize: 14, fontWeight: '500', color: DS.textPrimary },
  primaryBtn: { flex: 1.4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 14, borderRadius: 12, backgroundColor: DS.accent },
  primaryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
