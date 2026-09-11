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

export default function ScanResultScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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
