/**
 * Card — Base surface container used throughout the app.
 * Replaces repeated sectionCard/analyticsCard/heroCard patterns.
 */
import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { DS } from '@/constants/theme';

interface CardProps extends ViewProps {
  /** Tighter padding variant */
  compact?: boolean;
  /** Remove the border */
  borderless?: boolean;
}

export function Card({ compact, borderless, style, children, ...rest }: CardProps) {
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
