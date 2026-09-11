/**
 * ProgressBar — Reusable thin progress indicator.
 * Replaces repeated progressBackground/progressFill patterns across screens.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DS } from '@/constants/theme';

interface ProgressBarProps {
  /** Value between 0 and 1 */
  progress: number;
  /** Override fill color (defaults to DS.textSecond) */
  color?: string;
  /** Bar height in pixels */
  height?: number;
}

export function ProgressBar({ progress, color = DS.accent, height = 4 }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    backgroundColor: DS.ringTrack,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
});
