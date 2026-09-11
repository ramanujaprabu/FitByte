import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NOTIF_GROUPS = [
  {
    label: 'Nutrition',
    items: [
      { id: 'meal_reminder', title: 'Meal Reminders', subtitle: 'Remind me to log meals', default: true },
      { id: 'water_reminder', title: 'Hydration Alerts', subtitle: 'Hourly water intake reminders', default: true },
      { id: 'calorie_summary', title: 'Daily Summary', subtitle: 'End-of-day nutrition recap', default: true },
    ],
  },
  {
    label: 'Workouts',
    items: [
      { id: 'workout_reminder', title: 'Workout Reminders', subtitle: 'Scheduled session alerts', default: true },
      { id: 'rest_day', title: 'Rest Day Alerts', subtitle: 'Notify on suggested rest days', default: false },
      { id: 'streak_alert', title: 'Streak Alerts', subtitle: "Don't break your streak", default: true },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'weekly_report', title: 'Weekly Report', subtitle: 'Summary every Monday morning', default: true },
      { id: 'ai_insight', title: 'AI Coach Tips', subtitle: 'Personalized recommendations', default: false },
      { id: 'goal_progress', title: 'Goal Progress', subtitle: 'Milestone celebrations', default: true },
    ],
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NOTIF_GROUPS.forEach(g => g.items.forEach(item => { init[item.id] = item.default; }));
    return init;
  });

  const toggle = (id: string) => setToggles(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Notifications" subtitle="Control your alerts" />

        {NOTIF_GROUPS.map(group => (
          <Card key={group.label}>
            <ThemedText style={styles.groupLabel}>{group.label}</ThemedText>
            {group.items.map((item, i) => (
              <View key={item.id} style={[styles.row, i < group.items.length - 1 && styles.rowBorder]}>
                <View style={styles.rowLeft}>
                  <ThemedText style={styles.rowTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.rowSubtitle}>{item.subtitle}</ThemedText>
                </View>
                <Switch
                  value={toggles[item.id]}
                  onValueChange={() => toggle(item.id)}
                  thumbColor={toggles[item.id] ? DS.accent : DS.textMuted}
                  trackColor={{ true: 'rgba(59,130,246,0.3)', false: DS.raised }}
                />
              </View>
            ))}
          </Card>
        ))}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={14} color={DS.textMuted} />
          <ThemedText style={styles.noteText}>
            Push notifications require device permission. Manage in your device Settings if prompts don&apos;t appear.
          </ThemedText>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },
  groupLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: DS.border },
  rowLeft: { flex: 1, marginRight: 12 },
  rowTitle: { fontSize: 14, fontWeight: '500', color: DS.textPrimary },
  rowSubtitle: { fontSize: 12, color: DS.textMuted, marginTop: 2 },
  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingHorizontal: 4 },
  noteText: { flex: 1, fontSize: 12, color: DS.textMuted, lineHeight: 18 },
});
