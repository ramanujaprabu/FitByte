import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/shared/Button';
import { TextField } from '@/components/shared/TextField';
import { ThemedText } from '@/components/themed-text';
import { useDS } from '@/contexts/ThemeContext';
import { Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message ?? 'Could not log in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.innerContainer}>
          <View style={styles.content}>
            {/* Brand Logo Header */}
            <View style={styles.brandHeader}>
              <ThemedText style={styles.brandTitle}>FitByte</ThemedText>
            </View>

            <View style={styles.header}>
              <ThemedText style={styles.title}>Sign In</ThemedText>
            </View>

            {/* Email Field */}
            <TextField
              label="EMAIL"
              placeholder="name@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password Field Header with Forgot Password */}
            <View style={styles.passwordHeader}>
              <Pressable onPress={() => router.push('/(auth)/forgot-password' as any)} hitSlop={8}>
                <ThemedText style={styles.forgotText}>Forgot Password?</ThemedText>
              </Pressable>
            </View>

            <TextField
              label="PASSWORD"
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
            />

            {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}

            <Button
              label="Sign In"
              onPress={onSubmit}
              loading={loading}
              style={styles.submitBtn}
            />

            <Pressable onPress={() => router.push('/(auth)/signup')} style={styles.linkRow} hitSlop={8}>
              <ThemedText style={styles.linkText}>
                Don&apos;t have an account? <ThemedText style={styles.linkAccent}>Sign Up</ThemedText>
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
    innerContainer: {
      width: '100%',
      maxWidth: 400,
      paddingHorizontal: Spacing.lg,
      alignSelf: 'center',
    },
    content: {
      width: '100%',
    },
    brandHeader: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    brandTitle: {
      fontSize: 40,
      lineHeight: 48,
      fontWeight: '700',
      color: DS.textPrimary,
      letterSpacing: -1,
    },
    header: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    title: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600',
      color: DS.textPrimary,
      letterSpacing: -0.5,
    },
    passwordHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: -Spacing.xs,
    },
    forgotText: {
      fontSize: 13,
      color: DS.textSecond,
    },
    error: {
      ...Typography.bodySm,
      color: DS.statusBad,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    submitBtn: {
      marginTop: Spacing.sm,
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
