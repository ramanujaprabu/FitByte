/**
 * meal-detail.tsx — the deliberate place to remove a logged food.
 *
 * Reached only via the pencil icon on a meal section (Home), never via a
 * delete control sitting directly on the main screen — so a stray tap
 * during normal browsing can't delete anything by accident.
 */
import { BackButton } from '@/components/shared/BackButton';
import { MonoText } from '@/components/shared/MonoText';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing } from '@/constants/theme';
import { nutritionService } from '@/services/api/nutrition';
import type { FoodEntry, MealType } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MealDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { meal, date } = useLocalSearchParams<{ meal: MealType; date?: string }>();

  const [items, setItems] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dateObj = date ? new Date(date) : new Date();

  const load = useCallback(() => {
    setLoading(true);
    nutritionService.getFoodLog(date)
      .then((entries) => setItems(entries.filter((e) => e.meal === meal)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [date, meal]);

  useFocusEffect(load);

  const confirmDelete = (entry: FoodEntry) => {
    Alert.alert('Remove this item?', `Remove "${entry.name}" from ${meal}. This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          setDeletingId(entry.id);
          try {
            await nutritionService.deleteFood(entry.id);
            setItems((prev) => prev.filter((e) => e.id !== entry.id));
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const totalCal = items.reduce((s, e) => s + e.calories, 0);

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ThemedText style={styles.pageTitle}>Edit {meal}</ThemedText>
        <ThemedText style={styles.pageSubtitle}>
          {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {Math.round(totalCal)} kcal
        </ThemedText>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={DS.accent} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="restaurant-outline" size={24} color={DS.textMuted} />
            <ThemedText style={styles.emptyText}>Nothing logged for {meal} yet.</ThemedText>
          </View>
        ) : (
          items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.itemRow}
              onPress={() => router.push({ pathname: '/screens/food-detail', params: { id: item.id } })}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.itemName} numberOfLines={1}>{item.name}</ThemedText>
                <ThemedText style={styles.itemSub}>
                  P {Math.round(item.protein)}g · C {Math.round(item.carbs)}g · F {Math.round(item.fats)}g · {item.time}
                </ThemedText>
              </View>
              <MonoText style={styles.itemCal}>{Math.round(item.calories)}</MonoText>
              <Pressable
                style={styles.deleteBtn}
                onPress={() => confirmDelete(item)}
                disabled={deletingId === item.id}
                hitSlop={8}>
                {deletingId === item.id ? (
                  <ActivityIndicator size="small" color={DS.statusBad} />
                ) : (
                  <Ionicons name="trash-outline" size={17} color={DS.statusBad} />
                )}
              </Pressable>
            </Pressable>
          ))
        )}

      </ScrollView>
    </View>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    scroll: { paddingHorizontal: 20 },
    pageTitle: { fontSize: 24, fontWeight: '700', color: DS.textPrimary, letterSpacing: -0.5 },
    pageSubtitle: { fontSize: 13, color: DS.textSecond, marginTop: 4, marginBottom: Spacing.lg },
    emptyCard: {
      backgroundColor: DS.surface, borderRadius: Radius.lg, paddingVertical: Spacing.xl,
      alignItems: 'center', gap: 8,
    },
    emptyText: { fontSize: 13, color: DS.textMuted },
    itemRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      backgroundColor: DS.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 8,
    },
    itemName: { fontSize: 15, fontWeight: '600', color: DS.textPrimary },
    itemSub: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
    itemCal: { fontSize: 14, color: DS.textSecond },
    deleteBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  });
}
