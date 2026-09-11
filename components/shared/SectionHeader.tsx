/**
 * SectionHeader — Consistent row header with title + optional right action.
 * Replaces repeated sectionHeader style patterns across screens.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  rightElement?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, rightLabel, rightElement }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View>
        <ThemedText type="subtitle">{title}</ThemedText>
        {subtitle ? (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        ) : null}
      </View>

      {rightElement ?? (
        rightLabel ? (
          <ThemedText style={styles.rightLabel}>{rightLabel}</ThemedText>
        ) : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: DS.textMuted,
  },
  rightLabel: {
    fontSize: 13,
    color: DS.textMuted,
  },
});
