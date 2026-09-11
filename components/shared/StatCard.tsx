/**
 * StatCard — Small metric tile with icon, value, and label.
 * Used in quick stats grids across Insights, Workouts, and Profile screens.
 */
<<<<<<< HEAD
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
=======
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  /** Optional override width for flex layouts */
  width?: number | string;
}

export function StatCard({ icon, value, label, width }: StatCardProps) {
<<<<<<< HEAD
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);

=======
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
  return (
    <View style={[styles.card, width !== undefined && { width: width as any }]}>
      <Ionicons name={icon as any} size={16} color={DS.textSecond} />
      <ThemedText style={styles.value}>{value}</ThemedText>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

<<<<<<< HEAD
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
=======
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
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
