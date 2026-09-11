import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';

import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
  useFonts,
} from '@expo-google-fonts/jetbrains-mono';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useDS, useThemeMode } from '@/contexts/ThemeContext';
import { UnitsProvider } from '@/contexts/UnitsContext';

/**
 * Redirects between the (auth) and (tabs) groups based on session state, and
 * routes a newly-confirmed account to onboarding before it can reach the
 * tabs at all.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, isRecoverySession } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const DS = useDS();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const onOnboarding = inAuthGroup && segments[1] === 'onboarding';
    const needsOnboarding = isAuthenticated && !!user && !user.onboardingCompleted && !isRecoverySession;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (needsOnboarding && !onOnboarding) {
      router.replace('/(auth)/onboarding');
    } else if (isAuthenticated && !needsOnboarding && !isRecoverySession && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router, user, isRecoverySession]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: DS.bg }}>
        <ActivityIndicator color={DS.accent} />
      </View>
    );
  }

  return <>{children}</>;
}

/** Everything that needs the resolved theme — rendered as a child of ThemeProvider so it can read it. */
function AppShell() {
  const { scheme } = useThemeMode();

  return (
    <AuthProvider>
      <NavigationThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="screens" options={{ headerShown: false }} />
          </Stack>
        </AuthGate>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </NavigationThemeProvider>
    </AuthProvider>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UnitsProvider>
          <AppShell />
        </UnitsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
