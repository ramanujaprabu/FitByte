/**
 * MonoText — JetBrains Mono wrapper for numeric/data values.
 * Use for: calories, macros, streaks, dates, chart values, scores.
 * Do NOT use for long body text or descriptions.
 */
import { useDS } from '@/contexts/ThemeContext';
import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

interface MonoTextProps extends TextProps {
  style?: TextStyle | TextStyle[];
  bold?: boolean;
}

export function MonoText({ style, bold, children, ...rest }: MonoTextProps) {
  const DS = useDS();
  return (
    <Text
      style={[
        {
          fontFamily: bold ? 'JetBrainsMono_600SemiBold' : DS.fontMono,
          color: DS.textPrimary,
        },
        style,
      ]}
      {...rest}>
      {children}
    </Text>
  );
}
