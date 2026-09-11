import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { TextField } from '@/components/shared/TextField';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { userService } from '@/services/api/user';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
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

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    scroll: { paddingHorizontal: Spacing.md + 4 },
    sectionLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '600', marginBottom: Spacing.sm + 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    pwHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pwSection: { marginTop: Spacing.sm + 6 },
    dangerCard: { backgroundColor: DS.statusBadDim },
    dangerTitle: { fontSize: 14, fontWeight: '600', color: DS.statusBad, marginBottom: 4 },
    dangerSubtitle: { fontSize: 12, color: DS.textMuted, marginBottom: Spacing.sm + 6 },
  });
}
