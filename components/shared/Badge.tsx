/**
 * Badge — Inline label chip used for tags, states, and metadata.
 * Replaces repeated chip/badge patterns across all screens.
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';

interface BadgeProps extends ViewProps {
  label: string;
  /** Tint the text and border with the accent color */
  accent?: boolean;
}

export function Badge({ label, accent, style, ...rest }: BadgeProps) {
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);

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

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    base: {
      alignSelf: 'flex-start',
      backgroundColor: DS.raised,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    text: {
      fontSize: 12,
      fontWeight: '500',
      color: DS.textSecond,
    },
    accentBorder: {
      backgroundColor: DS.accentDim,
    },
    accentText: {
      color: DS.textPrimary,
    },
  });
}
