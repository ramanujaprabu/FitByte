import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/shared/Avatar';
import { ThemedText } from '@/components/themed-text';
import { useDS, useThemeMode, type ThemeMode } from '@/contexts/ThemeContext';
import { useUnits } from '@/contexts/UnitsContext';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/api/user';
import type { ProfileData } from '@/types';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { mode, setMode } = useThemeMode();
  const { units, setUnits } = useUnits();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    userService.getProfile().then(setProfile).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  const onLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const userName = user?.name || profile?.user.name || 'User';
  const userEmail = user?.email || profile?.user.email || '';
  const userAvatar = user?.avatarUrl || profile?.user.avatarUrl || '';

  const dailyCalories = profile?.calorieTarget.daily;
  const macros = profile?.fitnessGoal.macroTargets;
  const macroTotal = macros ? macros.protein + macros.carbs + macros.fats : 0;
  const macroSplitLabel = macros && macroTotal > 0
    ? `${Math.round((macros.protein / macroTotal) * 100)}/${Math.round((macros.carbs / macroTotal) * 100)}/${Math.round((macros.fats / macroTotal) * 100)}`
    : '—';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Avatar uri={userAvatar || undefined} name={userName} size={32} />
          <ThemedText style={styles.appTitle}>FitByte</ThemedText>
        </View>
        <Pressable style={styles.iconBtn} onPress={() => router.push('/screens/account-settings')}>
          <Ionicons name="settings-outline" size={22} color={DS.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>

        {/* Profile Header */}
        <View style={styles.profileHeaderSection}>
          <Pressable style={styles.avatarWrapper} onPress={() => router.push('/screens/edit-profile')}>
            <Avatar uri={userAvatar || undefined} name={userName} size={96} />
          </Pressable>
          <ThemedText style={styles.profileName}>{userName}</ThemedText>
          <ThemedText style={styles.profileSub}>{userEmail || 'Member'}</ThemedText>
        </View>

        {/* GOALS SECTION */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeaderCaps}>GOALS</ThemedText>
          <View style={styles.cardGroup}>
            <Pressable style={styles.rowItem} onPress={() => router.push('/(tabs)/trends' as any)}>
              <View style={styles.rowLeft}>
                <Ionicons name="flag-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Daily Calories</ThemedText>
              </View>
              <View style={styles.rowRight}>
                <ThemedText style={styles.rowValueMono}>
                  {loading ? '…' : dailyCalories ? `${dailyCalories.toLocaleString()} kcal` : 'Not set'}
                </ThemedText>
                <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
              </View>
            </Pressable>

            <Pressable style={[styles.rowItem, styles.lastRowItem]} onPress={() => router.push('/(tabs)/trends' as any)}>
              <View style={styles.rowLeft}>
                <Ionicons name="pie-chart-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Macro Targets</ThemedText>
              </View>
              <View style={styles.rowRight}>
                <ThemedText style={styles.rowValueMono}>{loading ? '…' : macroSplitLabel}</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeaderCaps}>ACCOUNT</ThemedText>
          <View style={styles.cardGroup}>
            <Pressable style={[styles.rowItem, styles.lastRowItem]} onPress={() => router.push('/screens/account-settings')}>
              <View style={styles.rowLeft}>
                <Ionicons name="mail-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Email</ThemedText>
              </View>
              <View style={styles.rowRight}>
                <ThemedText style={styles.rowValueText}>{userEmail}</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* PREFERENCES SECTION */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeaderCaps}>PREFERENCES</ThemedText>
          <View style={styles.cardGroup}>
            {/* Appearance — real Light/Dark/System control */}
            <View style={[styles.rowItem, styles.prefRow]}>
              <View style={styles.rowLeft}>
                <Ionicons name="contrast-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Appearance</ThemedText>
              </View>
              <View style={styles.segmentTrack}>
                {THEME_OPTIONS.map((opt) => {
                  const active = mode === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setMode(opt.value)}
                      style={[styles.segmentBtn, active && styles.segmentBtnActive]}>
                      <Ionicons name={opt.icon} size={14} color={active ? DS.accentText : DS.textSecond} />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Units — real Metric/Imperial control */}
            <View style={[styles.rowItem, styles.lastRowItem, styles.prefRow]}>
              <View style={styles.rowLeft}>
                <Ionicons name="options-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Units</ThemedText>
              </View>
              <View style={styles.segmentTrack}>
                {(['metric', 'imperial'] as const).map((opt) => {
                  const active = units === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => setUnits(opt)}
                      style={[styles.segmentBtnWide, active && styles.segmentBtnActive]}>
                      <ThemedText style={[styles.segmentText, active && styles.segmentTextActive]}>
                        {opt === 'metric' ? 'kg / cm' : 'lb / ft'}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <Pressable style={styles.signOutBtn} onPress={onLogout}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </Pressable>

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
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    appTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -0.5,
    },
    iconBtn: {
      padding: 6,
    },
    scroll: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.lg,
    },
    profileHeaderSection: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    avatarWrapper: {
      marginBottom: Spacing.md,
    },
    profileName: {
      fontSize: 28,
      fontWeight: '600',
      color: DS.textPrimary,
      letterSpacing: -0.5,
    },
    profileSub: {
      fontSize: 14,
      color: DS.textSecond,
      marginTop: 4,
    },
    section: {
      marginBottom: Spacing.xl,
    },
    sectionHeaderCaps: {
      fontSize: 12,
      fontWeight: '600',
      color: DS.textSecond,
      letterSpacing: 0.5,
      marginBottom: Spacing.sm,
    },
    cardGroup: {
      backgroundColor: DS.surface,
      borderRadius: Radius.lg,
      overflow: 'hidden',
    },
    rowItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: DS.border,
    },
    prefRow: {
      paddingVertical: Spacing.sm + 4,
    },
    lastRowItem: {
      borderBottomWidth: 0,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    rowTitle: {
      fontSize: 16,
      color: DS.textPrimary,
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    rowValueMono: {
      fontFamily: Fonts.mono,
      fontSize: 14,
      color: DS.textSecond,
    },
    rowValueText: {
      fontSize: 14,
      color: DS.textSecond,
    },
    segmentTrack: {
      flexDirection: 'row',
      backgroundColor: DS.raised,
      borderRadius: Radius.full,
      padding: 3,
      gap: 2,
    },
    segmentBtn: {
      width: 30,
      height: 26,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentBtnWide: {
      paddingHorizontal: 10,
      height: 26,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentBtnActive: {
      backgroundColor: DS.accent,
    },
    segmentText: {
      fontSize: 11,
      fontWeight: '600',
      color: DS.textSecond,
    },
    segmentTextActive: {
      color: DS.accentText,
    },
    signOutBtn: {
      paddingVertical: Spacing.md,
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    signOutText: {
      fontSize: 15,
      fontWeight: '500',
      color: DS.textSecond,
    },
  });
}
