/**
 * Card — Base surface container used throughout the app.
<<<<<<< HEAD
 * Soft, low-boxy surface: a subtle shadow instead of a hard 1px border,
 * larger corner radius. Replaces repeated sectionCard/analyticsCard/heroCard
 * patterns.
 */
import React, { useMemo } from 'react';
import { Platform, View, StyleSheet, type ViewProps } from 'react-native';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing } from '@/constants/theme';
=======
 * Replaces repeated sectionCard/analyticsCard/heroCard patterns.
 */
import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { DS } from '@/constants/theme';
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

interface CardProps extends ViewProps {
  /** Tighter padding variant */
  compact?: boolean;
<<<<<<< HEAD
  /** Remove the shadow/elevation */
=======
  /** Remove the border */
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
  borderless?: boolean;
}

export function Card({ compact, borderless, style, children, ...rest }: CardProps) {
<<<<<<< HEAD
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);

=======
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
  return (
    <View
      style={[
        styles.base,
        compact && styles.compact,
        borderless && styles.borderless,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

<<<<<<< HEAD
function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    base: {
      backgroundColor: DS.card,
      borderRadius: Radius.lg,
      padding: Spacing.md + 4,
      marginBottom: Spacing.md,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: DS.bg === '#0B0B0C' ? 0.35 : 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
        android: { elevation: 1 },
        default: {},
      }),
    },
    compact: {
      padding: Spacing.md,
    },
    borderless: {
      shadowOpacity: 0,
      elevation: 0,
    },
  });
}
=======
const styles = StyleSheet.create({
  base: {
    backgroundColor: DS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DS.border,
  },
  compact: {
    padding: 14,
  },
  borderless: {
    borderWidth: 0,
  },
});
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
