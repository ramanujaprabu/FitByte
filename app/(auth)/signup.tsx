import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/shared/Button';
import { TextField } from '@/components/shared/TextField';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupScreen() {
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !password) {
      setError('Fill in your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.push({
        pathname: '/(auth)/verify-email' as any,
        params: { email: email.trim() },
      });
    } catch (e: any) {
      const message = e?.message ?? 'Could not create account.';
      if (message.toLowerCase().includes('confirm')) {
        router.push({
          pathname: '/(auth)/verify-email' as any,
          params: { email: email.trim() },
        });
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.centerContainer}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText style={styles.brandTitle}>FitByte</ThemedText>
              <ThemedText style={styles.title}>Create Account</ThemedText>
            </View>

            {/* Inputs */}
            <TextField
              label="FULL NAME"
              placeholder="Jane Doe"
              value={name}
              onChangeText={setName}
            />

            <TextField
              label="EMAIL"
              placeholder="jane@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextField
              label="PASSWORD"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <ThemedText style={styles.termsText}>
              By signing up, you agree to our Terms and Privacy Policy.
            </ThemedText>

            {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}
            {!!info && <ThemedText style={styles.info}>{info}</ThemedText>}

            <Button
              label="Create Account"
              onPress={onSubmit}
              loading={loading}
              style={styles.submitBtn}
            />

            <Pressable onPress={() => router.back()} style={styles.linkRow} hitSlop={8}>
              <ThemedText style={styles.linkText}>
                Already have an account? <ThemedText style={styles.linkAccent}>Sign In</ThemedText>
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    flex: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    centerContainer: {
      width: '100%',
      maxWidth: 480,
      paddingHorizontal: Spacing.md,
      alignSelf: 'center',
    },
    card: {
      backgroundColor: DS.surface,
      borderRadius: Radius.xl,
      padding: Spacing.lg + 4,
      width: '100%',
    },
    header: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    brandTitle: {
      fontSize: 40,
      lineHeight: 48,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -1,
      marginBottom: Spacing.xs,
    },
    title: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600',
      color: DS.textPrimary,
      letterSpacing: -0.5,
    },
    termsText: {
      fontSize: 12,
      color: DS.textSecond,
      textAlign: 'center',
      marginTop: Spacing.xs,
      marginBottom: Spacing.md,
    },
    error: {
      ...Typography.bodySm,
      color: DS.statusBad,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    info: {
      ...Typography.bodySm,
      color: DS.statusGood,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    submitBtn: {
      marginTop: Spacing.xs,
      height: 48,
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
