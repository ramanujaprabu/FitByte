<<<<<<< HEAD
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
=======
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
  useFonts,
} from '@expo-google-fonts/jetbrains-mono';

<<<<<<< HEAD
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
=======
import { useColorScheme } from '@/hooks/use-color-scheme';
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
<<<<<<< HEAD
  useFonts({
=======
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
  });

<<<<<<< HEAD
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UnitsProvider>
          <AppShell />
        </UnitsProvider>
=======
  // Render app once fonts are loaded (splash screen handles the wait)
  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="screens" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" />
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
