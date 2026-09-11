/**
 * EmptyState — the one pattern for "nothing here yet" across the app.
 * An empty screen is an invitation to act, not a dead end — so this always
 * supports an optional primary action.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button } from '@/components/shared/Button';
import { ThemedText } from '@/components/themed-text';
import { DS, Spacing, Typography } from '@/constants/theme';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={DS.textMuted} />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {!!message && <ThemedText style={styles.message}>{message}</ThemedText>}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} style={{ marginTop: Spacing.md }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  title: { ...Typography.titleSm, color: DS.textPrimary, marginBottom: Spacing.xs },
  message: { ...Typography.bodySm, color: DS.textSecond, textAlign: 'center', maxWidth: 260 },
});
