/**
 * screens/_layout.tsx — Stack navigator for all secondary screens.
 * All screens here are full-screen (no tab bar) with custom headers disabled.
 */
import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
<<<<<<< HEAD
      <Stack.Screen name="trackfood" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="voice-log" />
      <Stack.Screen name="food-detail" />
      <Stack.Screen name="meal-detail" />
      <Stack.Screen name="meal-history" />
      <Stack.Screen name="scan-result" />
      <Stack.Screen name="workout-detail" />
      <Stack.Screen name="create-routine" />
      <Stack.Screen name="exercise-picker" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="session-detail" />
      <Stack.Screen name="recent-activities" />
      {/* Swipe-back is disabled here so an accidental swipe can't discard a
          logged workout — Cancel/Finish (both with a confirm) are the only
          way out. */}
      <Stack.Screen name="log-workout" options={{ gestureEnabled: false }} />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="edit-goals" />
      <Stack.Screen name="account-settings" />
=======
      <Stack.Screen name="add-food" />
      <Stack.Screen name="food-detail" />
      <Stack.Screen name="meal-history" />
      <Stack.Screen name="macro-breakdown" />
      <Stack.Screen name="scan-result" />
      <Stack.Screen name="daily-analytics" />
      <Stack.Screen name="export-data" />
      <Stack.Screen name="workout-detail" />
      <Stack.Screen name="create-routine" />
      <Stack.Screen name="recent-activities" />
      <Stack.Screen name="log-workout" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="account-settings" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="ai-preferences" />
      <Stack.Screen name="connected-devices" />
      <Stack.Screen name="premium" />
      <Stack.Screen name="privacy-security" />
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
    </Stack>
  );
}
