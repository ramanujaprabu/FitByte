import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { DS, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/api/user';
import type { ProfileData } from '@/types';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
  const userInitials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          {userAvatar ? (
            <Image
              source={{ uri: userAvatar }}
              style={styles.headerAvatar}
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <View style={[styles.headerAvatar, styles.initialsCircle]}>
              <ThemedText style={styles.initialsTextSmall}>{userInitials}</ThemedText>
            </View>
          )}
          <ThemedText style={styles.appTitle}>FitByte</ThemedText>
        </View>
        <Pressable style={styles.iconBtn} onPress={() => router.push('/screens/account-settings')}>
          <Ionicons name="settings-outline" size={22} color="#000000" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>

        {/* Profile Header */}
        <View style={styles.profileHeaderSection}>
          <Pressable style={styles.avatarWrapper} onPress={() => router.push('/screens/edit-profile')}>
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={styles.avatarImage}
                cachePolicy="memory-disk"
                transition={200}
              />
            ) : (
              <View style={[styles.avatarImage, styles.initialsCircleLg]}>
                <ThemedText style={styles.initialsTextLg}>{userInitials}</ThemedText>
              </View>
            )}
            <View style={styles.avatarOverlay}>
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            </View>
          </Pressable>
          <ThemedText style={styles.profileName}>{userName}</ThemedText>
          <ThemedText style={styles.profileSub}>{userEmail || 'Member'}</ThemedText>
        </View>

        {/* GOALS SECTION */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeaderCaps}>GOALS</ThemedText>
          <View style={styles.cardGroup}>
            <Pressable style={styles.rowItem} onPress={() => router.push('/screens/daily-analytics')}>
              <View style={styles.rowLeft}>
                <Ionicons name="flag-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Daily Calories</ThemedText>
              </View>
              <View style={styles.rowRight}>
                <ThemedText style={styles.rowValueMono}>2,400 kcal</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
              </View>
            </Pressable>

            <Pressable style={[styles.rowItem, styles.lastRowItem]} onPress={() => router.push('/screens/macro-breakdown')}>
              <View style={styles.rowLeft}>
                <Ionicons name="pie-chart-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Macro Targets</ThemedText>
              </View>
              <View style={styles.rowRight}>
                <ThemedText style={styles.rowValueMono}>30/40/30</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeaderCaps}>ACCOUNT</ThemedText>
          <View style={styles.cardGroup}>
            <Pressable style={styles.rowItem} onPress={() => router.push('/screens/account-settings')}>
              <View style={styles.rowLeft}>
                <Ionicons name="mail-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Email</ThemedText>
              </View>
              <View style={styles.rowRight}>
                <ThemedText style={styles.rowValueText}>{userEmail}</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
              </View>
            </Pressable>

            <Pressable style={styles.rowItem} onPress={() => router.push('/screens/account-settings')}>
              <View style={styles.rowLeft}>
                <Ionicons name="lock-closed-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Password</ThemedText>
              </View>
              <View style={styles.rowRight}>
                <ThemedText style={styles.rowValueText}>Updated 2m ago</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
              </View>
            </Pressable>

            <Pressable style={[styles.rowItem, styles.lastRowItem]} onPress={() => router.push('/screens/premium')}>
              <View style={styles.rowLeft}>
                <Ionicons name="star-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Subscription</ThemedText>
              </View>
              <View style={styles.rowRight}>
                <View style={styles.proBadge}>
                  <ThemedText style={styles.proBadgeText}>PRO</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* PREFERENCES SECTION */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeaderCaps}>PREFERENCES</ThemedText>
          <View style={styles.cardGroup}>
            {/* Units Toggle */}
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <Ionicons name="options-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Units</ThemedText>
              </View>
              <Pressable
                style={styles.unitsToggle}
                onPress={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}>
                <ThemedText style={styles.unitsText}>
                  {units === 'metric' ? 'Metric (kg, km)' : 'Imperial (lbs, mi)'}
                </ThemedText>
              </Pressable>
            </View>

            {/* Notifications Toggle */}
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <Ionicons name="notifications-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Notifications</ThemedText>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#EEEEEE', true: '#000000' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Dark Mode Toggle */}
            <View style={[styles.rowItem, styles.lastRowItem]}>
              <View style={styles.rowLeft}>
                <Ionicons name="moon-outline" size={20} color={DS.textSecond} />
                <ThemedText style={styles.rowTitle}>Dark Mode</ThemedText>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#EEEEEE', true: '#000000' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* LEGAL SECTION */}
        <View style={styles.section}>
          <View style={styles.cardGroup}>
            <Pressable style={styles.rowItem} onPress={() => router.push('/screens/privacy-security')}>
              <ThemedText style={styles.rowTitle}>Privacy Policy</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
            </Pressable>

            <Pressable style={[styles.rowItem, styles.lastRowItem]} onPress={() => router.push('/screens/privacy-security')}>
              <ThemedText style={styles.rowTitle}>Terms of Service</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
            </Pressable>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 54,
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DS.border,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
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
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DS.border,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: Radius.md,
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
    color: '#000000',
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
  proBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unitsToggle: {
    paddingVertical: 4,
  },
  unitsText: {
    fontSize: 14,
    color: DS.textSecond,
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
  initialsCircle: {
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555555',
  },
  initialsCircleLg: {
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  initialsTextLg: {
    fontSize: 28,
    fontWeight: '700',
    color: '#555555',
  },
});
