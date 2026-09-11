/**
 * RingProgress — the app's signature visual element.
 *
 * A single, precise progress ring (not three overlapping Apple-Watch-style
 * rings — that's someone else's mark). Used for the one primary metric per
 * screen: calories today, weekly workout goal, macro-of-focus. Everything
 * else uses the flat ProgressBar. One bold element, used consistently,
 * beats a bar chart of gimmicks.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { DS } from '@/constants/theme';

interface RingProgressProps {
  progress: number;      // 0–1, values >1 are clamped (visually capped, not overflowed)
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export function RingProgress({
  progress,
  size = 120,
  strokeWidth = 10,
  color = DS.accent,
  trackColor = DS.ringTrack,
  children,
}: RingProgressProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          // Start from 12 o'clock, not 3 o'clock.
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children && <View style={styles.center}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
