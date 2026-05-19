import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { BackButton } from '@/components/shared/BackButton';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { MonoText } from '@/components/shared/MonoText';
import { DS } from '@/constants/theme';
import { MOCK_RECENT_SESSIONS } from '@/data/workout';

const INTENSITY_COLOR: Record<string, string> = {
  Low: DS.hmMid, Medium: DS.hmHigh, High: DS.textSecond, Extreme: DS.textPrimary,
};

const EXTRA_SESSIONS = [
  { id: 's4', routineName: 'Full Body HIIT', durationMins: '42 mins', caloriesBurned: '510 kcal', muscles: 'Full Body', intensity: 'High' as const, timestamp: 'Thursday · 6:00 AM' },
  { id: 's5', routineName: 'Push Day', durationMins: '77 mins', caloriesBurned: '630 kcal', muscles: 'Chest + Triceps', intensity: 'Extreme' as const, timestamp: 'Tuesday · 7:00 PM' },
  { id: 's6', routineName: 'Leg Day', durationMins: '80 mins', caloriesBurned: '700 kcal', muscles: 'Legs + Glutes', intensity: 'High' as const, timestamp: 'Sunday · 5:30 PM' },
];

const ALL_SESSIONS = [...MOCK_RECENT_SESSIONS, ...EXTRA_SESSIONS];

const GROUPS = [
  { label: 'This Week', sessions: ALL_SESSIONS.slice(0, 3) },
  { label: 'Last Week', sessions: ALL_SESSIONS.slice(3) },
];

export default function RecentActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Recent Activity" subtitle="All workout sessions" />

        {GROUPS.map(group => (
          <View key={group.label}>
            <View style={styles.groupHeader}>
              <ThemedText style={styles.groupLabel}>{group.label}</ThemedText>
              <MonoText style={styles.groupCount}>{group.sessions.length} sessions</MonoText>
            </View>
            {group.sessions.map(session => (
              <Pressable
                key={session.id}
                onPress={() => router.push('/screens/workout-detail')}
                style={({ pressed }) => [styles.sessionCard, pressed && { opacity: 0.8 }]}>
                <View style={styles.sessionLeft}>
                  <View style={styles.sessionIcon}>
                    <Ionicons name="fitness-outline" size={18} color={DS.textSecond} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.sessionName}>{session.routineName}</ThemedText>
                    <ThemedText style={styles.sessionMuscles}>{session.muscles}</ThemedText>
                    <ThemedText style={styles.sessionTime}>{session.timestamp}</ThemedText>
                  </View>
                </View>
                <View style={styles.sessionRight}>
                  <MonoText bold style={styles.sessionDuration}>{session.durationMins}</MonoText>
                  <ThemedText style={styles.sessionCal}>{session.caloriesBurned}</ThemedText>
                  <View style={[styles.intensityBadge, { borderColor: INTENSITY_COLOR[session.intensity] }]}>
                    <ThemedText style={[styles.intensityText, { color: INTENSITY_COLOR[session.intensity] }]}>
                      {session.intensity}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
  groupLabel: { fontSize: 13, fontWeight: '600', color: DS.textSecond },
  groupCount: { fontSize: 12, color: DS.textMuted },
  sessionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: DS.surface, borderRadius: 12, borderWidth: 1, borderColor: DS.border, padding: 14, marginBottom: 8 },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  sessionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  sessionName: { fontWeight: '600', fontSize: 14, color: DS.textPrimary },
  sessionMuscles: { fontSize: 11, color: DS.textSecond, marginTop: 2 },
  sessionTime: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
  sessionRight: { alignItems: 'flex-end', gap: 3 },
  sessionDuration: { fontSize: 14 },
  sessionCal: { fontSize: 11, color: DS.textSecond },
  intensityBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, borderWidth: 1, marginTop: 2 },
  intensityText: { fontSize: 10, fontWeight: '600' },
});
