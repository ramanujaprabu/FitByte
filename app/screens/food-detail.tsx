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
