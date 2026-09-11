/**
 * StatCard — Small metric tile with icon, value, and label.
 * Used in quick stats grids across Insights, Workouts, and Profile screens.
 */
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  /** Optional override width for flex layouts */
  width?: number | string;
}

export function StatCard({ icon, value, label, width }: StatCardProps) {
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);

  return (
    <View style={[styles.card, width !== undefined && { width: width as any }]}>
      <Ionicons name={icon as any} size={16} color={DS.textSecond} />
      <ThemedText style={styles.value}>{value}</ThemedText>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: DS.surface,
      borderRadius: 16,
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
}
