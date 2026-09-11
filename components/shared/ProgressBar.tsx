/**
 * ProgressBar — Reusable thin progress indicator.
 * Replaces repeated progressBackground/progressFill patterns across screens.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
<<<<<<< HEAD
import { useDS } from '@/contexts/ThemeContext';
=======
import { DS } from '@/constants/theme';
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

interface ProgressBarProps {
  /** Value between 0 and 1 */
  progress: number;
<<<<<<< HEAD
  /** Override fill color (defaults to the theme's accent) */
=======
  /** Override fill color (defaults to DS.textSecond) */
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
  color?: string;
  /** Bar height in pixels */
  height?: number;
}

<<<<<<< HEAD
export function ProgressBar({ progress, color, height = 4 }: ProgressBarProps) {
  const DS = useDS();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const fillColor = color ?? DS.accent;

  return (
    <View style={[styles.track, { height, backgroundColor: DS.ringTrack }]}>
=======
export function ProgressBar({ progress, color = DS.textSecond, height = 4 }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.track, { height }]}>
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
<<<<<<< HEAD
            backgroundColor: fillColor,
=======
            backgroundColor: color,
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
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
<<<<<<< HEAD
=======
    backgroundColor: DS.raised,
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
});
