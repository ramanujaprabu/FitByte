import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/shared/Button';
import { TextField } from '@/components/shared/TextField';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { triggerHaptic } from '@/utils/haptics';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    triggerHaptic('medium');
    setError(null);
    setLoading(true);
    try {
      await resetPasswordForEmail(email.trim());
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message || 'Could not send password reset link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.centerContainer}>
          <View style={styles.card}>
            {/* Top Back Header */}
            <Pressable
              onPress={() => router.back()}
              style={styles.backBtn}
              hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color={DS.textPrimary} />
            </Pressable>

            {!submitted ? (
              <>
                <View style={styles.header}>
                  <ThemedText style={styles.brandTitle}>FitByte</ThemedText>
                  <ThemedText style={styles.title}>Forgot your password?</ThemedText>
                  <ThemedText style={styles.subtitle}>
                    Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                  </ThemedText>
                </View>

                <TextField
                  label="EMAIL"
                  placeholder="name@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />

                {!!error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

                <Button
                  label="Send reset link"
                  onPress={onSubmit}
                  loading={loading}
                  style={styles.submitBtn}
                />

                <Pressable
                  onPress={() => router.push('/(auth)/login')}
                  style={styles.linkRow}
                  hitSlop={8}>
                  <ThemedText style={styles.linkText}>
                    Remembered your password? <ThemedText style={styles.linkAccent}>Sign In</ThemedText>
                  </ThemedText>
                </Pressable>
              </>
            ) : (
              /* Confirmation State */
              <View style={{ alignItems: 'center' }}>
                <View style={styles.iconCircle}>
                  <Ionicons name="key-outline" size={32} color={DS.textPrimary} />
                </View>

                <ThemedText style={styles.title}>Check your email</ThemedText>
                <ThemedText style={styles.subtitle}>
                  We sent a password reset link to:
                </ThemedText>

                <View style={styles.emailBadge}>
                  <ThemedText style={styles.emailText}>{email}</ThemedText>
                </View>

                <ThemedText style={styles.bodyText}>
                  Follow the link in your email to create a new password.
                </ThemedText>

                <Button
                  label="Resend link"
                  variant="secondary"
                  onPress={onSubmit}
                  loading={loading}
                  style={styles.primaryBtn}
                />

                <Button
                  label="Back to login"
                  variant="ghost"
                  onPress={() => router.push('/(auth)/login')}
                  style={{ width: '100%' }}
                />
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: DS.bg,
    },
    flex: {
      flex: 1,
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
      width: '100%',
    },
    backBtn: {
      alignSelf: 'flex-start',
      padding: 4,
      marginBottom: Spacing.md,
    },
    header: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
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
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: DS.textSecond,
      textAlign: 'center',
      lineHeight: 20,
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
    emailBadge: {
      backgroundColor: DS.raised,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: Radius.full,
      marginVertical: Spacing.sm,
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
    errorText: {
      ...Typography.bodySm,
      color: DS.statusBad,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    submitBtn: {
      marginTop: Spacing.xs,
      height: 48,
    },
    primaryBtn: {
      width: '100%',
      height: 48,
      marginBottom: Spacing.xs,
    },
    linkRow: {
      marginTop: Spacing.xl,
      alignItems: 'center',
    },
    linkText: {
      fontSize: 14,
      color: DS.textSecond,
    },
    linkAccent: {
      color: DS.textPrimary,
      fontWeight: '600',
    },
  });
}
