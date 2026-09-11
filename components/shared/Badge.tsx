/**
 * Badge — Inline label chip used for tags, states, and metadata.
 * Replaces repeated chip/badge patterns across all screens.
 */
<<<<<<< HEAD
import React, { useMemo } from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';

interface BadgeProps extends ViewProps {
  label: string;
  /** Tint the text and border with the accent color */
=======
import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';

interface BadgeProps extends ViewProps {
  label: string;
  /** Tint the text and border with accent blue */
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
  accent?: boolean;
}

export function Badge({ label, accent, style, ...rest }: BadgeProps) {
<<<<<<< HEAD
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);

=======
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
