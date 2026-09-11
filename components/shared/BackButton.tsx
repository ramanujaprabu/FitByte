/**
 * BackButton — Floating top-left back navigation button.
 * Use on all secondary/sub-pages. NOT on primary tab roots.
 */
<<<<<<< HEAD
import React, { useMemo } from 'react';
=======
import React from 'react';
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
<<<<<<< HEAD
import { useDS } from '@/contexts/ThemeContext';
import { MIN_TOUCH_TARGET } from '@/constants/theme';
=======
import { DS } from '@/constants/theme';
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

interface BackButtonProps {
  /** Override top position (defaults to insets.top + 12) */
  top?: number;
  /** Override left position (defaults to 16) */
  left?: number;
  /** Custom handler instead of router.back() */
  onPress?: () => void;
}

export function BackButton({ top, left = 16, onPress }: BackButtonProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
<<<<<<< HEAD
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
=======
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.btn,
        { top: top ?? insets.top + 12, left },
        pressed && styles.pressed,
      ]}
      hitSlop={8}>
      <Ionicons name="arrow-back" size={18} color={DS.textPrimary} />
    </Pressable>
  );
}

<<<<<<< HEAD
function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    btn: {
      position: 'absolute',
      zIndex: 100,
      width: MIN_TOUCH_TARGET,
      height: MIN_TOUCH_TARGET,
      borderRadius: MIN_TOUCH_TARGET / 2,
      backgroundColor: DS.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...(DS.bg === '#0B0B0C'
        ? {}
        : { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }),
    },
    pressed: {
      opacity: 0.6,
      transform: [{ scale: 0.95 }],
    },
  });
}
=======
const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DS.surface,
    borderWidth: 1,
    borderColor: DS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
});
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
