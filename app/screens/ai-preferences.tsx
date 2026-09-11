import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FOCUS_AREAS = ['Protein Intake', 'Calorie Balance', 'Workout Recovery', 'Sleep Quality', 'Hydration', 'Macro Ratios'];
const FREQUENCIES = ['Real-time', 'Daily Digest', 'Weekly Summary', 'On Demand'];

export default function AIPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const [aiEnabled, setAiEnabled] = useState(true);
  const [personalised, setPersonalised] = useState(true);
  const [frequency, setFrequency] = useState('Daily Digest');
  const [focusAreas, setFocusAreas] = useState(['Protein Intake', 'Calorie Balance']);

  const toggleFocus = (area: string) =>
    setFocusAreas(prev => prev.includes(area) ? prev.filter(x => x !== area) : [...prev, area]);

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="AI Preferences" subtitle="Customize your AI coach" />

        <Card>
          <View style={styles.masterRow}>
            <View style={styles.masterLeft}>
              <View style={styles.aiIcon}>
                <Ionicons name="sparkles-outline" size={20} color={DS.textSecond} />
              </View>
              <View>
                <ThemedText style={styles.masterTitle}>AI Nutrition Coach</ThemedText>
                <ThemedText style={styles.masterSub}>Powered by machine learning</ThemedText>
              </View>
            </View>
            <Switch value={aiEnabled} onValueChange={setAiEnabled}
              thumbColor={aiEnabled ? DS.accent : DS.textMuted}
              trackColor={{ true: 'rgba(59,130,246,0.3)', false: DS.raised }} />
          </View>
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Insight Frequency</ThemedText>
          {FREQUENCIES.map(f => (
            <Pressable key={f} onPress={() => setFrequency(f)} style={styles.radioRow}>
              <View style={[styles.radioOuter, frequency === f && styles.radioActive]}>
                {frequency === f && <View style={styles.radioInner} />}
              </View>
              <ThemedText style={styles.radioText}>{f}</ThemedText>
            </Pressable>
          ))}
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Focus Areas</ThemedText>
          <ThemedText style={styles.hint}>Select areas you want AI to prioritize</ThemedText>
          <View style={styles.chipGrid}>
            {FOCUS_AREAS.map(area => {
              const active = focusAreas.includes(area);
              return (
                <Pressable key={area} onPress={() => toggleFocus(area)}
                  style={[styles.chip, active && styles.chipActive]}>
                  {active && <Ionicons name="checkmark" size={12} color="#fff" />}
                  <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{area}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <View style={styles.toggleRow}>
            <View>
              <ThemedText style={styles.toggleTitle}>Personalized Suggestions</ThemedText>
              <ThemedText style={styles.toggleSub}>Use your history to improve recommendations</ThemedText>
            </View>
            <Switch value={personalised} onValueChange={setPersonalised}
              thumbColor={personalised ? DS.accent : DS.textMuted}
              trackColor={{ true: 'rgba(59,130,246,0.3)', false: DS.raised }} />
          </View>
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },
  masterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  masterLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  aiIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  masterTitle: { fontSize: 15, fontWeight: '600', color: DS.textPrimary },
  masterSub: { fontSize: 12, color: DS.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  hint: { fontSize: 13, color: DS.textSecond, marginBottom: 12, lineHeight: 18 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: DS.accent },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: DS.accent },
  radioText: { fontSize: 14, color: DS.textPrimary },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border },
  chipActive: { backgroundColor: DS.accent, borderColor: DS.accent },
  chipText: { fontSize: 13, fontWeight: '500', color: DS.textSecond },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  toggleTitle: { fontSize: 14, fontWeight: '500', color: DS.textPrimary },
  toggleSub: { fontSize: 12, color: DS.textMuted, marginTop: 2, lineHeight: 18 },
});
