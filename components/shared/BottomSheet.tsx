/**
 * BottomSheet — Animated slide-up panel with backdrop dismiss.
 * Uses react-native Animated API, no extra library needed.
 */
import { useDS } from '@/contexts/ThemeContext';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Override sheet height — default is 'auto' */
  height?: number;
  style?: ViewStyle;
}

export function BottomSheet({ visible, onClose, children, height, style }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          height ? { height } : undefined,
          { paddingBottom: insets.bottom + 20, transform: [{ translateY: slideAnim }] },
          style,
        ]}>
        {/* Handle */}
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </Modal>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: DS.overlay,
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: DS.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: DS.borderMid,
      alignSelf: 'center',
      marginBottom: 20,
    },
  });
}
