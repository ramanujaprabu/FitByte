import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const FRAME_WIDTH = width * 0.78;
const FRAME_HEIGHT = height * 0.42;

export default function FoodCaptureScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const previewAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => { requestPermission(); }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.015, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (capturedImage) {
      Animated.spring(previewAnim, { toValue: 0, useNativeDriver: true }).start();
    }
  }, [capturedImage]);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync();
    setCapturedImage(photo.uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1,
    });
    if (!result.canceled) setCapturedImage(result.assets[0].uri);
  };

  const handleAnalyze = () => {
    router.push({
      pathname: '/screens/scan-result',
      params: { imageUri: capturedImage ?? '' },
    });
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DS.textSecond} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIconWrap}>
          <Ionicons name="camera-outline" size={36} color={DS.textSecond} />
        </View>
        <ThemedText type="title" style={styles.permissionTitle}>Camera Access</ThemedText>
        <ThemedText style={styles.permissionSubtitle}>
          Allow camera access to capture meals and analyze nutrition.
        </ThemedText>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <ThemedText style={styles.permissionButtonText}>Grant Permission</ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject}
        facing={facing} enableTorch={flashEnabled} />
      <View style={styles.overlay} />

      {/* TOP BAR */}
      <BlurView intensity={30} tint="dark" style={[styles.topBar, { top: insets.top + 8 }]}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <ThemedText style={styles.topTitle}>Scan Meal</ThemedText>
        <View style={styles.topRight}>
          <Pressable style={styles.iconButton} onPress={() => setFlashEnabled(!flashEnabled)}>
            <Ionicons name={flashEnabled ? 'flash' : 'flash-off'} size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <Pressable style={styles.iconButton}
            onPress={() => setFacing(prev => (prev === 'back' ? 'front' : 'back'))}>
            <Ionicons name="camera-reverse-outline" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={pickImage}>
            <Ionicons name="images-outline" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>
      </BlurView>

      {/* CAMERA FRAME */}
      <View style={styles.centerContainer}>
        <Animated.View style={[styles.captureFrame, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
        </Animated.View>
        <ThemedText style={styles.frameText}>Position your meal inside the frame</ThemedText>
      </View>

      {/* PREVIEW CARD */}
      {capturedImage && (
        <Animated.View style={[styles.previewWrapper, { transform: [{ translateY: previewAnim }] }]}>
          <BlurView intensity={50} tint="dark" style={styles.previewCard}>
            <View style={styles.previewTop}>
              <View>
                <ThemedText style={styles.previewTitle}>Photo captured</ThemedText>
                <ThemedText style={styles.previewSubtitle}>Ready for analysis</ThemedText>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setCapturedImage(null)}>
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>
            <Image source={capturedImage} style={styles.previewImage} contentFit="cover" />
            <View style={styles.previewActions}>
              <Pressable style={styles.secondaryButton} onPress={() => setCapturedImage(null)}>
                <Ionicons name="refresh-outline" size={16} color="rgba(255,255,255,0.8)" />
                <ThemedText style={styles.secondaryButtonText}>Retake</ThemedText>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={handleAnalyze}>
                <Ionicons name="sparkles-outline" size={16} color="#fff" />
                <ThemedText style={styles.primaryButtonText}>Analyze Meal</ThemedText>
              </Pressable>
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* BOTTOM BAR */}
      <BlurView intensity={30} tint="dark" style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.bottomActions}>
          <Pressable style={styles.smallAction} onPress={pickImage}>
            <Ionicons name="images-outline" size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.captureInner} />
            </Pressable>
          </Animated.View>
          <Pressable style={styles.smallAction} onPress={() => router.push('/screens/add-food')}>
            <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>
        <View style={styles.shortcutRow}>
          {[
            { icon: 'restaurant-outline', label: 'Food Mode', action: () => { } },
            { icon: 'time-outline', label: 'Recent', action: () => router.push('/screens/meal-history') },
            { icon: 'sparkles-outline', label: 'AI Analysis', action: () => router.push('/screens/scan-result') },
          ].map(s => (
            <Pressable key={s.label} style={styles.shortcutChip} onPress={s.action}>
              <Ionicons name={s.icon as any} size={13} color="rgba(255,255,255,0.5)" />
              <ThemedText style={styles.shortcutText}>{s.label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: DS.bg, justifyContent: 'center', alignItems: 'center' },
  permissionContainer: { flex: 1, backgroundColor: DS.bg, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  permissionIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: DS.surface, borderWidth: 1, borderColor: DS.border, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  permissionTitle: { marginBottom: 12, color: DS.textPrimary, textAlign: 'center' },
  permissionSubtitle: { color: DS.textSecond, textAlign: 'center', lineHeight: 22, fontSize: 14 },
  permissionButton: { marginTop: 28, backgroundColor: DS.accent, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  permissionButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  topBar: { position: 'absolute', top: 8, left: 16, right: 16, borderRadius: 16, overflow: 'hidden', padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topTitle: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  topRight: { flexDirection: 'row', gap: 6 },
  iconButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  captureFrame: { width: FRAME_WIDTH, height: FRAME_HEIGHT, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', position: 'relative' },
  cornerTL: { position: 'absolute', top: -1, left: -1, width: 48, height: 48, borderTopWidth: 2, borderLeftWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderTopLeftRadius: 20 },
  cornerTR: { position: 'absolute', top: -1, right: -1, width: 48, height: 48, borderTopWidth: 2, borderRightWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderTopRightRadius: 20 },
  cornerBL: { position: 'absolute', bottom: -1, left: -1, width: 48, height: 48, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderBottomLeftRadius: 20 },
  cornerBR: { position: 'absolute', bottom: -1, right: -1, width: 48, height: 48, borderBottomWidth: 2, borderRightWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderBottomRightRadius: 20 },
  frameText: { marginTop: 20, color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '500' },
  previewWrapper: { position: 'absolute', left: 16, right: 16, bottom: 170 },
  previewCard: { borderRadius: 20, overflow: 'hidden', padding: 18 },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  previewTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  previewSubtitle: { marginTop: 4, fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: 200, borderRadius: 14 },
  previewActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  secondaryButton: { flex: 1, height: 50, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  secondaryButtonText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 14 },
  primaryButton: { flex: 1.4, height: 50, borderRadius: 12, backgroundColor: DS.accent, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 20, overflow: 'hidden' },
  bottomActions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 32 },
  smallAction: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  captureButton: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
  shortcutRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 18 },
  shortcutChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  shortcutText: { color: 'rgba(255,255,255,0.5)', fontWeight: '500', fontSize: 12 },
});