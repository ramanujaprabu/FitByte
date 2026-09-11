/**
 * ScreenHeader — Consistent header for secondary screens.
 * Sits below the BackButton with uniform spacing.
 */
import { ThemedText } from '@/components/themed-text';
import { DS, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, rightElement }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        ) : null}
      </View>
      {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  left: {
    flex: 1,
  },
  title: {
    ...Typography.displayMd,
    color: DS.textPrimary,
  },
  subtitle: {
    marginTop: Spacing.xs,
    ...Typography.bodySm,
    color: DS.textSecond,
  },
  right: {
    marginLeft: Spacing.sm + 4,
  },
});
