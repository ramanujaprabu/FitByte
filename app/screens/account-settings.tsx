import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import { MOCK_USER } from '@/data/profile';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(MOCK_USER.name);
  const [email, setEmail] = useState(MOCK_USER.email);
  const [showPwSection, setShowPwSection] = useState(false);

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Account Settings" subtitle="Manage your account details" />

        <Card>
          <ThemedText style={styles.sectionLabel}>Account Info</ThemedText>
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
        </Card>

        <Card>
          <Pressable onPress={() => setShowPwSection(v => !v)} style={styles.pwHeader}>
            <ThemedText style={styles.sectionLabel}>Change Password</ThemedText>
            <Ionicons name={showPwSection ? 'chevron-up' : 'chevron-down'} size={16} color={DS.textMuted} />
          </Pressable>
          {showPwSection && (
            <View style={styles.pwSection}>
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
            </View>
          )}
        </Card>

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

        {/* Danger Zone */}
        <Card style={styles.dangerCard}>
          <ThemedText style={styles.dangerTitle}>Danger Zone</ThemedText>
          <ThemedText style={styles.dangerSubtitle}>These actions are irreversible.</ThemedText>
          <Pressable style={styles.dangerBtn}>
            <Ionicons name="log-out-outline" size={16} color={DS.statusBad} />
            <ThemedText style={styles.dangerBtnText}>Sign Out</ThemedText>
          </Pressable>
          <Pressable style={[styles.dangerBtn, { marginTop: 6 }]}>
            <Ionicons name="trash-outline" size={16} color={DS.statusBad} />
            <ThemedText style={styles.dangerBtnText}>Delete Account</ThemedText>
          </Pressable>
        </Card>

      </ScrollView>
    </View>
  );
}

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
