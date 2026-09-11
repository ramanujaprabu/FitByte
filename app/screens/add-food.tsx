import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

import { foodService, type FoodSearchResult } from '@/services/api/food';
import { nutritionService } from '@/services/api/nutrition';
import type { MealType } from '@/types';

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export default function AddFoodScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedMeal, setSelectedMeal] = useState<MealType>('Lunch');
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [logging, setLogging] = useState(false);

  // Debounced live search against USDA + Open Food Facts.
  useEffect(() => {
    if (searchText.trim().length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }
    setSearching(true);
    const handle = setTimeout(() => {
      foodService
        .search(searchText.trim())
        .then(r => {
          setResults(r.slice(0, 20));
          setSearchError(null);
        })
        .catch(e => setSearchError(e?.message ?? 'Search failed'))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(handle);
  }, [searchText]);

  const qty = Number(quantity) || 1;

  const onLog = async () => {
    if (!selectedFood) return;
    setLogging(true);
    try {
      await nutritionService.logFood({
        name: selectedFood.name,
        meal: selectedMeal,
        calories: Math.round(selectedFood.calories * qty),
        protein: Math.round(selectedFood.protein * qty),
        carbs: Math.round(selectedFood.carbs * qty),
        fats: Math.round(selectedFood.fats * qty),
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        imageUrl: selectedFood.imageUrl ?? '',
      });
      router.back();
    } catch (e: any) {
      setSearchError(e?.message ?? 'Could not log food.');
    } finally {
      setLogging(false);
    }
  };

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
              placeholder="Search food (USDA + Open Food Facts)..."
              placeholderTextColor={DS.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searching && <ActivityIndicator size="small" color={DS.textMuted} />}
            {!searching && searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={17} color={DS.textMuted} />
              </Pressable>
            )}
          </View>
        </Card>

        {searchError && (
          <ThemedText style={{ color: DS.statusBad, fontSize: 12, marginTop: 8 }}>{searchError}</ThemedText>
        )}

        {/* Results */}
        {searchText.trim().length >= 2 && (
          <ThemedText style={styles.sectionLabel}>
            {searching ? 'Searching…' : `${results.length} results`}
          </ThemedText>
        )}
        {results.map(food => (
          <Pressable
            key={food.id}
            onPress={() => setSelectedFood(food)}
            style={[styles.foodRow, selectedFood?.id === food.id && styles.foodRowSelected]}>
            <View style={styles.foodLeft}>
              <View style={styles.foodIcon}>
                <Ionicons name="restaurant-outline" size={15} color={DS.textSecond} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.foodName} numberOfLines={1}>{food.name}</ThemedText>
                <ThemedText style={styles.foodMacros}>
                  P {Math.round(food.protein)}g · C {Math.round(food.carbs)}g · F {Math.round(food.fats)}g
                  {food.servingLabel ? ` · ${food.servingLabel}` : ''}
                </ThemedText>
              </View>
            </View>
            <View style={styles.foodRight}>
              <MonoText style={styles.foodCal}>{Math.round(food.calories)}</MonoText>
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
                { label: 'Calories', val: String(Math.round(selectedFood.calories * qty)), unit: 'kcal' },
                { label: 'Protein', val: String(Math.round(selectedFood.protein * qty)), unit: 'g' },
                { label: 'Carbs', val: String(Math.round(selectedFood.carbs * qty)), unit: 'g' },
                { label: 'Fats', val: String(Math.round(selectedFood.fats * qty)), unit: 'g' },
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
          disabled={!selectedFood || logging}
          onPress={onLog}>
          {logging ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <ThemedText style={styles.logBtnText}>
                {selectedFood ? `Log ${selectedFood.name}` : 'Select a food to log'}
              </ThemedText>
            </>
          )}
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
