/**
 * ProgressBar — Reusable thin progress indicator.
 * Replaces repeated progressBackground/progressFill patterns across screens.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useDS } from '@/contexts/ThemeContext';

interface ProgressBarProps {
  /** Value between 0 and 1 */
  progress: number;
  /** Override fill color (defaults to the theme's accent) */
  color?: string;
  /** Bar height in pixels */
  height?: number;
}

export function ProgressBar({ progress, color, height = 4 }: ProgressBarProps) {
  const DS = useDS();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const fillColor = color ?? DS.accent;

  return (
    <View style={[styles.track, { height, backgroundColor: DS.ringTrack }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: fillColor,
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
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
});
