/**
 * Button — the single button primitive for the whole app.
 * Variants: primary (accent fill), secondary (soft surface), ghost (text-only),
 * destructive (for delete/remove actions). Replaces the one-off
 * Pressable+StyleSheet button blocks that were duplicated per screen.
 */
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing, Typography, MIN_TOUCH_TARGET } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'md' | 'sm';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const isDisabled = disabled || loading;

  const textColor =
    variant === 'primary' ? DS.accentText :
    variant === 'destructive' ? DS.statusBad :
    DS.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'destructive' && styles.destructive,
        fullWidth && { alignSelf: 'stretch' },
        !fullWidth && { alignSelf: 'flex-start' },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={size === 'sm' ? 15 : 17} color={textColor} />}
          <ThemedText style={[Typography.titleSm, { color: textColor, fontWeight: '600' }]}>{label}</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    base: {
      minHeight: MIN_TOUCH_TARGET,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.lg,
    },
    sm: {
      minHeight: 36,
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.full,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs + 2,
    },
    primary: { backgroundColor: DS.accent },
    secondary: { backgroundColor: DS.raised },
    ghost: { backgroundColor: 'transparent' },
    destructive: { backgroundColor: DS.statusBadDim },
    disabled: { opacity: 0.45 },
    pressed: { opacity: 0.85 },
  });
}
