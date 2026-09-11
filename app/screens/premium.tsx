import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$9.99',
    period: '/month',
    badge: null,
    highlight: false,
  },
  {
    id: 'annual',
    label: 'Annual',
    price: '$59.99',
    period: '/year',
    badge: 'Best Value · Save 50%',
    highlight: true,
  },
  {
    id: 'lifetime',
    label: 'Lifetime',
    price: '$149',
    period: 'one-time',
    badge: null,
    highlight: false,
  },
];

const FEATURES = [
  { icon: 'sparkles-outline', text: 'AI Nutrition Coach', detail: 'Daily personalized insights' },
  { icon: 'analytics-outline', text: 'Advanced Analytics', detail: 'Trends, patterns, projections' },
  { icon: 'scan-outline', text: 'Unlimited Meal Scans', detail: 'Instant AI food recognition' },
  { icon: 'barbell-outline', text: 'AI Routine Builder', detail: 'Custom workout generation' },
  { icon: 'trophy-outline', text: 'Premium Challenges', detail: 'Compete with the community' },
  { icon: 'cloud-download-outline', text: 'Priority Data Export', detail: 'PDF, CSV, JSON formats' },
  { icon: 'shield-checkmark-outline', text: 'Ad-Free Experience', detail: 'Clean, distraction-free app' },
];

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="diamond-outline" size={32} color={DS.textPrimary} />
          </View>
          <ThemedText style={styles.heroTitle}>FitByte Premium</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Unlock the full power of AI-driven nutrition and fitness coaching
          </ThemedText>
        </View>

        {/* Plans */}
        <View style={styles.plans}>
          {PLANS.map(plan => (
            <Pressable key={plan.id} onPress={() => setSelectedPlan(plan.id)}
              style={[styles.planCard, plan.highlight && styles.planHighlight, selectedPlan === plan.id && styles.planSelected]}>
              {plan.badge && (
                <View style={styles.planBadge}>
                  <ThemedText style={styles.planBadgeText}>{plan.badge}</ThemedText>
                </View>
              )}
              <ThemedText style={styles.planLabel}>{plan.label}</ThemedText>
              <MonoText bold style={styles.planPrice}>{plan.price}</MonoText>
              <ThemedText style={styles.planPeriod}>{plan.period}</ThemedText>
              {selectedPlan === plan.id && (
                <View style={styles.planCheck}>
                  <Ionicons name="checkmark-circle" size={18} color={DS.accent} />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Features */}
        <Card>
          <ThemedText style={styles.sectionTitle}>Everything Included</ThemedText>
          {FEATURES.map(f => (
            <View key={f.text} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as any} size={16} color={DS.textSecond} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.featureText}>{f.text}</ThemedText>
                <ThemedText style={styles.featureDetail}>{f.detail}</ThemedText>
              </View>
              <Ionicons name="checkmark" size={16} color={DS.accent} />
            </View>
          ))}
        </Card>

        {/* CTA */}
        <Pressable onPress={() => setSubscribed(true)}
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name="diamond-outline" size={18} color="#fff" />
          <ThemedText style={styles.ctaBtnText}>
            {subscribed ? '✓ Subscribed!' : `Get ${PLANS.find(p => p.id === selectedPlan)?.label} Plan`}
          </ThemedText>
        </Pressable>

        <ThemedText style={styles.legalText}>
          Cancel anytime. Billed automatically. By subscribing you agree to our Terms of Service.
        </ThemedText>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },
  hero: { alignItems: 'center', marginBottom: 28 },
  heroIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: DS.textPrimary, letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 14, color: DS.textSecond, textAlign: 'center', lineHeight: 22, marginTop: 8 },
  plans: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  planCard: { flex: 1, backgroundColor: DS.surface, borderRadius: 14, borderWidth: 1, borderColor: DS.border, padding: 14, alignItems: 'center', gap: 3 },
  planHighlight: { borderColor: DS.borderMid, backgroundColor: DS.raised },
  planSelected: { borderColor: DS.accent, borderWidth: 2 },
  planBadge: { backgroundColor: DS.accent, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, marginBottom: 4 },
  planBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  planLabel: { fontSize: 12, color: DS.textSecond, fontWeight: '500' },
  planPrice: { fontSize: 20, marginTop: 2 },
  planPeriod: { fontSize: 10, color: DS.textMuted },
  planCheck: { marginTop: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: DS.textPrimary, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: DS.border },
  featureIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  featureText: { fontSize: 14, fontWeight: '500', color: DS.textPrimary },
  featureDetail: { fontSize: 11, color: DS.textMuted, marginTop: 1 },
  ctaBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: DS.accent, paddingVertical: 16, borderRadius: 14, marginBottom: 12 },
  ctaBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  legalText: { fontSize: 11, color: DS.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 16 },
});
