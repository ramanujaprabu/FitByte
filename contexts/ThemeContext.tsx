/**
 * FitByte — Theme context.
 *
 * Real dark/light mode: the user can pin "Light" or "Dark", or leave it on
 * "System" to follow the OS appearance. The chosen mode is persisted so it
 * survives app restarts. `useDS()` is the reactive replacement for the
 * static `DS` export in `constants/theme.ts` — any component that calls it
 * re-renders with the right palette when the mode or system appearance
 * changes.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';

import { DarkDS, LightDS, type DesignTokens } from '@/constants/theme';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedScheme = 'light' | 'dark';

const STORAGE_KEY = '@fitbyte_theme_mode';

interface ThemeContextValue {
  /** The user's stored preference. */
  mode: ThemeMode;
  /** What's actually being shown right now, after resolving "system". */
  scheme: ResolvedScheme;
  colors: DesignTokens;
  setMode: (mode: ThemeMode) => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveScheme(mode: ThemeMode, systemScheme: ColorSchemeName): ResolvedScheme {
  if (mode === 'light' || mode === 'dark') return mode;
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));

    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => sub.remove();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const scheme = resolveScheme(mode, systemScheme);
  const colors = scheme === 'dark' ? DarkDS : LightDS;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, scheme, colors, setMode, isLoaded }),
    [mode, scheme, colors, setMode, isLoaded]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within a ThemeProvider');
  return ctx;
}

/** Reactive design tokens — use this instead of the static `DS` import wherever the UI should follow the theme. */
export function useDS(): DesignTokens {
  return useThemeMode().colors;
}
