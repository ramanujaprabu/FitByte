import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEVICES = [
  { id: 'apple_watch', name: 'Apple Watch', icon: 'watch-outline', sub: 'Series 9 · Series 10', connected: true },
  { id: 'apple_health', name: 'Apple Health', icon: 'heart-outline', sub: 'Read steps, sleep, HR', connected: true },
  { id: 'fitbit', name: 'Fitbit', icon: 'fitness-outline', sub: 'Charge 6 · Sense 2', connected: false },
  { id: 'garmin', name: 'Garmin', icon: 'compass-outline', sub: 'Forerunner · Fenix', connected: false },
  { id: 'whoop', name: 'WHOOP', icon: 'pulse-outline', sub: 'Strap 4.0 · Recovery data', connected: false },
];

const SYNC_ITEMS = [
  { id: 'steps', label: 'Steps & Distance', default: true },
  { id: 'sleep', label: 'Sleep Data', default: true },
  { id: 'heart', label: 'Heart Rate', default: true },
  { id: 'calories', label: 'Active Calories', default: true },
  { id: 'workout', label: 'Workout Sessions', default: false },
];

export default function ConnectedDevicesScreen() {
  const insets = useSafeAreaInsets();
  const [devices, setDevices] = useState<Record<string, boolean>>(
    Object.fromEntries(DEVICES.map(d => [d.id, d.connected]))
  );
  const [syncToggles, setSyncToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(SYNC_ITEMS.map(s => [s.id, s.default]))
  );

  const toggleDevice = (id: string) => setDevices(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSync = (id: string) => setSyncToggles(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Connected Devices" subtitle="Sync with your wearables" />

        <Card>
          <ThemedText style={styles.sectionLabel}>Available Devices</ThemedText>
          {DEVICES.map((device, i) => (
            <View key={device.id} style={[styles.deviceRow, i < DEVICES.length - 1 && styles.rowBorder]}>
              <View style={styles.deviceIcon}>
                <Ionicons name={device.icon as any} size={18} color={DS.textSecond} />
              </View>
              <View style={styles.deviceInfo}>
                <ThemedText style={styles.deviceName}>{device.name}</ThemedText>
                <ThemedText style={styles.deviceSub}>{device.sub}</ThemedText>
              </View>
              <Pressable
                onPress={() => toggleDevice(device.id)}
                style={[styles.connectBtn, devices[device.id] && styles.connectedBtn]}>
                <ThemedText style={[styles.connectBtnText, devices[device.id] && styles.connectedBtnText]}>
                  {devices[device.id] ? 'Connected' : 'Connect'}
                </ThemedText>
              </Pressable>
            </View>
          ))}
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Sync Settings</ThemedText>
          {SYNC_ITEMS.map((item, i) => (
            <View key={item.id} style={[styles.syncRow, i < SYNC_ITEMS.length - 1 && styles.rowBorder]}>
              <ThemedText style={styles.syncLabel}>{item.label}</ThemedText>
              <Switch value={syncToggles[item.id]} onValueChange={() => toggleSync(item.id)}
                thumbColor={syncToggles[item.id] ? DS.accent : DS.textMuted}
                trackColor={{ true: 'rgba(59,130,246,0.3)', false: DS.raised }} />
            </View>
          ))}
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },
  sectionLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: DS.border },
  deviceIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 14, fontWeight: '500', color: DS.textPrimary },
  deviceSub: { fontSize: 11, color: DS.textMuted, marginTop: 2 },
  connectBtn: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, backgroundColor: DS.raised, borderWidth: 1, borderColor: DS.border },
  connectedBtn: { backgroundColor: DS.accentDim, borderColor: DS.accent },
  connectBtnText: { fontSize: 12, fontWeight: '500', color: DS.textSecond },
  connectedBtnText: { color: DS.accent },
  syncRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  syncLabel: { fontSize: 14, color: DS.textPrimary },
});
