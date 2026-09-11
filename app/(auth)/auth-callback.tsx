import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/shared/Button';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/api/auth';
import { parseAuthParamsFromUrl, supabase } from '@/lib/supabase';
import { triggerHaptic } from '@/utils/haptics';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const rawParams = useLocalSearchParams();
  const { setIsRecoverySession, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const url = await Linking.getInitialURL();
        const parsed = url ? parseAuthParamsFromUrl(url) : {};

        const accessToken = (rawParams.access_token as string) || parsed.accessToken;
        const refreshToken = (rawParams.refresh_token as string) || parsed.refreshToken;
        const type = (rawParams.type as string) || parsed.type;
        const error = (rawParams.error_description as string) || (rawParams.error as string) || parsed.errorDescription || parsed.error;

        if (error) {
          setErrorMsg(decodeURIComponent(error));
          setLoading(false);
          return;
        }

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) {
            setErrorMsg(sessionError.message);
            setLoading(false);
            return;
          }
        }

        // Refresh user context state
        await refreshUser();

        if (type === 'recovery') {
          setIsRecoverySession(true);
          triggerHaptic('success');
          router.replace('/(auth)/update-password' as any);
          return;
        }

        // Normal email confirmation / signup redirect — send a freshly
        // confirmed account to onboarding instead of straight to the tabs.
        triggerHaptic('success');
        const current = await authService.getCurrentUser();
        router.replace(current && !current.onboardingCompleted ? '/(auth)/onboarding' : '/(tabs)');
      } catch (err: any) {
        setErrorMsg(err?.message || 'Authentication link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.card}>
            <ActivityIndicator size="large" color={DS.accent} style={{ marginBottom: Spacing.md }} />
            <ThemedText style={styles.title}>Verifying authentication...</ThemedText>
            <ThemedText style={styles.subtitle}>Please wait while we confirm your session.</ThemedText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="alert-circle-outline" size={36} color={DS.statusBad} />
          </View>

          <ThemedText style={styles.title}>Link Expired or Invalid</ThemedText>

          <ThemedText style={styles.subtitle}>
            {errorMsg || 'The authentication link you followed is invalid, incomplete, or has already been used.'}
          </ThemedText>

          {!!errorMsg && (
            <View style={styles.errorBox}>
              <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
            </View>
          )}

          <Button
            label="Request a new link"
            onPress={() => router.replace('/(auth)/forgot-password' as any)}
            style={styles.primaryBtn}
          />

          <Button
            label="Back to login"
            variant="ghost"
            onPress={() => router.replace('/(auth)/login')}
            style={{ width: '100%' }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: DS.bg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerContainer: {
      width: '100%',
      maxWidth: 440,
      paddingHorizontal: Spacing.md,
      alignSelf: 'center',
    },
    card: {
      backgroundColor: DS.surface,
      borderRadius: Radius.xl,
      padding: Spacing.lg + 4,
      alignItems: 'center',
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: DS.statusBadDim,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    title: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -0.5,
      marginBottom: Spacing.xs,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: DS.textSecond,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: Spacing.md,
    },
    errorBox: {
      backgroundColor: DS.statusBadDim,
      borderRadius: Radius.sm,
      padding: Spacing.sm,
      marginBottom: Spacing.md,
      width: '100%',
    },
    errorText: {
      ...Typography.bodySm,
      color: DS.statusBad,
      textAlign: 'center',
    },
    primaryBtn: {
      width: '100%',
      height: 48,
      marginBottom: Spacing.xs,
    },
  });
}
