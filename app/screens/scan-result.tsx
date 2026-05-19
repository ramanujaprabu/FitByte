import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Animated, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { MonoText } from '@/components/shared/MonoText';
import { DS } from '@/constants/theme';

const MOCK_RESULT = {
  name: 'Grilled Chicken Bowl',
  confidence: 94,
  calories: 520,
  protein: 42,
  carbs: 48,
  fats: 14,
  imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200',
  ingredients: ['Grilled Chicken Breast', 'Brown Rice', 'Avocado', 'Cherry Tomatoes', 'Mixed Greens'],
};

export default function ScanResultScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const [analyzing, setAnalyzing] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalyzing(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        {/* Image */}
        <Image
          source={imageUri ?? MOCK_RESULT.imageUrl}
          style={styles.resultImage}
          contentFit="cover"
        />

        {analyzing ? (
          <Card style={styles.analyzingCard}>
            <ActivityIndicator size="large" color={DS.accent} />
            <ThemedText style={styles.analyzingTitle}>Analyzing meal…</ThemedText>
            <ThemedText style={styles.analyzingSubtitle}>AI is identifying ingredients and calculating nutrition</ThemedText>
          </Card>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Result Card */}
            <Card>
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.resultName}>{MOCK_RESULT.name}</ThemedText>
                  <View style={styles.confidenceRow}>
                    <Ionicons name="sparkles-outline" size={12} color={DS.textSecond} />
                    <ThemedText style={styles.confidenceText}>{MOCK_RESULT.confidence}% confidence</ThemedText>
                  </View>
                </View>
                <View style={styles.calBadge}>
                  <MonoText bold style={styles.calNum}>{MOCK_RESULT.calories}</MonoText>
                  <ThemedText style={styles.calUnit}>kcal</ThemedText>
                </View>
              </View>

              {/* Macro cards */}
              <View style={styles.macroGrid}>
                {[
                  { label: 'Protein', val: MOCK_RESULT.protein, unit: 'g', pct: MOCK_RESULT.protein / 150 },
                  { label: 'Carbs',   val: MOCK_RESULT.carbs,   unit: 'g', pct: MOCK_RESULT.carbs / 200 },
                  { label: 'Fats',    val: MOCK_RESULT.fats,    unit: 'g', pct: MOCK_RESULT.fats / 70 },
                ].map(m => (
                  <View key={m.label} style={styles.macroBox}>
                    <MonoText bold style={styles.macroVal}>{m.val}</MonoText>
                    <ThemedText style={styles.macroUnit}>{m.unit}</ThemedText>
                    <ThemedText style={styles.macroLabel}>{m.label}</ThemedText>
                    <ProgressBar progress={m.pct} height={3} />
                  </View>
                ))}
              </View>
            </Card>

            {/* Detected Ingredients */}
            <Card>
              <ThemedText style={styles.sectionTitle}>Detected Ingredients</ThemedText>
              {MOCK_RESULT.ingredients.map((ing, i) => (
                <View key={i} style={[styles.ingredRow, i < MOCK_RESULT.ingredients.length - 1 && styles.ingredBorder]}>
                  <View style={styles.ingredDot} />
                  <ThemedText style={styles.ingredText}>{ing}</ThemedText>
                </View>
              ))}
            </Card>

            {/* Actions */}
            <View style={styles.actionRow}>
              <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
                <Ionicons name="refresh-outline" size={16} color={DS.textPrimary} />
                <ThemedText style={styles.secondaryBtnText}>Rescan</ThemedText>
              </Pressable>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => router.push('/screens/add-food')}>
                <Ionicons name="add-circle-outline" size={16} color="#fff" />
                <ThemedText style={styles.primaryBtnText}>Add to Log</ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },

  resultImage: { width: '100%', height: 220, borderRadius: 16, marginBottom: 16 },

  analyzingCard: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  analyzingTitle: { fontSize: 18, fontWeight: '600', color: DS.textPrimary },
  analyzingSubtitle: { fontSize: 13, color: DS.textSecond, textAlign: 'center', lineHeight: 20 },

  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  resultName: { fontSize: 18, fontWeight: '600', color: DS.textPrimary },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  confidenceText: { fontSize: 12, color: DS.textSecond },
  calBadge: { alignItems: 'center', backgroundColor: DS.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: DS.border },
  calNum: { fontSize: 22 },
  calUnit: { fontSize: 10, color: DS.textMuted, marginTop: 1 },

  macroGrid: { flexDirection: 'row', gap: 8 },
  macroBox: { flex: 1, backgroundColor: DS.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: DS.border, gap: 2 },
  macroVal: { fontSize: 20 },
  macroUnit: { fontSize: 10, color: DS.textMuted },
  macroLabel: { fontSize: 11, color: DS.textSecond, marginBottom: 6 },

  sectionTitle: { fontSize: 15, fontWeight: '600', color: DS.textPrimary, marginBottom: 12 },
  ingredRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  ingredBorder: { borderBottomWidth: 1, borderBottomColor: DS.border },
  ingredDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: DS.textSecond },
  ingredText: { fontSize: 14, color: DS.textPrimary },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  secondaryBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 14, borderRadius: 12, backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border },
  secondaryBtnText: { fontSize: 14, fontWeight: '500', color: DS.textPrimary },
  primaryBtn: { flex: 1.4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 14, borderRadius: 12, backgroundColor: DS.accent },
  primaryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
