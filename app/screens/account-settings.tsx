import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { TextField } from '@/components/shared/TextField';
import { ThemedText } from '@/components/themed-text';
import { DS, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { userService } from '@/services/api/user';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const onSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({ name });
      await refreshUser();
      Alert.alert('Saved', 'Your account details were updated.');
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const onUpdatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setShowPwSection(false);
      Alert.alert('Password updated');
    } catch (e: any) {
      Alert.alert('Could not update password', e?.message ?? 'Something went wrong.');
    } finally {
      setPwSaving(false);
    }
  };

  const onSignOut = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const onDeleteAccount = () => {
    // Deleting an auth user requires the service-role key, which must never
    // ship in the app. In production, call a Supabase Edge Function (using
    // the service role server-side) from here instead.
    Alert.alert(
      'Account deletion',
      'Account deletion requires a server-side endpoint (e.g. a Supabase Edge Function) since it needs the service role key. Not wired up in this study build.'
    );
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Account Settings" subtitle="Manage your account details" />

        <Card>
          <ThemedText style={styles.sectionLabel}>Account Info</ThemedText>
          <TextField label="Display Name" value={name} onChangeText={setName} />
          <TextField label="Email" value={email} editable={false} style={{ opacity: 0.6 }} />
          <Button label="Save Changes" onPress={onSave} loading={saving} />
        </Card>

        <Card>
          <Pressable onPress={() => setShowPwSection(v => !v)} style={styles.pwHeader}>
            <ThemedText style={styles.sectionLabel}>Change Password</ThemedText>
            <Ionicons name={showPwSection ? 'chevron-up' : 'chevron-down'} size={16} color={DS.textMuted} />
          </Pressable>
          {showPwSection && (
            <View style={styles.pwSection}>
              <TextField
                label="New Password"
                secureTextEntry
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Button label="Update Password" onPress={onUpdatePassword} loading={pwSaving} />
            </View>
          )}
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Linked Accounts</ThemedText>
          {[
            { name: 'Apple Health', icon: 'heart-outline', linked: false },
            { name: 'Google Fit', icon: 'fitness-outline', linked: false },
          ].map(acc => (
            <View key={acc.name} style={styles.linkedRow}>
              <View style={styles.linkedLeft}>
                <View style={styles.linkedIcon}>
                  <Ionicons name={acc.icon as any} size={16} color={DS.textSecond} />
                </View>
                <ThemedText style={styles.linkedName}>{acc.name}</ThemedText>
              </View>
              <Pressable style={[styles.linkedBtn, acc.linked && styles.linkedBtnActive]}
                onPress={() => router.push('/screens/connected-devices')}>
                <ThemedText style={[styles.linkedBtnText, acc.linked && styles.linkedBtnTextActive]}>
                  {acc.linked ? 'Connected' : 'Connect'}
                </ThemedText>
              </Pressable>
            </View>
          ))}
        </Card>

        {/* Danger Zone */}
        <Card style={styles.dangerCard}>
          <ThemedText style={styles.dangerTitle}>Danger Zone</ThemedText>
          <ThemedText style={styles.dangerSubtitle}>These actions are irreversible.</ThemedText>
          <Button label="Sign Out" icon="log-out-outline" variant="destructive" onPress={onSignOut} style={{ marginBottom: Spacing.xs + 2 }} />
          <Button label="Delete Account" icon="trash-outline" variant="destructive" onPress={onDeleteAccount} />
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: Spacing.md + 4 },
  sectionLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '600', marginBottom: Spacing.sm + 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  pwHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pwSection: { marginTop: Spacing.sm + 6 },
  linkedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm + 2 },
  linkedLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2 },
  linkedIcon: { width: 32, height: 32, borderRadius: Radius.sm - 2, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  linkedName: { fontSize: 14, color: DS.textPrimary, fontWeight: '500' },
  linkedBtn: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: DS.raised, borderWidth: 1, borderColor: DS.border },
  linkedBtnActive: { backgroundColor: DS.accentDim, borderColor: DS.accent },
  linkedBtnText: { fontSize: 12, fontWeight: '500', color: DS.textSecond },
  linkedBtnTextActive: { color: DS.accent },
  dangerCard: { borderColor: DS.statusBad },
  dangerTitle: { fontSize: 14, fontWeight: '600', color: DS.statusBad, marginBottom: 4 },
  dangerSubtitle: { fontSize: 12, color: DS.textMuted, marginBottom: Spacing.sm + 6 },
});
