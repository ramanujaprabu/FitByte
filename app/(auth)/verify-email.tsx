import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/shared/Button';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { triggerHaptic } from '@/utils/haptics';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { resendVerificationEmail } = useAuth();

  const userEmail = email || 'your email';
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onOpenEmailApp = async () => {
    triggerHaptic('selection');
    try {
      await Linking.openURL('mailto:');
    } catch {
      setError('Could not open default mail app.');
    }
  };

  const onResendEmail = async () => {
    if (cooldown > 0 || resending) return;
    triggerHaptic('medium');
    setResending(true);
    setError(null);
    setFeedback(null);
    try {
      await resendVerificationEmail(userEmail);
      setFeedback('A new verification link has been sent to your email.');
      setCooldown(60);
    } catch (e: any) {
      setError(e?.message || 'Could not resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-unread-outline" size={32} color={DS.textPrimary} />
          </View>

          <ThemedText style={styles.brandTitle}>FitByte</ThemedText>
          <ThemedText style={styles.title}>Check your email</ThemedText>

          <ThemedText style={styles.subtitle}>
            We sent a verification link to:
          </ThemedText>

          <View style={styles.emailBadge}>
            <ThemedText style={styles.emailText}>{userEmail}</ThemedText>
          </View>

          <ThemedText style={styles.bodyText}>
            Click the link in the email to verify your account and continue to FitByte.
          </ThemedText>

          {!!feedback && <ThemedText style={styles.feedbackText}>{feedback}</ThemedText>}
          {!!error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

          <Button
            label="Open email app"
            onPress={onOpenEmailApp}
            style={styles.primaryBtn}
          />

          <Button
            label={cooldown > 0 ? `Resend email (${cooldown}s)` : 'Resend email'}
            variant="secondary"
            onPress={onResendEmail}
            disabled={cooldown > 0 || resending}
            loading={resending}
            style={styles.secondaryBtn}
          />

          <Pressable
            onPress={() => {
              triggerHaptic('light');
              router.replace('/(auth)/signup');
            }}
            style={styles.changeEmailRow}
            hitSlop={8}>
            <ThemedText style={styles.changeEmailText}>
              Entered wrong email? <ThemedText style={styles.linkAccent}>Change email</ThemedText>
            </ThemedText>
          </Pressable>
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
      backgroundColor: DS.raised,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    brandTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    title: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -0.5,
      marginBottom: Spacing.xs,
    },
    subtitle: {
      fontSize: 14,
      color: DS.textSecond,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    emailBadge: {
      backgroundColor: DS.raised,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: Radius.full,
      marginBottom: Spacing.md,
    },
    emailText: {
      fontSize: 14,
      fontWeight: '600',
      color: DS.textPrimary,
    },
    bodyText: {
      fontSize: 13,
      color: DS.textMuted,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: Spacing.lg,
    },
    feedbackText: {
      ...Typography.bodySm,
      color: DS.statusGood,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    errorText: {
      ...Typography.bodySm,
      color: DS.statusBad,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    primaryBtn: {
      width: '100%',
      height: 48,
      marginBottom: Spacing.sm,
    },
    secondaryBtn: {
      width: '100%',
      height: 48,
      marginBottom: Spacing.lg,
    },
    changeEmailRow: {
      alignItems: 'center',
    },
    changeEmailText: {
      fontSize: 14,
      color: DS.textSecond,
    },
    linkAccent: {
      color: DS.textPrimary,
      fontWeight: '600',
    },
  });
}
