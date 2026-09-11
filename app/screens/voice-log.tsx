import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { foodService, type FoodSearchResult } from '@/services/api/food';
import { nutritionService } from '@/services/api/nutrition';
import { triggerHaptic } from '@/utils/haptics';
import { parseFoodTranscript } from '@/utils/voiceFoodParser';
import type { MealType } from '@/types';

const MEAL_OPTIONS: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const BAR_COUNT = 28;

type Phase = 'idle' | 'listening' | 'processing' | 'review' | 'error';

interface ReviewItem {
  key: string;
  raw: string;
  quantity: number;
  matched: FoodSearchResult | null;
}

function defaultMealByTime(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return 'Breakfast';
  if (hour < 16) return 'Lunch';
  if (hour < 21) return 'Dinner';
  return 'Snacks';
}

export default function VoiceLogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ meal?: string }>();
  const selectedMeal: MealType = MEAL_OPTIONS.includes(params.meal as MealType)
    ? (params.meal as MealType)
    : defaultMealByTime();

  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(0));
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);
  const transcriptRef = useRef('');

  // Stop any in-progress recognition if the screen is left mid-listen.
  useEffect(() => {
    return () => {
      try { ExpoSpeechRecognitionModule.abort(); } catch {}
    };
  }, []);

  useSpeechRecognitionEvent('start', () => setPhase('listening'));

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    transcriptRef.current = text;
    setTranscript(text);
  });

  useSpeechRecognitionEvent('volumechange', (event) => {
    const normalized = Math.max(0, Math.min(1, (event.value + 2) / 12));
    setBars((prev) => [...prev.slice(1), normalized]);
  });

  useSpeechRecognitionEvent('error', (event) => {
    setPhase('error');
    setErrorMsg(
      event.error === 'not-allowed'
        ? 'Microphone or speech recognition permission was denied.'
        : event.error === 'no-speech'
        ? "Didn't catch anything — try again."
        : `Speech recognition error: ${event.message || event.error}`
    );
  });

  const processTranscript = useCallback(async (text: string) => {
    setPhase('processing');
    const parsed = parseFoodTranscript(text);
    if (parsed.length === 0) {
      setPhase('error');
      setErrorMsg(`Couldn't make out any food items in "${text}".`);
      return;
    }

    const results = await Promise.all(
      parsed.map(async (item) => {
        try {
          const matches = await foodService.search(item.name);
          return matches[0] ?? null;
        } catch {
          return null;
        }
      })
    );

    setReviewItems(
      parsed.map((item, idx) => ({
        key: `${item.raw}-${idx}`,
        raw: item.raw,
        quantity: item.quantity,
        matched: results[idx],
      }))
    );
    setPhase('review');
  }, []);

  useSpeechRecognitionEvent('end', () => {
    const finalText = transcriptRef.current.trim();
    setBars(Array(BAR_COUNT).fill(0));
    if (!finalText) {
      setPhase('error');
      setErrorMsg("Didn't catch anything — try again.");
      return;
    }
    processTranscript(finalText);
  });

  const startListening = async () => {
    setErrorMsg(null);
    setTranscript('');
    transcriptRef.current = '';
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setPhase('error');
      setErrorMsg('Microphone or speech recognition permission was denied.');
      return;
    }
    triggerHaptic('medium');
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: true,
      volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
    });
  };

  const stopListening = () => {
    triggerHaptic('light');
    ExpoSpeechRecognitionModule.stop();
  };

  const removeReviewItem = (key: string) => {
    setReviewItems((prev) => prev.filter((i) => i.key !== key));
  };

  const onConfirmLog = async () => {
    const loggable = reviewItems.filter((i) => i.matched);
    if (loggable.length === 0) return;
    setLogging(true);
    try {
      await Promise.all(
        loggable.map((item) => {
          const m = item.matched!;
          return nutritionService.logFood({
            name: m.name,
            meal: selectedMeal,
            calories: Math.round(m.calories * item.quantity),
            protein: Math.round(m.protein * item.quantity),
            carbs: Math.round(m.carbs * item.quantity),
            fats: Math.round(m.fats * item.quantity),
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            imageUrl: m.imageUrl ?? '',
          });
        })
      );
      triggerHaptic('success');
      router.back();
    } finally {
      setLogging(false);
    }
  };

  const reset = () => {
    setPhase('idle');
    setTranscript('');
    setErrorMsg(null);
    setReviewItems([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topHeader}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Voice Log · {selectedMeal}</ThemedText>
        <View style={styles.iconBtn} />
      </View>

      {phase === 'review' ? (
        <ScrollView contentContainerStyle={[styles.reviewScroll, { paddingBottom: insets.bottom + 40 }]}>
          <ThemedText style={styles.transcriptLabel}>YOU SAID</ThemedText>
          <ThemedText style={styles.transcriptText}>&quot;{transcript}&quot;</ThemedText>

          <ThemedText style={[styles.transcriptLabel, { marginTop: Spacing.lg }]}>DETECTED ITEMS</ThemedText>
          {reviewItems.map((item) => (
            <View key={item.key} style={styles.reviewRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.reviewName} numberOfLines={1}>
                  {item.matched ? item.matched.name : item.raw}
                </ThemedText>
                <ThemedText style={styles.reviewSub}>
                  {item.matched
                    ? `x${item.quantity} · ${Math.round(item.matched.calories * item.quantity)} kcal`
                    : 'No match found — will be skipped'}
                </ThemedText>
              </View>
              <Pressable onPress={() => removeReviewItem(item.key)} style={{ padding: 6 }}>
                <Ionicons name="close-circle" size={20} color="#666666" />
              </Pressable>
            </View>
          ))}

          <Pressable
            style={[styles.primaryBtn, reviewItems.every((i) => !i.matched) && styles.primaryBtnDisabled]}
            disabled={logging || reviewItems.every((i) => !i.matched)}
            onPress={onConfirmLog}>
            {logging ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <ThemedText style={styles.primaryBtnText}>Log to {selectedMeal}</ThemedText>
            )}
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={reset}>
            <ThemedText style={styles.secondaryBtnText}>Try Again</ThemedText>
          </Pressable>
        </ScrollView>
      ) : (
        <View style={styles.centerStage}>
          {phase === 'processing' ? (
            <>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <ThemedText style={styles.statusText}>Matching foods…</ThemedText>
            </>
          ) : (
            <>
              <View style={styles.waveformRow}>
                {bars.map((v, i) => (
                  <View key={i} style={[styles.waveBar, { height: 6 + v * 60 }]} />
                ))}
              </View>

              <ThemedText style={styles.statusText}>
                {phase === 'listening'
                  ? transcript || 'Listening…'
                  : phase === 'error'
                  ? errorMsg
                  : 'Tap the mic and say what you ate'}
              </ThemedText>

              <Pressable
                style={[styles.micBtn, phase === 'listening' && styles.micBtnActive]}
                onPress={phase === 'listening' ? stopListening : startListening}>
                <Ionicons name={phase === 'listening' ? 'stop' : 'mic'} size={28} color="#000000" />
              </Pressable>

              {phase === 'error' && (
                <Pressable style={styles.retryLink} onPress={reset}>
                  <ThemedText style={styles.retryLinkText}>Try again</ThemedText>
                </Pressable>
              )}
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 54,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centerStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 70,
    width: '100%',
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    minHeight: 20,
  },
  micBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: {
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  retryLink: {
    padding: Spacing.sm,
  },
  retryLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  reviewScroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  transcriptText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  reviewName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewSub: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  secondaryBtnText: {
    fontSize: 13,
    color: '#999999',
  },
});
