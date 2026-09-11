/**
 * Resolved color scheme — respects the user's explicit Light/Dark/System
 * choice (see `contexts/ThemeContext.tsx`), not just the raw OS setting.
 * Kept as its own hook (rather than inlining `useThemeMode()` everywhere)
 * so `hooks/use-theme-color.ts` and any other `Colors.light`/`Colors.dark`
 * consumer keeps working unchanged.
 */
import { useThemeMode } from '@/contexts/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  return useThemeMode().scheme;
}
