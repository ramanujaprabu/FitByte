import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FORMATS = ['PDF Report', 'CSV Spreadsheet', 'JSON Data'];
const RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'All Time'];

export default function ExportDataScreen() {
  const insets = useSafeAreaInsets();
  const [format, setFormat] = useState('PDF Report');
  const [range, setRange] = useState('Last 30 Days');
  const [inclNut, setInclNut] = useState(true);
  const [inclWkt, setInclWkt] = useState(true);
  const [inclBody, setInclBody] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 2000);
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Export Data" subtitle="Download your health records" />

        <Card>
          <ThemedText style={styles.sectionLabel}>Export Format</ThemedText>
          {FORMATS.map(f => (
            <Pressable key={f} onPress={() => setFormat(f)} style={styles.radioRow}>
              <View style={[styles.radioOuter, format === f && styles.radioActive]}>
                {format === f && <View style={styles.radioInner} />}
              </View>
              <ThemedText style={styles.radioText}>{f}</ThemedText>
            </Pressable>
          ))}
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Date Range</ThemedText>
          <View style={styles.rangeGrid}>
            {RANGES.map(r => (
              <Pressable key={r} onPress={() => setRange(r)}
                style={[styles.rangeChip, range === r && styles.rangeChipActive]}>
                <ThemedText style={[styles.rangeText, range === r && styles.rangeTextActive]}>{r}</ThemedText>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Include Data</ThemedText>
          {[
            { label: 'Nutrition & Meals', val: inclNut, set: setInclNut },
            { label: 'Workout Sessions', val: inclWkt, set: setInclWkt },
            { label: 'Body Measurements', val: inclBody, set: setInclBody },
          ].map((row, i, arr) => (
            <View key={row.label} style={[styles.toggleRow, i < arr.length - 1 && styles.toggleBorder]}>
              <ThemedText style={styles.toggleLabel}>{row.label}</ThemedText>
              <Switch value={row.val} onValueChange={row.set}
                thumbColor={row.val ? DS.accent : DS.textMuted}
                trackColor={{ true: 'rgba(59,130,246,0.3)', false: DS.raised }} />
            </View>
          ))}
        </Card>

        <Pressable
          onPress={handleExport}
          style={({ pressed }) => [styles.exportBtn, pressed && { opacity: 0.8 }]}>
          <Ionicons name={exporting ? 'hourglass-outline' : 'download-outline'} size={18} color="#fff" />
          <ThemedText style={styles.exportBtnText}>
            {exporting ? 'Generating…' : `Export ${format}`}
          </ThemedText>
        </Pressable>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={14} color={DS.textMuted} />
          <ThemedText style={styles.noteText}>
            Your data is exported securely. Files are deleted from our servers after 24 hours.
          </ThemedText>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },
  sectionLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: DS.accent },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: DS.accent },
  radioText: { fontSize: 14, color: DS.textPrimary },
  rangeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rangeChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: DS.card, borderWidth: 1, borderColor: DS.border },
  rangeChipActive: { backgroundColor: DS.accent, borderColor: DS.accent },
  rangeText: { fontSize: 13, fontWeight: '500', color: DS.textSecond },
  rangeTextActive: { color: '#fff', fontWeight: '600' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  toggleBorder: { borderBottomWidth: 1, borderBottomColor: DS.border },
  toggleLabel: { fontSize: 14, color: DS.textPrimary },
  exportBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: DS.accent, paddingVertical: 15, borderRadius: 14, marginBottom: 12 },
  exportBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingHorizontal: 4 },
  noteText: { flex: 1, fontSize: 12, color: DS.textMuted, lineHeight: 18 },
});
