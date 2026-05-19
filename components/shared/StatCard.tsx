/**
 * StatCard — Small metric tile with icon, value, and label.
 * Used in quick stats grids across Insights, Workouts, and Profile screens.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  /** Optional override width for flex layouts */
  width?: number | string;
}

export function StatCard({ icon, value, label, width }: StatCardProps) {
  return (
    <View style={[styles.card, width !== undefined && { width: width as any }]}>
      <Ionicons name={icon as any} size={16} color={DS.textSecond} />
      <ThemedText style={styles.value}>{value}</ThemedText>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: DS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DS.border,
    padding: 14,
    gap: 5,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: DS.textPrimary,
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    color: DS.textMuted,
  },
});
