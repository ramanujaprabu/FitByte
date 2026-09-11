import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacySecurityScreen() {
  const insets = useSafeAreaInsets();
  const [biometric, setBiometric] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [crashReport, setCrashReport] = useState(true);

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Privacy & Security" subtitle="Control your data and access" />

        <Card>
          <ThemedText style={styles.sectionLabel}>Security</ThemedText>
          {[
            { label: 'Biometric Lock', sub: 'Face ID / Touch ID', val: biometric, set: setBiometric },
          ].map(item => (
            <View key={item.label} style={styles.toggleRow}>
              <View>
                <ThemedText style={styles.toggleTitle}>{item.label}</ThemedText>
                <ThemedText style={styles.toggleSub}>{item.sub}</ThemedText>
              </View>
              <Switch value={item.val} onValueChange={item.set}
                thumbColor={item.val ? DS.accent : DS.textMuted}
                trackColor={{ true: 'rgba(59,130,246,0.3)', false: DS.raised }} />
            </View>
          ))}
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Data & Privacy</ThemedText>
          {[
            { label: 'Usage Analytics', sub: 'Help improve the app', val: analytics, set: setAnalytics },
            { label: 'Crash Reporting', sub: 'Automatically send reports', val: crashReport, set: setCrashReport },
          ].map((item, i) => (
            <View key={item.label} style={[styles.toggleRow, i === 0 && styles.rowBorder]}>
              <View>
                <ThemedText style={styles.toggleTitle}>{item.label}</ThemedText>
                <ThemedText style={styles.toggleSub}>{item.sub}</ThemedText>
              </View>
              <Switch value={item.val} onValueChange={item.set}
                thumbColor={item.val ? DS.accent : DS.textMuted}
                trackColor={{ true: 'rgba(59,130,246,0.3)', false: DS.raised }} />
            </View>
          ))}
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Your Data</ThemedText>
          {[
            { icon: 'download-outline', label: 'Download My Data', sub: 'Get a copy of all your data' },
            { icon: 'document-text-outline', label: 'Privacy Policy', sub: 'View our full privacy policy' },
            { icon: 'shield-outline', label: 'Terms of Service', sub: 'Review terms and conditions' },
          ].map((item, i, arr) => (
            <Pressable key={item.label} style={[styles.linkRow, i < arr.length - 1 && styles.rowBorder]}>
              <View style={styles.linkIcon}>
                <Ionicons name={item.icon as any} size={16} color={DS.textSecond} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.linkTitle}>{item.label}</ThemedText>
                <ThemedText style={styles.linkSub}>{item.sub}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={14} color={DS.textMuted} />
            </Pressable>
          ))}
        </Card>

        <Card style={styles.dangerCard}>
          <ThemedText style={styles.dangerTitle}>Delete All Data</ThemedText>
          <ThemedText style={styles.dangerSub}>
            Permanently delete all your nutrition, workout, and profile data. This cannot be undone.
          </ThemedText>
          <Pressable style={styles.dangerBtn}>
            <Ionicons name="trash-outline" size={16} color={DS.statusBad} />
            <ThemedText style={styles.dangerBtnText}>Delete All My Data</ThemedText>
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
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: DS.border },
  toggleTitle: { fontSize: 14, fontWeight: '500', color: DS.textPrimary },
  toggleSub: { fontSize: 12, color: DS.textMuted, marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  linkIcon: { width: 36, height: 36, borderRadius: 9, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  linkTitle: { fontSize: 14, fontWeight: '500', color: DS.textPrimary },
  linkSub: { fontSize: 11, color: DS.textMuted, marginTop: 1 },
  dangerCard: { borderColor: DS.statusBad },
  dangerTitle: { fontSize: 14, fontWeight: '600', color: DS.statusBad, marginBottom: 6 },
  dangerSub: { fontSize: 13, color: DS.textSecond, lineHeight: 20, marginBottom: 14 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: DS.card, borderRadius: 10, borderWidth: 1, borderColor: DS.border },
  dangerBtnText: { fontSize: 14, color: DS.statusBad, fontWeight: '500' },
});
