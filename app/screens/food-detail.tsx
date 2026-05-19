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
