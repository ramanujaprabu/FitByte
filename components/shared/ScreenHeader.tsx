/**
 * ScreenHeader — Consistent header for secondary screens.
 * Sits below the BackButton with uniform spacing.
 */
import { ThemedText } from '@/components/themed-text';
<<<<<<< HEAD
import { useDS } from '@/contexts/ThemeContext';
import { Spacing, Typography } from '@/constants/theme';
import React, { useMemo } from 'react';
=======
import { DS } from '@/constants/theme';
import React from 'react';
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
import { StyleSheet, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, rightElement }: ScreenHeaderProps) {
<<<<<<< HEAD
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);

=======
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
