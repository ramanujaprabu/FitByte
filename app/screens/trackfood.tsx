import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { DS, Radius, Spacing } from '@/constants/theme';
import { foodService } from '@/services/api/food';
import { nutritionService } from '@/services/api/nutrition';
import { triggerHaptic } from '@/utils/haptics';

import type { FoodSearchResult } from '@/services/api/food';
import type { FoodEntry, MealType } from '@/types';

const MEAL_OPTIONS: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const SERVING_OPTIONS = ['serving', '100g', 'cup', 'piece', 'tbsp', 'oz'];

interface FrequentFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  count: number;
}

/** Sensible default when this screen is opened without a specific meal in mind. */
function defaultMealByTime(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return 'Breakfast';
  if (hour < 16) return 'Lunch';
  if (hour < 21) return 'Dinner';
  return 'Snacks';
}

function macroSubtitle(protein: number, carbs: number, fats: number): string {
  return `P ${Math.round(protein)}g · C ${Math.round(carbs)}g · F ${Math.round(fats)}g`;
}

/** One tappable row: name + subtitle on the left, calories + an outlined add circle on the right. */
function FoodRow({ name, subtitle, calories, onPress }: { name: string; subtitle: string; calories: number; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.foodRow, pressed && styles.foodRowPressed]} onPress={onPress}>
      <View style={{ flex: 1, marginRight: Spacing.sm }}>
        <ThemedText style={styles.foodName} numberOfLines={1}>{name}</ThemedText>
        <ThemedText style={styles.foodSub} numberOfLines={1}>{subtitle}</ThemedText>
      </View>
      <ThemedText style={styles.foodCal}>{Math.round(calories)} Cal</ThemedText>
      <View style={styles.addCircleBtn}>
        <Ionicons name="add" size={17} color="#000000" />
      </View>
    </Pressable>
  );
}

export default function FoodTrackerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ meal?: string }>();
  const selectedMeal: MealType = MEAL_OPTIONS.includes(params.meal as MealType)
    ? (params.meal as MealType)
    : defaultMealByTime();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodEntry[]>([]);
  const [frequentFoods, setFrequentFoods] = useState<FrequentFood[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [servingQty, setServingQty] = useState('1');
  const [selectedServing, setSelectedServing] = useState('serving');

  // Load recent + frequent foods from the real database
  useEffect(() => {
    nutritionService.getRecentUniqueFoods(5).then(setRecentFoods).catch(() => {});
    nutritionService.getFrequentFoods(8).then(setFrequentFoods).catch(() => {});
  }, []);

  // Debounced search against USDA & Open Food Facts
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = setTimeout(() => {
      foodService.search(searchQuery.trim())
        .then(results => setSearchResults(results.slice(0, 15)))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const handleQuickAddFood = async (foodName: string, cal: number, p: number, c: number, f: number, img?: string) => {
    triggerHaptic('success');
    await nutritionService.logFood({
      name: foodName,
      meal: selectedMeal,
      calories: Math.round(cal),
      protein: Math.round(p),
      carbs: Math.round(c),
      fats: Math.round(f),
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      imageUrl: img ?? '',
    });
    router.back();
  };

  const openQuantityModal = (food: FoodSearchResult) => {
    triggerHaptic('light');
    setSelectedFood(food);
    setServingQty('1');
    setSelectedServing('serving');
    setQuantityModalVisible(true);
  };

  const toSearchResult = (
    name: string, calories: number, protein: number, carbs: number, fats: number, id?: string, imageUrl?: string
  ): FoodSearchResult => ({
    id: id ?? `local:${name}`,
    name,
    calories,
    protein,
    carbs,
    fats,
    servingLabel: 'serving',
    imageUrl,
    source: 'local' as any,
    sourceId: id ?? name,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#000000" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>

        <ThemedText style={styles.pageTitle}>Track {selectedMeal}</ThemedText>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={19} color={DS.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by food name/dish"
            placeholderTextColor={DS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color={DS.textMuted} />
            </Pressable>
          ) : (
            <Pressable onPress={() => router.push('/screens/scan' as any)} style={{ padding: 4 }}>
              <Ionicons name="barcode-outline" size={20} color="#000000" />
            </Pressable>
          )}
        </View>

        {searchQuery.trim().length > 0 ? (
          /* Search Results Mode */
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Search Results</ThemedText>
            {searching ? (
              <ThemedText style={styles.helperText}>Searching Open Food Facts & USDA…</ThemedText>
            ) : searchResults.length === 0 ? (
              <ThemedText style={styles.helperText}>No items found matching &quot;{searchQuery}&quot;</ThemedText>
            ) : (
              searchResults.map(item => (
                <FoodRow
                  key={item.id}
                  name={item.name}
                  subtitle={[item.brand, item.servingLabel].filter(Boolean).join(' · ') || '100 g'}
                  calories={item.calories}
                  onPress={() => openQuantityModal(item)}
                />
              ))
            )}
          </View>
        ) : (
          <>
            {/* Recently Logged */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText style={styles.sectionLabel}>Recently Logged</ThemedText>
                <Pressable onPress={() => router.push('/screens/meal-history' as any)}>
                  <ThemedText style={styles.viewAllLink}>View all</ThemedText>
                </Pressable>
              </View>
              {recentFoods.length > 0 ? (
                recentFoods.map(item => (
                  <FoodRow
                    key={item.id}
                    name={item.name}
                    subtitle={macroSubtitle(item.protein, item.carbs, item.fats)}
                    calories={item.calories}
                    onPress={() => openQuantityModal(
                      toSearchResult(item.name, item.calories, item.protein, item.carbs, item.fats, item.id, item.imageUrl)
                    )}
                  />
                ))
              ) : (
                <ThemedText style={styles.helperText}>Nothing logged yet — search above to get started.</ThemedText>
              )}
            </View>

            {/* Frequently Tracked Foods — from this user's own history, nothing seeded */}
            {frequentFoods.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionLabel}>Frequently Tracked Foods</ThemedText>
                {frequentFoods.map((item, idx) => (
                  <FoodRow
                    key={`${item.name}-${idx}`}
                    name={item.name}
                    subtitle={macroSubtitle(item.protein, item.carbs, item.fats)}
                    calories={item.calories}
                    onPress={() => openQuantityModal(
                      toSearchResult(item.name, item.calories, item.protein, item.carbs, item.fats)
                    )}
                  />
                ))}
              </View>
            )}
          </>
        )}

      </ScrollView>

      {/* Quantity Modal */}
      <Modal visible={quantityModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetTopRow}>
              <ThemedText style={styles.sectionLabel}>Adjust Quantity</ThemedText>
              <Pressable onPress={() => setQuantityModalVisible(false)}>
                <Ionicons name="close" size={22} color="#000000" />
              </Pressable>
            </View>

            <ThemedText style={[styles.foodName, { marginBottom: Spacing.sm }]}>
              {selectedFood?.name}
            </ThemedText>

            <View style={styles.quantityRow}>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => {
                  const qty = parseFloat(servingQty) || 1;
                  if (qty > 1) setServingQty((qty - 1).toString());
                }}>
                <Ionicons name="remove" size={20} color="#000000" />
              </Pressable>

              <TextInput
                style={styles.qtyInput}
                keyboardType="numeric"
                value={servingQty}
                onChangeText={setServingQty}
                textAlign="center"
              />

              <Pressable
                style={styles.qtyBtn}
                onPress={() => {
                  const qty = parseFloat(servingQty) || 0;
                  setServingQty((qty + 1).toString());
                }}>
                <Ionicons name="add" size={20} color="#000000" />
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: Spacing.md }}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                {SERVING_OPTIONS.map(opt => (
                  <Pressable
                    key={opt}
                    style={[styles.servingChip, selectedServing === opt && styles.servingChipActive]}
                    onPress={() => setSelectedServing(opt)}>
                    <ThemedText style={[styles.servingChipText, selectedServing === opt && styles.servingChipTextActive]}>
                      {opt}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.nutritionPreviewRow}>
              <View style={styles.nutritonPreviewItem}>
                <ThemedText style={styles.nutVal}>{Math.round((selectedFood?.calories || 0) * (parseFloat(servingQty) || 1))}</ThemedText>
                <ThemedText style={styles.nutLbl}>Kcal</ThemedText>
              </View>
              <View style={styles.nutritonPreviewItem}>
                <ThemedText style={styles.nutVal}>{Math.round((selectedFood?.protein || 0) * (parseFloat(servingQty) || 1))}g</ThemedText>
                <ThemedText style={styles.nutLbl}>Protein</ThemedText>
              </View>
              <View style={styles.nutritonPreviewItem}>
                <ThemedText style={styles.nutVal}>{Math.round((selectedFood?.carbs || 0) * (parseFloat(servingQty) || 1))}g</ThemedText>
                <ThemedText style={styles.nutLbl}>Carbs</ThemedText>
              </View>
              <View style={styles.nutritonPreviewItem}>
                <ThemedText style={styles.nutVal}>{Math.round((selectedFood?.fats || 0) * (parseFloat(servingQty) || 1))}g</ThemedText>
                <ThemedText style={styles.nutLbl}>Fats</ThemedText>
              </View>
            </View>

            <Pressable
              style={styles.logFoodBtn}
              onPress={() => {
                if (selectedFood) {
                  const scale = parseFloat(servingQty) || 1;
                  handleQuickAddFood(
                    selectedFood.name,
                    selectedFood.calories * scale,
                    selectedFood.protein * scale,
                    selectedFood.carbs * scale,
                    selectedFood.fats * scale,
                    selectedFood.imageUrl
                  );
                  setQuantityModalVisible(false);
                }
              }}>
              <ThemedText style={styles.logFoodBtnText}>Log to {selectedMeal}</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    height: 48,
  },
  iconBtn: {
    padding: 8,
  },
  scroll: {
    paddingHorizontal: Spacing.md + 4,
    paddingTop: Spacing.sm,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md + 2,
    height: 52,
    marginBottom: Spacing.xl,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm + 2,
  },
  sectionLabel: {
    fontSize: 14,
    color: DS.textSecond,
    marginBottom: Spacing.sm + 2,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  helperText: {
    fontSize: 13,
    color: DS.textMuted,
    paddingVertical: Spacing.sm,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 6,
  },
  foodRowPressed: {
    opacity: 0.55,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  foodSub: {
    fontSize: 13,
    color: DS.textMuted,
    marginTop: 2,
  },
  foodCal: {
    fontSize: 15,
    color: DS.textSecond,
    marginRight: Spacing.sm,
  },
  addCircleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
  },
  sheetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.md,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    width: 80,
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  servingChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  servingChipActive: {
    backgroundColor: '#000000',
  },
  servingChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  servingChipTextActive: {
    color: '#FFFFFF',
  },
  nutritionPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  nutritonPreviewItem: {
    alignItems: 'center',
  },
  nutVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  nutLbl: {
    fontSize: 12,
    color: DS.textSecond,
    marginTop: 4,
  },
  logFoodBtn: {
    backgroundColor: '#000000',
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logFoodBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
