/**
 * LoadingState / ErrorState — the two remaining "system status" patterns.
 * Paired with EmptyState, every screen now has exactly one way to express
 * loading / empty / error instead of three ad-hoc ones.
 */
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button } from '@/components/shared/Button';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Spacing, Typography } from '@/constants/theme';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  return (
    <View style={styles.container}>
      <ActivityIndicator color={DS.accent} />
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="alert-circle-outline" size={24} color={DS.statusBad} />
      </View>
      <ThemedText style={styles.errorMessage}>{message}</ThemedText>
      {onRetry && (
        <Button label="Try again" onPress={onRetry} variant="secondary" fullWidth={false} style={{ marginTop: Spacing.md }} />
      )}
    </View>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg },
    label: { ...Typography.bodySm, color: DS.textSecond, marginTop: Spacing.sm },
    iconWrap: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: DS.statusBadDim,
      alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
    },
    errorMessage: { ...Typography.bodySm, color: DS.textSecond, textAlign: 'center', maxWidth: 260 },
  });
}
