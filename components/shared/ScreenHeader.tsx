/**
 * ScreenHeader — Consistent header for secondary screens.
 * Sits below the BackButton with uniform spacing.
 */
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
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
    marginBottom: 24,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: DS.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: DS.textSecond,
    lineHeight: 20,
  },
  right: {
    marginLeft: 12,
  },
});
