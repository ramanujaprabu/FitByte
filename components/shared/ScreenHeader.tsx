/**
 * ScreenHeader — Consistent header for secondary screens.
 * Sits below the BackButton with uniform spacing.
 */
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Spacing, Typography } from '@/constants/theme';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, rightElement }: ScreenHeaderProps) {
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);

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

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
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
}
