/**
 * screens/_layout.tsx — Stack navigator for all secondary screens.
 * All screens here are full-screen (no tab bar) with custom headers disabled.
 */
import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="add-food" />
      <Stack.Screen name="trackfood" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="voice-log" />
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
    </Stack>
  );
}
