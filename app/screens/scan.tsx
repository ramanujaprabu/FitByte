import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { foodService } from '@/services/api/food';
import { triggerHaptic } from '@/utils/haptics';

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const scanLockRef = useRef(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission, requestPermission]);

  const unlockScanning = () => {
    scanLockRef.current = false;
  };

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;
    triggerHaptic('medium');
    setLookingUp(true);
    try {
      const product = await foodService.lookupBarcode(data);
      if (!product) {
        Alert.alert(
          'Not found',
          `No product found for barcode ${data}. Try searching by name instead.`,
          [{ text: 'OK', onPress: unlockScanning }]
        );
        return;
      }
      router.replace({
        pathname: '/screens/scan-result',
        params: {
          barcode: data,
          name: product.name,
          brand: product.brand ?? '',
          imageUrl: product.imageUrl ?? '',
          servingLabel: product.servingLabel ?? '',
          calories: String(product.calories),
          protein: String(product.protein),
          carbs: String(product.carbs),
          fats: String(product.fats),
        },
      });
    } catch (e: any) {
      Alert.alert('Lookup failed', e?.message ?? 'Could not look up this barcode.', [
        { text: 'OK', onPress: unlockScanning },
      ]);
    } finally {
      setLookingUp(false);
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, styles.permissionContainer]} edges={['top']}>
        <Ionicons name="barcode-outline" size={40} color="#FFFFFF" />
        <ThemedText style={styles.permissionText}>
          Camera access is needed to scan barcodes.
        </ThemedText>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <ThemedText style={styles.permissionBtnText}>Grant Permission</ThemedText>
        </Pressable>
        <Pressable style={styles.permissionBackBtn} onPress={() => router.back()}>
          <ThemedText style={styles.permissionBackText}>Go back</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
        </Pressable>
        <ThemedText style={styles.appTitleHeader}>Barcode Scanner</ThemedText>
        <Pressable style={styles.iconBtn} onPress={() => setFlashEnabled((f) => !f)}>
          <Ionicons name={flashEnabled ? 'flash' : 'flash-outline'} size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Camera Viewfinder */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={flashEnabled}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
          }}
          onBarcodeScanned={lookingUp ? undefined : handleBarcodeScanned}
        />

        {/* Reticle Overlay */}
        <View style={styles.overlayCenter}>
          <View style={styles.barcodeFrame}>
            <View style={styles.scanLine} />
            <ThemedText style={styles.scanHint}>Align barcode within frame</ThemedText>
          </View>
        </View>

        {/* Lookup Overlay Spinner */}
        {lookingUp && (
          <View style={styles.analyzingBackdrop}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <ThemedText style={styles.analyzingText}>LOOKING UP PRODUCT...</ThemedText>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  permissionText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  permissionBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  permissionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  permissionBackBtn: {
    padding: Spacing.sm,
  },
  permissionBackText: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 54,
    backgroundColor: '#000000',
  },
  iconBtn: { padding: 6 },
  appTitleHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCenter: {
    width: '80%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeFrame: {
    width: '100%',
    height: 140,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanLine: {
    width: '90%',
    height: 2,
    backgroundColor: '#FF3B30',
  },
  scanHint: {
    position: 'absolute',
    bottom: -32,
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  analyzingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  analyzingText: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
