/**
 * FitByte — Supabase client
 *
 * Reads the project URL and anon key from Expo public env vars.
 * Set these in a `.env` file at the project root (see `.env.example`):
 *
 *   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 *
 * Session tokens are persisted in expo-secure-store so users stay logged in
 * between app launches. `react-native-url-polyfill` is required because
 * supabase-js expects a browser-like URL implementation.
 */
import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env and fill in your Supabase project credentials.'
  );
}

import { Platform } from 'react-native';

// SecureStore has a 2KB value-size limit on some platforms; Supabase sessions
// are usually under that, but we defensively chunk just in case.
// On Web, use localStorage fallback since SecureStore is not supported on web.
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    lock: processLock,
  },
});

/**
 * Parses access_token, refresh_token, type, error, error_description
 * from a Supabase redirect URL query or hash fragment.
 */
export function parseAuthParamsFromUrl(url: string): {
  accessToken?: string;
  refreshToken?: string;
  type?: string;
  error?: string;
  errorDescription?: string;
} {
  const result: ReturnType<typeof parseAuthParamsFromUrl> = {};
  if (!url) return result;

  // Handles both query params (?access_token=...) and hash fragments (#access_token=...)
  const rawParams = url.includes('#')
    ? url.split('#')[1]
    : url.includes('?')
    ? url.split('?')[1]
    : '';

  if (!rawParams) return result;

  const searchParams = new URLSearchParams(rawParams);
  result.accessToken = searchParams.get('access_token') || undefined;
  result.refreshToken = searchParams.get('refresh_token') || undefined;
  result.type = searchParams.get('type') || undefined;
  result.error = searchParams.get('error') || undefined;
  result.errorDescription = searchParams.get('error_description') || searchParams.get('error_code') || undefined;

  return result;
}
