import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const QUICK_FOODS = [
  { name: 'Chicken Breast', cal: 165, p: 31, c: 0, f: 4 },
  { name: 'Brown Rice (100g)', cal: 112, p: 3, c: 24, f: 1 },
  { name: 'Greek Yogurt', cal: 100, p: 17, c: 6, f: 0 },
  { name: 'Banana', cal: 89, p: 1, c: 23, f: 0 },
  { name: 'Eggs (2)', cal: 155, p: 13, c: 1, f: 11 },
  { name: 'Oats (50g)', cal: 189, p: 7, c: 32, f: 4 },
];

export default function AddFoodScreen() {
  const insets = useSafeAreaInsets();
  const [selectedMeal, setSelectedMeal] = useState('Lunch');
  const [searchText, setSearchText] = useState('');
  const [selectedFood, setSelectedFood] = useState<typeof QUICK_FOODS[0] | null>(null);
  const [quantity, setQuantity] = useState('1');

  const filtered = QUICK_FOODS.filter(f =>
    f.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 },
        ]}>

        <ScreenHeader title="Add Food" subtitle="Log what you ate" />

        {/* Meal Type */}
        <View style={styles.mealRow}>
          {MEAL_TYPES.map(m => (
            <Pressable
              key={m}
              onPress={() => setSelectedMeal(m)}
              style={[styles.mealChip, selectedMeal === m && styles.mealChipActive]}>
              <ThemedText style={[styles.mealChipText, selectedMeal === m && styles.mealChipTextActive]}>
                {m}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Search */}
        <Card compact>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={17} color={DS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search food or barcode..."
              placeholderTextColor={DS.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={17} color={DS.textMuted} />
              </Pressable>
            )}
          </View>
        </Card>

        {/* Quick Select */}
        <ThemedText style={styles.sectionLabel}>Quick Select</ThemedText>
        {filtered.map(food => (
          <Pressable
            key={food.name}
            onPress={() => setSelectedFood(food)}
            style={[styles.foodRow, selectedFood?.name === food.name && styles.foodRowSelected]}>
            <View style={styles.foodLeft}>
              <View style={styles.foodIcon}>
                <Ionicons name="restaurant-outline" size={15} color={DS.textSecond} />
              </View>
              <View>
                <ThemedText style={styles.foodName}>{food.name}</ThemedText>
                <ThemedText style={styles.foodMacros}>
                  P {food.p}g · C {food.c}g · F {food.f}g
                </ThemedText>
              </View>
            </View>
            <View style={styles.foodRight}>
              <MonoText style={styles.foodCal}>{food.cal}</MonoText>
              <ThemedText style={styles.foodCalLabel}>kcal</ThemedText>
            </View>
          </Pressable>
        ))}

        {/* Selected Food Detail */}
        {selectedFood && (
          <Card style={{ marginTop: 16 }}>
            <ThemedText style={styles.sectionLabel}>Selected · {selectedFood.name}</ThemedText>

            <View style={styles.macroGrid}>
              {[
                { label: 'Calories', val: String(selectedFood.cal), unit: 'kcal' },
                { label: 'Protein', val: String(selectedFood.p), unit: 'g' },
                { label: 'Carbs', val: String(selectedFood.c), unit: 'g' },
                { label: 'Fats', val: String(selectedFood.f), unit: 'g' },
              ].map(m => (
                <View key={m.label} style={styles.macroBox}>
                  <MonoText bold style={styles.macroVal}>{m.val}</MonoText>
                  <ThemedText style={styles.macroUnit}>{m.unit}</ThemedText>
                  <ThemedText style={styles.macroLabel}>{m.label}</ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.qtyRow}>
              <ThemedText style={styles.qtyLabel}>Quantity / Servings</ThemedText>
              <View style={styles.qtyStepper}>
                <Pressable
                  onPress={() => setQuantity(q => String(Math.max(1, Number(q) - 1)))}
                  style={styles.stepBtn}>
                  <Ionicons name="remove" size={16} color={DS.textPrimary} />
                </Pressable>
                <MonoText bold style={styles.qtyVal}>{quantity}</MonoText>
                <Pressable
                  onPress={() => setQuantity(q => String(Number(q) + 1))}
                  style={styles.stepBtn}>
                  <Ionicons name="add" size={16} color={DS.textPrimary} />
                </Pressable>
              </View>
            </View>
          </Card>
        )}

        {/* Log Button */}
        <Pressable
          style={({ pressed }) => [styles.logBtn, !selectedFood && styles.logBtnDisabled, pressed && { opacity: 0.8 }]}
          disabled={!selectedFood}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          <ThemedText style={styles.logBtnText}>
            {selectedFood ? `Log ${selectedFood.name}` : 'Select a food to log'}
          </ThemedText>
        </Pressable>

        {/* Manual Entry */}
        <Pressable style={styles.manualBtn}>
          <Ionicons name="create-outline" size={15} color={DS.textSecond} />
          <ThemedText style={styles.manualBtnText}>Enter manually</ThemedText>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },

  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  mealChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border,
  },
  mealChipActive: { backgroundColor: DS.accent, borderColor: DS.accent },
  mealChipText: { fontSize: 13, fontWeight: '500', color: DS.textSecond },
  mealChipTextActive: { color: '#fff', fontWeight: '600' },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: {
    flex: 1, fontSize: 14, color: DS.textPrimary,
    paddingVertical: 4,
  },

  sectionLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '500', marginBottom: 10, marginTop: 4 },

  foodRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, marginBottom: 8,
    backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border,
  },
  foodRowSelected: { borderColor: DS.accent, backgroundColor: DS.accentDim },
  foodLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  foodIcon: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: DS.raised, borderWidth: 1, borderColor: DS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  foodName: { fontWeight: '500', fontSize: 14, color: DS.textPrimary },
  foodMacros: { marginTop: 2, fontSize: 11, color: DS.textMuted },
  foodRight: { alignItems: 'flex-end' },
  foodCal: { fontSize: 18, color: DS.textPrimary },
  foodCalLabel: { fontSize: 10, color: DS.textMuted, marginTop: 1 },

  macroGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  macroBox: {
    flex: 1, backgroundColor: DS.card, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: DS.border, alignItems: 'center', gap: 2,
  },
  macroVal: { fontSize: 20 },
  macroUnit: { fontSize: 10, color: DS.textMuted },
  macroLabel: { fontSize: 11, color: DS.textSecond },

  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyLabel: { fontSize: 13, color: DS.textSecond },
  qtyStepper: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: DS.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: DS.border,
  },
  stepBtn: { padding: 2 },
  qtyVal: { fontSize: 18, minWidth: 24, textAlign: 'center' },

  logBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: DS.accent, paddingVertical: 15, borderRadius: 14, marginTop: 20,
  },
  logBtnDisabled: { backgroundColor: DS.raised },
  logBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  manualBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7,
    paddingVertical: 14, marginTop: 10,
  },
  manualBtnText: { fontSize: 13, color: DS.textSecond },
});
