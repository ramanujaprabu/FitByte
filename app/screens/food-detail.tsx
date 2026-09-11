<<<<<<< HEAD
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { nutritionService } from '@/services/api/nutrition';
import type { FoodEntry } from '@/types';

export default function FoodDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { id } = useLocalSearchParams<{ id: string }>();

  const [entry, setEntry] = useState<FoodEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    nutritionService
      .getFoodEntry(id)
      .then(setEntry)
      .finally(() => setLoading(false));
  }, [id]);

  const confirmDelete = () => {
    Alert.alert('Delete entry?', `Remove "${entry?.name}" from your log. This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await nutritionService.deleteFood(id);
            router.back();
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <ActivityIndicator color={DS.accent} />
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <ThemedText style={styles.notFoundText}>Entry not found.</ThemedText>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <ThemedText style={styles.backLinkText}>Go back</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color={DS.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Food Detail</ThemedText>
        <Pressable style={styles.iconBtn} onPress={confirmDelete} disabled={deleting}>
          <Ionicons name="trash-outline" size={20} color={DS.statusBad} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}>

        {!!entry.imageUrl && (
          <Image source={{ uri: entry.imageUrl }} style={styles.heroImage} contentFit="cover" />
        )}

        {/* Title & Meal/Time */}
        <View style={styles.titleSection}>
          <ThemedText style={styles.foodTitle}>{entry.name}</ThemedText>
          <ThemedText style={styles.foodSubtitle}>{entry.meal} • {entry.time}</ThemedText>
        </View>

        {/* Nutrition Facts Hero */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionHeaderCaps}>NUTRITION FACTS</ThemedText>

          <View style={styles.heroCalRow}>
            <ThemedText style={styles.heroCalBig}>{Math.round(entry.calories)}</ThemedText>
            <ThemedText style={styles.heroCalUnit}>kcal</ThemedText>
          </View>

          {/* Macro Distribution */}
          <View style={styles.macrosRow}>
            <View style={styles.macroBlock}>
              <ThemedText style={styles.macroName}>Protein</ThemedText>
              <ThemedText style={styles.macroVal}>{Math.round(entry.protein)}g</ThemedText>
            </View>

            <View style={styles.macroBlock}>
              <ThemedText style={styles.macroName}>Carbs</ThemedText>
              <ThemedText style={styles.macroVal}>{Math.round(entry.carbs)}g</ThemedText>
            </View>

            <View style={styles.macroBlock}>
              <ThemedText style={styles.macroName}>Fat</ThemedText>
              <ThemedText style={styles.macroVal}>{Math.round(entry.fats)}g</ThemedText>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom || Spacing.md }]}>
        <Pressable style={styles.deleteBtn} onPress={confirmDelete} disabled={deleting}>
          {deleting ? (
            <ActivityIndicator color={DS.accentText} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color={DS.accentText} />
              <ThemedText style={styles.deleteBtnText}>Delete Entry</ThemedText>
            </>
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
    centered: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
    notFoundText: { fontSize: 15, color: DS.textSecond },
    backLink: { padding: Spacing.sm },
    backLinkText: { fontSize: 14, fontWeight: '600', color: DS.textPrimary },
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
    heroImage: {
      width: '100%',
      height: 180,
      borderRadius: Radius.lg,
      marginBottom: Spacing.lg,
      backgroundColor: DS.raised,
    },
    titleSection: {
      marginBottom: Spacing.lg,
    },
    foodTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    foodSubtitle: {
      fontSize: 14,
      color: DS.textSecond,
    },
    card: {
      backgroundColor: DS.surface,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
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
    deleteBtn: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: DS.statusBad,
      height: 50,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteBtnText: {
      fontSize: 15,
      fontWeight: '600',
      color: DS.accentText,
    },
  });
}
=======
import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import { MOCK_FOOD_LOG } from '@/data/nutrition';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FoodDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const food = MOCK_FOOD_LOG.find(f => f.id === id) ?? MOCK_FOOD_LOG[0];

  const macros = [
    { name: 'Protein', grams: food.protein, target: 150 },
    { name: 'Carbs', grams: food.carbs, target: 200 },
    { name: 'Fats', grams: food.fats, target: 70 },
  ];

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <Image source={food.imageUrl} style={styles.heroImage} contentFit="cover" />
        <View style={styles.content}>
          <Card style={styles.titleCard}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.foodName}>{food.name}</ThemedText>
                <ThemedText style={styles.mealTag}>{food.meal} · {food.time}</ThemedText>
              </View>
              <View style={styles.calBadge}>
                <MonoText bold style={styles.calNum}>{food.calories}</MonoText>
                <ThemedText style={styles.calUnit}>kcal</ThemedText>
              </View>
            </View>
          </Card>

          <Card>
            <ThemedText style={styles.sectionTitle}>Macro Breakdown</ThemedText>
            {macros.map(m => (
              <View key={m.name} style={styles.macroRow}>
                <View style={styles.macroLeft}>
                  <ThemedText style={styles.macroName}>{m.name}</ThemedText>
                  <ThemedText style={styles.macroSub}>{m.grams}g of {m.target}g goal</ThemedText>
                </View>
                <MonoText bold style={styles.macroGrams}>{m.grams}g</MonoText>
              </View>
            ))}
            {macros.map(m => (
              <View key={`bar-${m.name}`} style={styles.barRow}>
                <ThemedText style={styles.barLabel}>{m.name}</ThemedText>
                <View style={{ flex: 1 }}>
                  <ProgressBar progress={m.grams / m.target} />
                </View>
                <MonoText style={styles.barPct}>{Math.round((m.grams / m.target) * 100)}%</MonoText>
              </View>
            ))}
          </Card>

          <Card>
            <ThemedText style={styles.sectionTitle}>Nutrition Facts</ThemedText>
            {[
              { label: 'Calories', val: `${food.calories} kcal` },
              { label: 'Protein', val: `${food.protein}g` },
              { label: 'Carbs', val: `${food.carbs}g` },
              { label: 'Fats', val: `${food.fats}g` },
              { label: 'Fiber (est.)', val: '2g' },
              { label: 'Sodium (est.)', val: '320mg' },
            ].map((row, i, arr) => (
              <View key={row.label} style={[styles.factRow, i < arr.length - 1 && styles.factBorder]}>
                <ThemedText style={styles.factLabel}>{row.label}</ThemedText>
                <MonoText style={styles.factVal}>{row.val}</MonoText>
              </View>
            ))}
          </Card>

          <View style={styles.actionRow}>
            <Pressable style={styles.editBtn}>
              <Ionicons name="create-outline" size={16} color={DS.textPrimary} />
              <ThemedText style={styles.editBtnText}>Edit Entry</ThemedText>
            </Pressable>
            <Pressable style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={16} color={DS.statusBad} />
              <ThemedText style={[styles.editBtnText, { color: DS.statusBad }]}>Remove</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  heroImage: { width: '100%', height: 260 },
  content: { paddingHorizontal: 20 },
  titleCard: { marginTop: -16, zIndex: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  foodName: { fontSize: 20, fontWeight: '600', color: DS.textPrimary },
  mealTag: { marginTop: 3, fontSize: 12, color: DS.textMuted },
  calBadge: { alignItems: 'center', backgroundColor: DS.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: DS.border },
  calNum: { fontSize: 22 },
  calUnit: { fontSize: 10, color: DS.textMuted, marginTop: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: DS.textPrimary, marginBottom: 14 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  macroLeft: { flex: 1 },
  macroName: { fontWeight: '500', fontSize: 14, color: DS.textPrimary },
  macroSub: { marginTop: 2, fontSize: 11, color: DS.textMuted },
  macroGrams: { fontSize: 16 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  barLabel: { fontSize: 11, color: DS.textMuted, width: 44 },
  barPct: { fontSize: 11, color: DS.textSecond, width: 32, textAlign: 'right' },
  factRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 },
  factBorder: { borderBottomWidth: 1, borderBottomColor: DS.border },
  factLabel: { fontSize: 14, color: DS.textSecond },
  factVal: { fontSize: 14, color: DS.textPrimary },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  editBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 13, borderRadius: 12, backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border },
  deleteBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 13, borderRadius: 12, backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border },
  editBtnText: { fontSize: 14, fontWeight: '500', color: DS.textPrimary },
});
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
