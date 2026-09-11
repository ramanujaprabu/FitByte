/**
 * Avatar — user photo with graceful initials fallback (no broken-image icon).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
}

export function Avatar({ uri, name, size = 56 }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('') || '?';

  const dims = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={uri} style={dims} contentFit="cover" />;
  }

  return (
    <View style={[styles.fallback, dims]}>
      <ThemedText style={{ color: DS.textPrimary, fontSize: size * 0.36, fontWeight: '600' }}>
        {initials}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: DS.raised,
    borderWidth: 1,
    borderColor: DS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
