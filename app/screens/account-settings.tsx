import { BackButton } from '@/components/shared/BackButton';
<<<<<<< HEAD
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
=======
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import { MOCK_USER } from '@/data/profile';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
<<<<<<< HEAD
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
=======
  const [name, setName] = useState(MOCK_USER.name);
  const [email, setEmail] = useState(MOCK_USER.email);
  const [showPwSection, setShowPwSection] = useState(false);
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Account Settings" subtitle="Manage your account details" />

        <Card>
          <ThemedText style={styles.sectionLabel}>Account Info</ThemedText>
<<<<<<< HEAD
          <TextField label="Display Name" value={name} onChangeText={setName} />
          <TextField label="Email" value={email} editable={false} style={{ opacity: 0.6 }} />
          <Button label="Save Changes" onPress={onSave} loading={saving} />
=======
          {[
            { label: 'Display Name', val: name, set: setName },
            { label: 'Email', val: email, set: setEmail },
          ].map(f => (
            <View key={f.label} style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>{f.label}</ThemedText>
              <TextInput value={f.val} onChangeText={f.set}
                style={styles.input} placeholderTextColor={DS.textMuted} />
            </View>
          ))}
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
        </Card>

        <Card>
          <Pressable onPress={() => setShowPwSection(v => !v)} style={styles.pwHeader}>
            <ThemedText style={styles.sectionLabel}>Change Password</ThemedText>
            <Ionicons name={showPwSection ? 'chevron-up' : 'chevron-down'} size={16} color={DS.textMuted} />
          </Pressable>
          {showPwSection && (
            <View style={styles.pwSection}>
<<<<<<< HEAD
              <TextField
                label="New Password"
                secureTextEntry
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Button label="Update Password" onPress={onUpdatePassword} loading={pwSaving} />
=======
              {['Current Password', 'New Password', 'Confirm Password'].map(label => (
                <View key={label} style={styles.fieldGroup}>
                  <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
                  <TextInput secureTextEntry placeholder="••••••••"
                    placeholderTextColor={DS.textMuted} style={styles.input} />
                </View>
              ))}
              <Pressable style={styles.saveBtn}>
                <ThemedText style={styles.saveBtnText}>Update Password</ThemedText>
              </Pressable>
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
            </View>
          )}
        </Card>

<<<<<<< HEAD
=======
        <Card>
          <ThemedText style={styles.sectionLabel}>Linked Accounts</ThemedText>
          {[
            { name: 'Apple Health', icon: 'heart-outline', linked: true },
            { name: 'Google Fit', icon: 'fitness-outline', linked: false },
          ].map(acc => (
            <View key={acc.name} style={styles.linkedRow}>
              <View style={styles.linkedLeft}>
                <View style={styles.linkedIcon}>
                  <Ionicons name={acc.icon as any} size={16} color={DS.textSecond} />
                </View>
                <ThemedText style={styles.linkedName}>{acc.name}</ThemedText>
              </View>
              <Pressable style={[styles.linkedBtn, acc.linked && styles.linkedBtnActive]}>
                <ThemedText style={[styles.linkedBtnText, acc.linked && styles.linkedBtnTextActive]}>
                  {acc.linked ? 'Connected' : 'Connect'}
                </ThemedText>
              </Pressable>
            </View>
          ))}
        </Card>

>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
        {/* Danger Zone */}
        <Card style={styles.dangerCard}>
          <ThemedText style={styles.dangerTitle}>Danger Zone</ThemedText>
          <ThemedText style={styles.dangerSubtitle}>These actions are irreversible.</ThemedText>
<<<<<<< HEAD
          <Button label="Sign Out" icon="log-out-outline" variant="destructive" onPress={onSignOut} style={{ marginBottom: Spacing.xs + 2 }} />
          <Button label="Delete Account" icon="trash-outline" variant="destructive" onPress={onDeleteAccount} />
=======
          <Pressable style={styles.dangerBtn}>
            <Ionicons name="log-out-outline" size={16} color={DS.statusBad} />
            <ThemedText style={styles.dangerBtnText}>Sign Out</ThemedText>
          </Pressable>
          <Pressable style={[styles.dangerBtn, { marginTop: 6 }]}>
            <Ionicons name="trash-outline" size={16} color={DS.statusBad} />
            <ThemedText style={styles.dangerBtnText}>Delete Account</ThemedText>
          </Pressable>
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
        </Card>

      </ScrollView>
    </View>
  );
}

<<<<<<< HEAD
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
=======
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },
  sectionLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, color: DS.textMuted, marginBottom: 7 },
  input: { backgroundColor: DS.card, borderRadius: 10, borderWidth: 1, borderColor: DS.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: DS.textPrimary },
  pwHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pwSection: { marginTop: 14 },
  saveBtn: { backgroundColor: DS.accent, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  linkedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  linkedLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkedIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  linkedName: { fontSize: 14, color: DS.textPrimary, fontWeight: '500' },
  linkedBtn: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 999, backgroundColor: DS.raised, borderWidth: 1, borderColor: DS.border },
  linkedBtnActive: { backgroundColor: DS.accentDim, borderColor: DS.accent },
  linkedBtnText: { fontSize: 12, fontWeight: '500', color: DS.textSecond },
  linkedBtnTextActive: { color: DS.accent },
  dangerCard: { borderColor: DS.statusBad },
  dangerTitle: { fontSize: 14, fontWeight: '600', color: DS.statusBad, marginBottom: 4 },
  dangerSubtitle: { fontSize: 12, color: DS.textMuted, marginBottom: 14 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: DS.card, borderRadius: 10, borderWidth: 1, borderColor: DS.border },
  dangerBtnText: { fontSize: 14, color: DS.statusBad, fontWeight: '500' },
});
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
