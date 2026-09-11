/**
 * Badge — Inline label chip used for tags, states, and metadata.
 * Replaces repeated chip/badge patterns across all screens.
 */
import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';

interface BadgeProps extends ViewProps {
  label: string;
  /** Tint the text and border with accent blue */
  accent?: boolean;
}

export function Badge({ label, accent, style, ...rest }: BadgeProps) {
  return (
    <View
      style={[
        styles.base,
        accent && styles.accentBorder,
        style,
      ]}
      {...rest}>
      <ThemedText style={[styles.text, accent && styles.accentText]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    backgroundColor: DS.raised,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: DS.border,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: DS.textSecond,
  },
  accentBorder: {
    borderColor: DS.accent,
  },
  accentText: {
    color: DS.accent,
  },
});
