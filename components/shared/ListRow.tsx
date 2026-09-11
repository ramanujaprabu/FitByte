/**
 * ListRow — the single consistent row pattern for settings/nav lists.
 * Fixes the inconsistent row heights/padding across account-settings,
 * notifications, privacy-security, etc.
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { DS, MIN_TOUCH_TARGET, Spacing, Typography } from '@/constants/theme';

interface ListRowProps {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sublabel?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  showChevron?: boolean;
  destructive?: boolean;
  isLast?: boolean;
}

export function ListRow({
  icon, label, sublabel, onPress, right, showChevron = true, destructive, isLast,
}: ListRowProps) {
  const content = (
    <View style={[styles.row, !isLast && styles.divider]}>
      {icon && (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={17} color={destructive ? DS.statusBad : DS.textSecond} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <ThemedText style={[Typography.body, { color: destructive ? DS.statusBad : DS.textPrimary }]}>
          {label}
        </ThemedText>
        {!!sublabel && <ThemedText style={styles.sublabel}>{sublabel}</ThemedText>}
      </View>
      {right}
      {showChevron && onPress && !right && (
        <Ionicons name="chevron-forward" size={16} color={DS.textMuted} />
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.6 }}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 4,
    minHeight: MIN_TOUCH_TARGET,
    paddingVertical: Spacing.sm + 2,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: DS.border },
  iconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: DS.raised,
    alignItems: 'center', justifyContent: 'center',
  },
  sublabel: { ...Typography.caption, color: DS.textMuted, marginTop: 2 },
});
