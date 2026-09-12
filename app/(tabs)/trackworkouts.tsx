import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { workoutService } from '@/services/api/workout';
import type { WorkoutRoutine, WorkoutSession } from '@/types';

export default function WorkoutTrackerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);

  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    return Promise.all([
      workoutService.getRoutines(),
      workoutService.getRecentSessions(5),
    ]).then(([r, s]) => { setRoutines(r); setRecentSessions(s); }).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  useFocusEffect(load);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  // Only block on a spinner before the very first paint of real data — on
  // every later refocus/refresh, keep showing what's already on screen
  // rather than flashing "No workouts yet" while the refetch is in flight.
  const showInitialSpinner = loading && routines.length === 0 && recentSessions.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topHeader}>
        <ThemedText style={styles.appTitle}>FitByte</ThemedText>
        <Pressable style={styles.iconBtn} onPress={() => router.push('/screens/account-settings' as any)}>
          <Ionicons name="settings-outline" size={22} color={DS.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DS.accent} />}>

        {/* Headline & Action */}
        <View style={styles.headlineRow}>
          <ThemedText style={styles.pageTitle}>Workouts</ThemedText>
          <Pressable style={styles.startWorkoutBtn} onPress={() => router.push('/screens/log-workout')}>
            <Ionicons name="add" size={20} color={DS.accentText} />
            <ThemedText style={styles.startWorkoutBtnText}>Start Workout</ThemedText>
          </Pressable>
        </View>

        {showInitialSpinner ? (
          <View style={styles.initialSpinner}>
            <ActivityIndicator color={DS.accent} />
          </View>
        ) : (
        <>
        {/* Saved Routines Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Saved Routines</ThemedText>
          <View style={styles.bentoGrid}>
            {routines.map((item) => (
              <Pressable
                key={item.id}
                style={styles.routineCard}
                onPress={() => router.push({ pathname: '/screens/workout-detail', params: { id: item.id } })}>
                <View>
                  <ThemedText style={styles.routineCardTitle}>{item.name}</ThemedText>
                  <ThemedText style={styles.routineCardSub}>{item.muscles}</ThemedText>
                </View>
                <View style={styles.routineCardBottom}>
                  <ThemedText style={styles.routineCardCount}>{item.exercises.length} Exercises</ThemedText>
                  <Ionicons name="arrow-forward-outline" size={16} color={DS.textSecond} />
                </View>
              </Pressable>
            ))}

            {/* New Routine Dashed Box */}
            <Pressable
              style={styles.newRoutineBox}
              onPress={() => router.push('/screens/create-routine')}>
              <Ionicons name="add-circle-outline" size={32} color={DS.textSecond} />
              <ThemedText style={styles.newRoutineText}>New Routine</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Recent Workouts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>Recent Workouts</ThemedText>
            {recentSessions.length > 0 && (
              <Pressable onPress={() => router.push('/screens/recent-activities')}>
                <ThemedText style={styles.viewAllText}>View All</ThemedText>
              </Pressable>
            )}
          </View>

          {recentSessions.length > 0 ? (
            <View style={styles.recentList}>
              {recentSessions.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.recentRow}
                  onPress={() => router.push('/screens/recent-activities')}>
                  <View style={styles.recentLeft}>
                    <View style={styles.dumbbellCircle}>
                      <Ionicons name="barbell-outline" size={18} color={DS.textPrimary} />
                    </View>
                    <View>
                      <ThemedText style={styles.recentTitle}>{item.routineName}</ThemedText>
                      <View style={styles.recentMetaRow}>
                        <ThemedText style={styles.recentMetaText}>{item.timestamp}</ThemedText>
                        <View style={styles.metaDot} />
                        <ThemedText style={styles.recentMetaText}>{item.durationMins}</ThemedText>
                        <View style={styles.metaDot} />
                        <ThemedText style={styles.recentMetaText}>{item.caloriesBurned}</ThemedText>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={18} color={DS.textSecond} />
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyRecentCard}>
              <Ionicons name="fitness-outline" size={28} color={DS.textMuted} style={{ marginBottom: 8 }} />
              <ThemedText style={styles.emptyRecentTitle}>No workouts logged yet</ThemedText>
              <ThemedText style={styles.emptyRecentSub}>
                Start a workout or create a routine to track your training history and streaks.
              </ThemedText>
              <Pressable
                style={styles.startWorkoutSmallBtn}
                onPress={() => router.push('/screens/log-workout')}>
                <ThemedText style={styles.startWorkoutSmallBtnText}>Start Workout</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
        </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: DS.bg,
    },
    topHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      height: 54,
      backgroundColor: DS.bg,
    },
    iconBtn: {
      padding: 6,
    },
    appTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -0.5,
    },
    scroll: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.lg,
    },
    headlineRow: {
      marginBottom: Spacing.xl,
      gap: Spacing.md,
    },
    initialSpinner: {
      paddingVertical: Spacing.xxl,
      alignItems: 'center',
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: '600',
      color: DS.textPrimary,
      letterSpacing: -0.5,
    },
    startWorkoutBtn: {
      backgroundColor: DS.accent,
      borderRadius: Radius.full,
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    startWorkoutBtnText: {
      fontSize: 16,
      fontWeight: '600',
      color: DS.accentText,
    },
    section: {
      marginBottom: Spacing.xl,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: DS.textPrimary,
      marginBottom: Spacing.md,
    },
    viewAllText: {
      fontSize: 13,
      color: DS.textSecond,
    },
    bentoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.md,
    },
    routineCard: {
      width: '47.5%',
      aspectRatio: 1,
      backgroundColor: DS.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      justifyContent: 'space-between',
    },
    routineCardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: DS.textPrimary,
      marginBottom: 4,
    },
    routineCardSub: {
      fontSize: 12,
      color: DS.textSecond,
      lineHeight: 16,
    },
    routineCardBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    routineCardCount: {
      fontFamily: Fonts.mono,
      fontSize: 12,
      color: DS.textSecond,
    },
    newRoutineBox: {
      width: '47.5%',
      aspectRatio: 1,
      backgroundColor: DS.raised,
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    newRoutineText: {
      fontSize: 13,
      fontWeight: '500',
      color: DS.textSecond,
    },
    recentList: {
      backgroundColor: DS.surface,
      borderRadius: Radius.lg,
      overflow: 'hidden',
      paddingHorizontal: Spacing.md,
    },
    recentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: DS.border,
    },
    recentLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    dumbbellCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: DS.raised,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recentTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: DS.textPrimary,
      marginBottom: 2,
    },
    recentMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    recentMetaText: {
      fontFamily: Fonts.mono,
      fontSize: 12,
      color: DS.textSecond,
    },
    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: DS.textMuted,
    },
    emptyRecentCard: {
      backgroundColor: DS.surface,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyRecentTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: DS.textPrimary,
      marginBottom: 4,
    },
    emptyRecentSub: {
      fontSize: 13,
      color: DS.textSecond,
      textAlign: 'center',
      marginBottom: Spacing.md,
      lineHeight: 18,
    },
    startWorkoutSmallBtn: {
      backgroundColor: DS.accent,
      paddingHorizontal: Spacing.md,
      paddingVertical: 10,
      borderRadius: Radius.full,
    },
    startWorkoutSmallBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: DS.accentText,
    },
  });
}
