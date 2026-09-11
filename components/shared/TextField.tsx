/**
 * TextField — labeled text input with consistent border/radius/focus state.
 * Replaces raw <TextInput> + inline styles duplicated across auth/settings screens.
 */
import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Fonts, Radius, Spacing, Typography } from '@/constants/theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
        placeholderTextColor={DS.textMuted}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        {...rest}
      />
      {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}
    </View>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    wrap: { marginBottom: Spacing.md },
    label: {
      fontFamily: Fonts.mono,
      fontSize: 12,
      fontWeight: '600',
      color: DS.textSecond,
      marginBottom: Spacing.xs,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    input: {
      backgroundColor: DS.raised,
      borderWidth: 1,
      borderColor: 'transparent',
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 4,
      color: DS.textPrimary,
      fontSize: 15,
      minHeight: 48,
    },
    inputFocused: { borderColor: DS.borderDark },
    inputError: { borderColor: DS.statusBad },
    error: { ...Typography.caption, color: DS.statusBad, marginTop: Spacing.xs },
  });
}
