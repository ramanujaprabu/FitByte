import { BackButton } from '@/components/shared/BackButton';
import { Badge } from '@/components/shared/Badge';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { nutritionService } from '@/services/api/nutrition';
import type { FoodEntry } from '@/types';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTERS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const DAYS_TO_SHOW = 7;

function dayLabel(daysAgo: number, date: Date): string {
  if (daysAgo === 0) return `Today, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
  if (daysAgo === 1) return `Yesterday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function MealHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [groups, setGroups] = useState<{ date: string; entries: FoodEntry[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const days = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    });

    Promise.all(days.map(d => nutritionService.getFoodLog(d.toISOString())))
      .then(results => {
        const built = results
          .map((entries, i) => ({ date: dayLabel(i, days[i]), entries }))
          .filter(g => g.entries.length > 0);
        setGroups(built);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Meal History" subtitle="All logged meals" />

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map(f => (
            <Pressable key={f} onPress={() => setActiveFilter(f)}
              style={[styles.filterChip, activeFilter === f && styles.filterActive]}>
              <ThemedText style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {loading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={DS.accent} />
          </View>
        )}

        {!loading && groups.length === 0 && (
          <ThemedText style={{ color: DS.textSecond, textAlign: 'center', marginTop: 20 }}>
            No meals logged in the last {DAYS_TO_SHOW} days.
          </ThemedText>
        )}

        {groups.map(group => {
          const filtered = activeFilter === 'All'
            ? group.entries
            : group.entries.filter(e => e.meal === activeFilter);
          if (filtered.length === 0) return null;

          const totalCal = filtered.reduce((s, e) => s + e.calories, 0);

          return (
            <View key={group.date}>
              <View style={styles.groupHeader}>
                <ThemedText style={styles.groupDate}>{group.date}</ThemedText>
                <View style={styles.groupCalBadge}>
                  <MonoText style={styles.groupCal}>{totalCal}</MonoText>
                  <ThemedText style={styles.groupCalUnit}> kcal</ThemedText>
                </View>
              </View>

              <Card compact>
                {filtered.map((food, idx) => (
                  <Pressable
                    key={food.id}
                    onPress={() => router.push({ pathname: '/screens/food-detail', params: { id: food.id } })}
                    style={[styles.foodRow, idx < filtered.length - 1 && styles.foodDivider]}>
                    <Image source={food.imageUrl} style={styles.foodImg} contentFit="cover" />
                    <View style={styles.foodInfo}>
                      <ThemedText style={styles.foodName}>{food.name}</ThemedText>
                      <ThemedText style={styles.foodMacros}>
                        P {food.protein}g · C {food.carbs}g · F {food.fats}g
                      </ThemedText>
                      <Badge label={food.meal} style={{ marginTop: 5 }} />
                    </View>
                    <View style={styles.foodRight}>
                      <MonoText bold style={styles.foodCal}>{food.calories}</MonoText>
                      <ThemedText style={styles.foodCalLabel}>kcal</ThemedText>
                      <ThemedText style={styles.foodTime}>{food.time}</ThemedText>
                    </View>
                  </Pressable>
                ))}
              </Card>
            </View>
          );
        })}

      </ScrollView>
    </View>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    scroll: { paddingHorizontal: 20 },
    filters: { gap: 8, paddingBottom: 16 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: DS.raised },
    filterActive: { backgroundColor: DS.accent },
    filterText: { fontSize: 13, fontWeight: '500', color: DS.textSecond },
    filterTextActive: { color: DS.accentText, fontWeight: '600' },
    groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    groupDate: { fontSize: 13, fontWeight: '600', color: DS.textSecond },
    groupCalBadge: { flexDirection: 'row', alignItems: 'baseline' },
    groupCal: { fontSize: 14 },
    groupCalUnit: { fontSize: 11, color: DS.textMuted },
    foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    foodDivider: { borderBottomWidth: 1, borderBottomColor: DS.border },
    foodImg: { width: 52, height: 52, borderRadius: 10, marginRight: 12, backgroundColor: DS.raised },
    foodInfo: { flex: 1 },
    foodName: { fontWeight: '600', fontSize: 14, color: DS.textPrimary },
    foodMacros: { marginTop: 3, fontSize: 11, color: DS.textMuted },
    foodRight: { alignItems: 'flex-end', gap: 2 },
    foodCal: { fontSize: 17 },
    foodCalLabel: { fontSize: 10, color: DS.textMuted },
    foodTime: { fontSize: 10, color: DS.textMuted },
  });
}
