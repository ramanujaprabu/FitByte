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

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
  const { isRecoverySession, updatePassword, isAuthenticated } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    triggerHaptic('medium');
    setError(null);
    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      triggerHaptic('success');
    } catch (e: any) {
      setError(e?.message || 'Could not update password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Route protection: Guard access if no active session/recovery flow
  if (!isRecoverySession && !isAuthenticated && !success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.card}>
            <View style={styles.iconCircleWarn}>
              <Ionicons name="warning-outline" size={32} color={DS.statusBad} />
            </View>
            <ThemedText style={styles.title}>Invalid Access</ThemedText>
            <ThemedText style={styles.subtitle}>
              You must click a valid password recovery link from your email to access this page.
            </ThemedText>
            <Button
              label="Request a new link"
              onPress={() => router.replace('/(auth)/forgot-password' as any)}
              style={styles.submitBtn}
            />
            <Button
              label="Back to login"
              variant="ghost"
              onPress={() => router.replace('/(auth)/login')}
              style={{ width: '100%', marginTop: 8 }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.centerContainer}>
          <View style={styles.card}>
            {!success ? (
              <>
                <View style={styles.header}>
                  <ThemedText style={styles.brandTitle}>FitByte</ThemedText>
                  <ThemedText style={styles.title}>Create a new password</ThemedText>
                  <ThemedText style={styles.subtitle}>
                    Enter your new password below.
                  </ThemedText>
                </View>

                {/* Password field with toggle icon */}
                <View style={styles.passwordFieldWrapper}>
                  <TextField
                    label="NEW PASSWORD"
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={8}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={DS.textSecond}
                    />
                  </Pressable>
                </View>

                <TextField
                  label="CONFIRM NEW PASSWORD"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                {/* Password requirements checklist */}
                <View style={styles.reqContainer}>
                  <View style={styles.reqRow}>
                    <Ionicons
                      name={password.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={password.length >= 6 ? DS.textPrimary : DS.textMuted}
                    />
                    <ThemedText style={styles.reqText}>At least 6 characters</ThemedText>
                  </View>

                  <View style={styles.reqRow}>
                    <Ionicons
                      name={password && password === confirmPassword ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={password && password === confirmPassword ? DS.textPrimary : DS.textMuted}
                    />
                    <ThemedText style={styles.reqText}>Passwords match</ThemedText>
                  </View>
                </View>

                {!!error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

                <Button
                  label="Update password"
                  onPress={onSubmit}
                  loading={loading}
                  style={styles.submitBtn}
                />
              </>
            ) : (
              /* Success confirmation state */
              <View style={{ alignItems: 'center' }}>
                <View style={styles.iconCircleSuccess}>
                  <Ionicons name="checkmark-circle-outline" size={36} color={DS.textPrimary} />
                </View>

                <ThemedText style={styles.title}>Password updated</ThemedText>
                <ThemedText style={styles.subtitle}>
                  Your password has been updated successfully. You can now sign in with your new password.
                </ThemedText>

                <Button
                  label={isAuthenticated ? 'Continue to App' : 'Sign In'}
                  onPress={() => router.replace(isAuthenticated ? '/(tabs)' : '/(auth)/login')}
                  style={styles.submitBtn}
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
    passwordFieldWrapper: {
      position: 'relative',
    },
    eyeBtn: {
      position: 'absolute',
      right: Spacing.md,
      top: 36,
    },
    reqContainer: {
      backgroundColor: DS.raised,
      borderRadius: Radius.md,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      gap: 8,
    },
    reqRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    reqText: {
      fontSize: 13,
      color: DS.textSecond,
    },
    iconCircleWarn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: DS.statusBadDim,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
      alignSelf: 'center',
    },
    iconCircleSuccess: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: DS.raised,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    errorText: {
      ...Typography.bodySm,
      color: DS.statusBad,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    submitBtn: {
      width: '100%',
      marginTop: Spacing.xs,
      height: 48,
    },
  });
}
