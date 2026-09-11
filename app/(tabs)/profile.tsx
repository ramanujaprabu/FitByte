import Ionicons from '@expo/vector-icons/Ionicons';
<<<<<<< HEAD
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
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
=======
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/shared/Badge';
import { Card } from '@/components/shared/Card';
import { MonoText } from '@/components/shared/MonoText';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';

import {
  MOCK_ACHIEVEMENTS,
  MOCK_BODY_METRICS, MOCK_CALORIE_TARGET,
  MOCK_FITNESS_GOAL,
  MOCK_QUICK_STATS,
  MOCK_USER,
} from '@/data/profile';

const SETTINGS_ITEMS = [
  { title: 'Account Settings', icon: 'person-circle-outline', route: '/screens/account-settings' },
  { title: 'Notifications', icon: 'notifications-outline', route: '/screens/notifications' },
  { title: 'AI Preferences', icon: 'sparkles-outline', route: '/screens/ai-preferences' },
  { title: 'Connected Devices', icon: 'watch-outline', route: '/screens/connected-devices' },
  { title: 'Health App Sync', icon: 'heart-outline', route: '/screens/connected-devices' },
  { title: 'Backup & Restore', icon: 'cloud-upload-outline', route: '/screens/export-data' },
  { title: 'Privacy & Security', icon: 'shield-checkmark-outline', route: '/screens/privacy-security' },
  { title: 'Help & Support', icon: 'help-circle-outline', route: '/screens/account-settings' },
] as const;

const PREMIUM_FEATURES = [
  { icon: 'sparkles-outline', text: 'AI Nutrition Coach' },
  { icon: 'analytics-outline', text: 'Advanced Analytics' },
  { icon: 'scan-outline', text: 'Unlimited Meal Scans' },
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
<<<<<<< HEAD
  const { user, logout } = useAuth();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { mode, setMode } = useThemeMode();
  const { units, setUnits } = useUnits();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    userService.getProfile().then(setProfile).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    userService.getProfile().then(setProfile).catch(() => {}).finally(() => setRefreshing(false));
  }, []);

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
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DS.accent} />}>

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
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionHeaderCaps}>GOALS</ThemedText>
            <Pressable style={styles.editGoalsBtn} onPress={() => router.push('/screens/edit-goals' as any)} hitSlop={6}>
              <Ionicons name="pencil" size={13} color={DS.textSecond} />
            </Pressable>
          </View>
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
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionHeaderCaps: {
      fontSize: 12,
      fontWeight: '600',
      color: DS.textSecond,
      letterSpacing: 0.5,
      marginBottom: Spacing.sm,
    },
    editGoalsBtn: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: DS.raised,
      alignItems: 'center',
      justifyContent: 'center',
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
=======
  const [darkMode, setDarkMode] = useState(true);

  return (
    <ScrollView showsVerticalScrollIndicator={false}
      style={{ backgroundColor: DS.bg }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 80 }]}>

      {/* PROFILE HEADER */}
      <Card>
        <View style={styles.profileTop}>
          <Image source={{ uri: MOCK_USER.avatarUrl }} style={styles.avatar} contentFit="cover" />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.name}>{MOCK_USER.name}</ThemedText>
              <Ionicons name="checkmark-circle-outline" size={15} color={DS.textSecond} />
            </View>
            <ThemedText style={styles.email}>{MOCK_USER.email}</ThemedText>
            <Badge label={MOCK_USER.goal} style={{ marginTop: 10 }} />
            <ThemedText style={styles.quote}>{MOCK_USER.quote}</ThemedText>
          </View>
        </View>
        <View style={styles.profileBottom}>
          <View style={styles.streakRow}>
            <Ionicons name="flame-outline" size={13} color={DS.textSecond} />
            <MonoText bold style={styles.streakText}>{MOCK_USER.streakDays}</MonoText>
            <ThemedText style={styles.streakText}> Day Streak</ThemedText>
          </View>
          <Pressable style={styles.editBtn} onPress={() => router.push('/screens/edit-profile')}>
            <ThemedText style={styles.editBtnText}>Edit Profile</ThemedText>
          </Pressable>
        </View>
      </Card>

      {/* ACHIEVEMENTS */}
      <SectionHeader title="Streaks & Achievements" rightLabel={`Level ${MOCK_USER.level}`} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achieveRow}>
        {MOCK_ACHIEVEMENTS.map(a => (
          <View key={a.title} style={styles.achieveCard}>
            <View style={styles.achieveIcon}>
              <Ionicons name={a.icon as any} size={17} color={DS.textSecond} />
            </View>
            <ThemedText style={styles.achieveTitle}>{a.title}</ThemedText>
            <MonoText bold style={styles.achieveVal}>{a.streakDays} Days</MonoText>
          </View>
        ))}
      </ScrollView>

      {/* BODY METRICS */}
      <Card>
        <SectionHeader title="Body Metrics" rightLabel="+1.2kg Muscle" />
        <View style={styles.metricsGrid}>
          {[
            { label: 'Weight', value: `${MOCK_BODY_METRICS.weight} kg`, trend: '↑ 0.8 kg' },
            { label: 'Goal', value: `${MOCK_BODY_METRICS.goalWeight} kg`, trend: `${MOCK_BODY_METRICS.goalCompletionPercent}% done` },
            { label: 'Body Fat', value: `${MOCK_BODY_METRICS.bodyFatPercent}%`, trend: '↓ 2%' },
            { label: 'BMI', value: String(MOCK_BODY_METRICS.bmi), trend: 'Healthy' },
          ].map(m => (
            <View key={m.label} style={styles.metricCard}>
              <ThemedText style={styles.metricLabel}>{m.label}</ThemedText>
              <MonoText bold style={styles.metricValue}>{m.value}</MonoText>
              <ThemedText style={styles.metricTrend}>{m.trend}</ThemedText>
            </View>
          ))}
        </View>
        <View style={styles.calorieCard}>
          <View style={styles.calorieTop}>
            <ThemedText style={styles.metricLabel}>Daily Calorie Target</ThemedText>
            <MonoText bold style={styles.calorieVal}>{MOCK_CALORIE_TARGET.daily.toLocaleString()} kcal</MonoText>
          </View>
          <ProgressBar progress={MOCK_CALORIE_TARGET.currentPercent / 100} color={DS.accent} />
          <ThemedText style={styles.calorieSub}>Maintenance: {MOCK_CALORIE_TARGET.maintenance.toLocaleString()} kcal</ThemedText>
        </View>
      </Card>

      {/* FITNESS GOALS */}
      <Card>
        <SectionHeader title="Fitness Goals"
          rightElement={
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles-outline" size={11} color={DS.textSecond} />
              <ThemedText style={styles.aiText}>AI Optimized</ThemedText>
            </View>
          }
        />
        <View style={styles.goalCard}>
          <View style={styles.goalTop}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.goalTitle}>{MOCK_FITNESS_GOAL.programName}</ThemedText>
              <ThemedText style={styles.goalSub}>Estimated completion · {MOCK_FITNESS_GOAL.estimatedMonths} months</ThemedText>
            </View>
            <View style={styles.goalPct}>
              <MonoText bold style={styles.goalPctText}>{MOCK_FITNESS_GOAL.completionPercent}%</MonoText>
            </View>
          </View>
          <ProgressBar progress={MOCK_FITNESS_GOAL.completionPercent / 100} color={DS.accent} height={4} />
          <View style={styles.macroTargets}>
            {[
              { val: `${MOCK_FITNESS_GOAL.macroTargets.protein}g`, label: 'Protein' },
              { val: `${MOCK_FITNESS_GOAL.macroTargets.carbs}g`, label: 'Carbs' },
              { val: `${MOCK_FITNESS_GOAL.macroTargets.fats}g`, label: 'Fats' },
            ].map(m => (
              <View key={m.label} style={styles.macroTarget}>
                <MonoText bold style={styles.macroTargetVal}>{m.val}</MonoText>
                <ThemedText style={styles.macroTargetLabel}>{m.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </Card>

      {/* QUICK STATS */}
      <SectionHeader title="Quick Stats" rightLabel="This Month" />
      <View style={styles.statsGrid}>
        {MOCK_QUICK_STATS.map(s => (
          <View key={s.title} style={styles.statCard}>
            <Ionicons name={s.icon as any} size={15} color={DS.textSecond} />
            <MonoText bold style={styles.statValue}>{s.value}</MonoText>
            <ThemedText style={styles.statTitle}>{s.title}</ThemedText>
          </View>
        ))}
      </View>

      {/* SETTINGS */}
      <Card>
        <ThemedText type="subtitle" style={{ marginBottom: 16 }}>Settings</ThemedText>
        {SETTINGS_ITEMS.map((item, i) => (
          <Pressable key={item.title}
            onPress={() => router.push(item.route as any)}
            style={[styles.settingRow, i < SETTINGS_ITEMS.length - 1 && styles.settingBorder]}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name={item.icon as any} size={15} color={DS.textSecond} />
              </View>
              <ThemedText style={styles.settingText}>{item.title}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={13} color={DS.textMuted} />
          </Pressable>
        ))}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="moon-outline" size={15} color={DS.textSecond} />
            </View>
            <ThemedText style={styles.settingText}>Dark Mode</ThemedText>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode}
            thumbColor={DS.accent} trackColor={{ true: 'rgba(59,130,246,0.3)', false: DS.raised }} />
        </View>
      </Card>

      {/* PREMIUM CARD */}
      <Card>
        <View style={styles.premiumTop}>
          <View style={styles.premiumIcon}>
            <Ionicons name="diamond-outline" size={19} color={DS.textSecond} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.premiumTitle}>FitByte Premium</ThemedText>
            <ThemedText style={styles.premiumSub}>Unlock AI coaching and advanced analytics</ThemedText>
          </View>
        </View>
        <View style={styles.premiumFeatures}>
          {PREMIUM_FEATURES.map(f => (
            <View key={f.text} style={styles.premiumFeature}>
              <Ionicons name={f.icon as any} size={13} color={DS.textSecond} />
              <ThemedText style={styles.premiumFeatureText}>{f.text}</ThemedText>
            </View>
          ))}
        </View>
        <Pressable style={styles.upgradeBtn} onPress={() => router.push('/screens/premium')}>
          <ThemedText style={styles.upgradeBtnText}>Upgrade to Premium</ThemedText>
        </Pressable>
      </Card>

      {/* FOOTER */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerTitle}>FitByte v1.0.3</ThemedText>
        <ThemedText style={styles.footerSub}>© 2026 FitByte · Built for healthier living</ThemedText>
        <View style={styles.footerLinks}>
          <Pressable onPress={() => router.push('/screens/privacy-security')}>
            <ThemedText style={styles.footerLink}>Privacy</ThemedText>
          </Pressable>
          <ThemedText style={styles.footerDot}>·</ThemedText>
          <ThemedText style={styles.footerLink}>Terms</ThemedText>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  profileTop: { flexDirection: 'row', gap: 16 },
  avatar: { width: 82, height: 82, borderRadius: 41, borderWidth: 1, borderColor: DS.border },
  profileInfo: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 22, fontWeight: '600', color: DS.textPrimary },
  email: { marginTop: 3, fontSize: 13, color: DS.textMuted },
  quote: { marginTop: 10, fontSize: 12, color: DS.textMuted, fontStyle: 'italic' },
  profileBottom: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: DS.border },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakText: { fontSize: 13, fontWeight: '500', color: DS.textSecond },
  editBtn: { backgroundColor: DS.raised, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: DS.border },
  editBtnText: { fontSize: 13, fontWeight: '500', color: DS.textPrimary },
  achieveRow: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  achieveCard: { backgroundColor: DS.surface, borderRadius: 14, borderWidth: 1, borderColor: DS.border, padding: 15, width: 105, alignItems: 'center', gap: 5 },
  achieveIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  achieveTitle: { fontSize: 12, fontWeight: '600', color: DS.textPrimary, textAlign: 'center' },
  achieveVal: { fontSize: 13 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  metricCard: { width: '47%', backgroundColor: DS.card, borderRadius: 12, padding: 13, borderWidth: 1, borderColor: DS.border, gap: 4 },
  metricLabel: { fontSize: 11, color: DS.textMuted },
  metricValue: { fontSize: 20 },
  metricTrend: { fontSize: 11, color: DS.textSecond },
  calorieCard: { backgroundColor: DS.card, borderRadius: 12, borderWidth: 1, borderColor: DS.border, padding: 14 },
  calorieTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  calorieVal: { fontSize: 14 },
  calorieSub: { marginTop: 8, fontSize: 11, color: DS.textMuted },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: DS.raised, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: DS.border },
  aiText: { fontSize: 11, color: DS.textSecond, fontWeight: '500' },
  goalCard: { backgroundColor: DS.card, borderRadius: 12, borderWidth: 1, borderColor: DS.border, padding: 15 },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  goalTitle: { fontWeight: '600', fontSize: 14, color: DS.textPrimary },
  goalSub: { marginTop: 3, fontSize: 11, color: DS.textMuted },
  goalPct: { backgroundColor: DS.raised, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7, borderWidth: 1, borderColor: DS.border },
  goalPctText: { fontSize: 13 },
  macroTargets: { flexDirection: 'row', gap: 10, paddingTop: 14, marginTop: 14, borderTopWidth: 1, borderTopColor: DS.border },
  macroTarget: { flex: 1, alignItems: 'center', gap: 3 },
  macroTargetVal: { fontSize: 16 },
  macroTargetLabel: { fontSize: 11, color: DS.textMuted },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '30.5%', backgroundColor: DS.surface, borderRadius: 12, borderWidth: 1, borderColor: DS.border, padding: 13, gap: 5 },
  statValue: { fontSize: 17, marginTop: 4 },
  statTitle: { fontSize: 10, color: DS.textMuted },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: DS.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  settingIcon: { width: 30, height: 30, borderRadius: 7, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  settingText: { fontSize: 14, color: DS.textPrimary, fontWeight: '500' },
  premiumTop: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: DS.border },
  premiumIcon: { width: 42, height: 42, borderRadius: 11, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  premiumTitle: { fontWeight: '600', fontSize: 15, color: DS.textPrimary },
  premiumSub: { marginTop: 3, fontSize: 12, color: DS.textSecond, lineHeight: 18 },
  premiumFeatures: { gap: 9, marginBottom: 16 },
  premiumFeature: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  premiumFeatureText: { fontSize: 13, color: DS.textSecond },
  upgradeBtn: { backgroundColor: DS.accent, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  upgradeBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  footer: { alignItems: 'center', paddingVertical: 20, gap: 5 },
  footerTitle: { fontSize: 13, fontWeight: '600', color: DS.textSecond },
  footerSub: { fontSize: 11, color: DS.textMuted },
  footerLinks: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  footerLink: { fontSize: 11, color: DS.textMuted },
  footerDot: { fontSize: 11, color: DS.textMuted },
});
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
