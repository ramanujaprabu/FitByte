/**
 * SegmentedControl — replaces the ad-hoc horizontal chip-scroll filters
 * (meal filters, date-range toggles) with one consistent selector.
 */
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Typography } from '@/constants/theme';

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);

  return (
    <View style={styles.track}>
      {options.map(opt => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.segment, active && styles.segmentActive]}>
            <ThemedText
              numberOfLines={1}
              style={[Typography.label, { color: active ? DS.accentText : DS.textSecond }]}>
              {opt}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    track: {
      flexDirection: 'row',
      backgroundColor: DS.raised,
      borderRadius: Radius.full,
      padding: 3,
    },
    segment: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: Radius.full,
      alignItems: 'center',
    },
    segmentActive: {
      backgroundColor: DS.accent,
    },
  });
}
