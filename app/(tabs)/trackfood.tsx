import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable, ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/shared/Badge';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';

import { MOCK_DAILY_NUTRITION, MOCK_FOOD_LOG } from '@/data/nutrition';
import { calcProgress, formatDate, getGreeting } from '@/utils/format';

const MACROS = [
  { name: 'Protein', consumed: 92, target: 150, icon: 'barbell-outline' },
  { name: 'Carbs', consumed: 148, target: 200, icon: 'leaf-outline' },
  { name: 'Fats', consumed: 48, target: 70, icon: 'water-outline' },
];

const MEAL_CHIPS = [
  { icon: 'sunny-outline', label: 'Breakfast' },
  { icon: 'restaurant-outline', label: 'Lunch' },
  { icon: 'moon-outline', label: 'Dinner' },
  { icon: 'cafe-outline', label: 'Snacks' },
];

const HEALTH_CARDS = [
  { icon: 'barbell-outline', title: 'Weight', value: '72.4 kg', sub: '↓ 0.3 kg' },
  { icon: 'flame-outline', title: 'Burned', value: '1,850', sub: '45 active min' },
  { icon: 'moon-outline', title: 'Sleep', value: '7h 32m', sub: '85% quality' },
];

export default function FoodTrackerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const nutrition = MOCK_DAILY_NUTRITION;
  const pct = calcProgress(nutrition.caloriesConsumed, nutrition.calorieGoal);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: DS.bg }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
      ]}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>{getGreeting()}</ThemedText>
          <ThemedText style={styles.date}>{formatDate()}</ThemedText>
          <ThemedText type="title" style={styles.mainTitle}>Food Tracker</ThemedText>
          <ThemedText style={styles.subtitle}>Stay on track with your nutrition goals</ThemedText>
        </View>
        <Pressable style={styles.notifBtn} onPress={() => router.push('/screens/notifications')}>
          <Ionicons name="notifications-outline" size={19} color={DS.textSecond} />
        </Pressable>
      </View>

      {/* HERO CARD */}
      <Card>
        <View style={styles.heroTop}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <MonoText bold style={styles.calorieNum}>
                {nutrition.caloriesConsumed.toLocaleString()}
              </MonoText>
              <ThemedText style={styles.calorieLabel}>kcal consumed</ThemedText>
              <MonoText bold style={styles.caloriePercent}>
                {Math.round(pct * 100)}%
              </MonoText>
            </View>
          </View>
          <View style={styles.statsCol}>
            <View style={styles.statBlock}>
              <ThemedText style={styles.statLabel}>Goal</ThemedText>
              <MonoText bold style={styles.statValue}>{nutrition.calorieGoal.toLocaleString()}</MonoText>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBlock}>
              <ThemedText style={styles.statLabel}>Remaining</ThemedText>
              <MonoText bold style={styles.statValue}>
                {(nutrition.calorieGoal - nutrition.caloriesConsumed).toLocaleString()} kcal
              </MonoText>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBlock}>
              <ThemedText style={styles.statLabel}>Water</ThemedText>
              <MonoText bold style={styles.statValue}>
                {nutrition.waterGlasses} / {nutrition.waterGoal}
              </MonoText>
            </View>
          </View>
        </View>

        {/* Quick Add FAB */}
        <Pressable style={styles.addFab} onPress={() => router.push('/screens/add-food')}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>

        {/* Meal chips */}
        <View style={styles.chipRow}>
          {MEAL_CHIPS.map(c => (
            <Pressable key={c.label} style={styles.chip}
              onPress={() => router.push('/screens/meal-history')}>
              <Ionicons name={c.icon as any} size={13} color={DS.textSecond} />
              <ThemedText style={styles.chipText}>{c.label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* MACRO BREAKDOWN */}
      <Card>
        <SectionHeader title="Macro Breakdown"
          rightElement={
            <Pressable onPress={() => router.push('/screens/macro-breakdown')}>
              <ThemedText style={styles.linkText}>View Insights →</ThemedText>
            </Pressable>
          }
        />
        {MACROS.map(macro => {
          const progress = calcProgress(macro.consumed, macro.target);
          return (
            <View key={macro.name} style={styles.macroCard}>
              <View style={styles.macroTop}>
                <View style={styles.macroLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={macro.icon as any} size={15} color={DS.textSecond} />
                  </View>
                  <View>
                    <ThemedText style={styles.macroName}>{macro.name}</ThemedText>
                    <ThemedText style={styles.macroSub}>
                      {macro.consumed}g / {macro.target}g
                    </ThemedText>
                  </View>
                </View>
                <MonoText bold style={styles.macroPercent}>{Math.round(progress * 100)}%</MonoText>
              </View>
              <ProgressBar progress={progress} />
              <ThemedText style={styles.macroCal}>
                {macro.consumed * (macro.name === 'Fats' ? 9 : 4)} kcal
              </ThemedText>
            </View>
          );
        })}
      </Card>

      {/* NUTRITION INSIGHTS */}
      <Card>
        <ThemedText type="subtitle" style={{ marginBottom: 14 }}>Nutrition Insights</ThemedText>
        <ThemedText style={styles.insightHead}>Highest Macro: Carbohydrates</ThemedText>
        <ThemedText style={styles.insightBody}>
          Increase protein intake after workouts for better recovery.
        </ThemedText>
        <View style={styles.scoreBadge}>
          <ThemedText style={styles.scoreBadgeText}>Balance Score · </ThemedText>
          <MonoText bold style={styles.scoreBadgeText}>82</MonoText>
        </View>
      </Card>

      {/* HEALTH QUICK CARDS */}
      <View style={styles.healthRow}>
        {HEALTH_CARDS.map(h => (
          <View key={h.title} style={styles.healthCard}>
            <Ionicons name={h.icon as any} size={16} color={DS.textSecond} />
            <ThemedText style={styles.healthTitle}>{h.title}</ThemedText>
            <MonoText bold style={styles.healthValue}>{h.value}</MonoText>
            <ThemedText style={styles.healthSub}>{h.sub}</ThemedText>
          </View>
        ))}
      </View>

      {/* FOOD LOG */}
      <Card>
        <SectionHeader title="Food Log"
          rightElement={
            <Pressable onPress={() => router.push('/screens/meal-history')}>
              <ThemedText style={styles.linkText}>View All →</ThemedText>
            </Pressable>
          }
        />
        {MOCK_FOOD_LOG.map((food, idx) => (
          <Pressable key={food.id}
            onPress={() => router.push({ pathname: '/screens/food-detail', params: { id: food.id } })}>
            <View style={[styles.foodRow, idx < MOCK_FOOD_LOG.length - 1 && styles.foodDivider]}>
              <Image source={food.imageUrl} style={styles.foodImg} contentFit="cover" />
              <View style={styles.foodInfo}>
                <ThemedText style={styles.foodName}>{food.name}</ThemedText>
                <ThemedText style={styles.foodMacros}>
                  {food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fats}g
                </ThemedText>
                <Badge label={food.meal} />
              </View>
              <ThemedText style={styles.foodTime}>{food.time}</ThemedText>
            </View>
          </Pressable>
        ))}
      </Card>

      {/* ADD BUTTON */}
      <Pressable style={styles.addBtn} onPress={() => router.push('/screens/add-food')}>
        <Ionicons name="add-circle-outline" size={18} color="#fff" />
        <ThemedText style={styles.addBtnText}>Add Food</ThemedText>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 13, color: DS.textMuted },
  date: { fontSize: 12, color: DS.textMuted, marginTop: 2 },
  mainTitle: { marginTop: 10, color: DS.textPrimary },
  subtitle: { marginTop: 6, fontSize: 14, color: DS.textSecond },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  heroTop: { flexDirection: 'row', gap: 14 },
  ringOuter: { width: 140, height: 140, borderRadius: 70, backgroundColor: DS.card, justifyContent: 'center', alignItems: 'center' },
  ringInner: { width: 116, height: 116, borderRadius: 58, borderWidth: 3, borderColor: DS.accent, justifyContent: 'center', alignItems: 'center' },
  calorieNum: { fontSize: 24 },
  calorieLabel: { marginTop: 2, fontSize: 10, color: DS.textMuted, textAlign: 'center' },
  caloriePercent: { marginTop: 4, fontSize: 15 },
  statsCol: { flex: 1, justifyContent: 'space-around' },
  statBlock: {},
  statLabel: { fontSize: 11, color: DS.textMuted },
  statValue: { marginTop: 3, fontSize: 16 },
  divider: { height: 1, backgroundColor: DS.border },
  addFab: { position: 'absolute', right: 20, top: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: DS.accent, justifyContent: 'center', alignItems: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 18 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: DS.card, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: DS.border },
  chipText: { fontSize: 12, fontWeight: '500', color: DS.textSecond },
  linkText: { fontSize: 13, color: DS.textMuted },
  macroCard: { marginBottom: 16 },
  macroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  macroLeft: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: DS.raised, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  macroName: { fontWeight: '600', fontSize: 14, color: DS.textPrimary },
  macroSub: { marginTop: 2, fontSize: 12, color: DS.textMuted },
  macroPercent: { fontSize: 13 },
  macroCal: { marginTop: 5, fontSize: 11, color: DS.textMuted },
  insightHead: { marginBottom: 8, fontSize: 14, fontWeight: '600', color: DS.textPrimary },
  insightBody: { fontSize: 13, color: DS.textSecond, lineHeight: 20 },
  scoreBadge: { flexDirection: 'row', alignSelf: 'flex-start', marginTop: 12, backgroundColor: DS.raised, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: DS.border },
  scoreBadgeText: { fontSize: 13, color: DS.textPrimary },
  healthRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  healthCard: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border, gap: 4 },
  healthTitle: { marginTop: 7, fontSize: 11, color: DS.textMuted },
  healthValue: { fontSize: 15 },
  healthSub: { fontSize: 11, color: DS.textSecond },
  foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  foodDivider: { borderBottomWidth: 1, borderBottomColor: DS.border },
  foodImg: { width: 54, height: 54, borderRadius: 10, marginRight: 12, backgroundColor: DS.card },
  foodInfo: { flex: 1 },
  foodName: { fontWeight: '600', fontSize: 14, color: DS.textPrimary },
  foodMacros: { marginTop: 3, marginBottom: 6, fontSize: 11, color: DS.textMuted },
  foodTime: { fontSize: 11, color: DS.textMuted },
  addBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: DS.accent, paddingVertical: 15, borderRadius: 14, marginBottom: 16 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});