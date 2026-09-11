/**
 * SegmentedControl — replaces the ad-hoc horizontal chip-scroll filters
 * (meal filters, date-range toggles) with one consistent selector.
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DS, Radius, Typography } from '@/constants/theme';

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
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
              style={[Typography.label, { color: active ? '#FFFFFF' : DS.textSecond }]}>
              {opt}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: DS.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: DS.border,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: DS.accent,
  },
});
