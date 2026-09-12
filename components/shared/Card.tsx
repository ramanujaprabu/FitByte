/**
 * Card — Base surface container used throughout the app.
 * Soft, low-boxy surface: a subtle shadow instead of a hard 1px border,
 * larger corner radius. Replaces repeated sectionCard/analyticsCard/heroCard
 * patterns.
 */
import React, { useMemo } from 'react';
import { Platform, View, StyleSheet, type ViewProps } from 'react-native';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  /** Tighter padding variant */
  compact?: boolean;
  /** Remove the shadow/elevation */
  borderless?: boolean;
}

export function Card({ compact, borderless, style, children, ...rest }: CardProps) {
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);

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
