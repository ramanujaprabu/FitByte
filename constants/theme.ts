/**
 * FitByte Design System — Monochrome Performance (Binary Luxury).
 * Grayscale palette with a single black/white binary accent, in a real
 * light and dark variant. The token *names* and the grayscale identity are
 * shared between both — only the light/dark luminance direction differs
 * (dark mode is the inverted binary: white becomes the primary accent).
 */

import { Platform } from 'react-native';

export const MONO_FONT = 'JetBrainsMono_400Regular';

export interface DesignTokens {
  bg: string;
  surface: string;
  card: string;
  raised: string;
  subtle: string;
  surfaceDim: string;

  border: string;
  borderMid: string;
  borderDark: string;

  textPrimary: string;
  textSecond: string;
  textMuted: string;

  accent: string;
  accentPressed: string;
  accentDim: string;
  /** Text/icon color to place on top of `accent`. */
  accentText: string;

  statusGood: string;
  statusWarn: string;
  statusBad: string;
  statusGoodDim: string;
  statusWarnDim: string;
  statusBadDim: string;

  hmEmpty: string;
  hmLow: string;
  hmMid: string;
  hmHigh: string;

  ringTrack: string;
  overlay: string;
  fontMono: string;
}

// ─── Light palette (default) ───────────────────────────────────────────────
export const LightDS: DesignTokens = {
  bg:           '#F9F9F9',
  surface:      '#FFFFFF',
  card:         '#FFFFFF',
  raised:       '#F3F3F3',
  subtle:       '#EEEEEE',
  surfaceDim:   '#DADADA',

  border:       '#E5E5E5',
  borderMid:    '#CFC4C5',
  borderDark:   '#000000',

  textPrimary:  '#1A1C1C',
  textSecond:   '#4C4546',
  textMuted:    '#7E7576',

  accent:        '#000000',
  accentPressed: '#2F3131',
  accentDim:     '#E2E2E2',
  accentText:    '#FFFFFF',

  statusGood:    '#1A1C1C',
  statusWarn:    '#4C4546',
  statusBad:     '#BA1A1A',
  statusGoodDim: '#EEEEEE',
  statusWarnDim: '#EEEEEE',
  statusBadDim:  '#FFDAD6',

  hmEmpty:      '#F3F3F3',
  hmLow:        '#E2E2E2',
  hmMid:        '#5E5E5E',
  hmHigh:       '#000000',

  ringTrack:    '#F3F3F3',
  overlay:      'rgba(0,0,0,0.4)',
  fontMono:     'JetBrainsMono_400Regular',
};

// ─── Dark palette — the inverted binary, same grayscale identity ──────────
export const DarkDS: DesignTokens = {
  bg:           '#0B0B0C',
  surface:      '#161617',
  card:         '#18181A',
  raised:       '#212123',
  subtle:       '#28282A',
  surfaceDim:   '#333336',

  border:       '#2A2A2D',
  borderMid:    '#3D3739',
  borderDark:   '#FFFFFF',

  textPrimary:  '#F2F2F2',
  textSecond:   '#B3ACAD',
  textMuted:    '#847C7E',

  accent:        '#FFFFFF',
  accentPressed: '#D4D4D4',
  accentDim:     '#2A2A2A',
  accentText:    '#0B0B0C',

  statusGood:    '#F2F2F2',
  statusWarn:    '#B3ACAD',
  statusBad:     '#FF6B61',
  statusGoodDim: '#242426',
  statusWarnDim: '#242426',
  statusBadDim:  '#3A1512',

  hmEmpty:      '#212123',
  hmLow:        '#3D3739',
  hmMid:        '#847C7E',
  hmHigh:       '#FFFFFF',

  ringTrack:    '#242426',
  overlay:      'rgba(0,0,0,0.65)',
  fontMono:     'JetBrainsMono_400Regular',
};

/**
 * Static, light-mode token export for code that hasn't been converted to
 * `useDS()` yet (module-scope `StyleSheet.create` calls can't react to the
 * theme anyway). Prefer `useDS()` from `@/contexts/ThemeContext` in any
 * component that should respond to the dark/light setting.
 */
export const DS = LightDS;

// ─── Colors (react-navigation / expo-router boilerplate) ──────────────────
export const Colors = {
  light: {
    text:            LightDS.textPrimary,
    background:      LightDS.bg,
    card:            LightDS.surface,
    border:          LightDS.border,
    tint:            LightDS.accent,
    icon:            LightDS.textSecond,
    tabIconDefault:  LightDS.textSecond,
    tabIconSelected: LightDS.accent,
  },
  dark: {
    text:            DarkDS.textPrimary,
    background:      DarkDS.bg,
    card:            DarkDS.surface,
    border:          DarkDS.border,
    tint:            DarkDS.accent,
    icon:            DarkDS.textSecond,
    tabIconDefault:  DarkDS.textSecond,
    tabIconSelected: DarkDS.accent,
  },
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const Typography = {
  displayLg:  { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  displayMd:  { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  titleLg:    { fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.2 },
  titleMd:    { fontSize: 18, fontWeight: '600' as const },
  titleSm:    { fontSize: 15, fontWeight: '600' as const },
  body:       { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySm:     { fontSize: 13, fontWeight: '400' as const, lineHeight: 20 },
  label:      { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.5, textTransform: 'uppercase' as const },
  caption:    { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

// ─── Spacing (8pt scale) ───────────────────────────────────────────────────────
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ─── Radius — soft, non-boxy shapes ────────────────────────────────────────
export const Radius = {
  sm:   10,
  md:   16,
  lg:   22,
  xl:   28,
  full: 999,
};

// ─── Touch targets ─────────────────────────────────────────────────────────────
export const HitSlop = { top: 8, bottom: 8, left: 8, right: 8 };
export const MIN_TOUCH_TARGET = 44;

// ─── Fonts ────────────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:    "Geist, JetBrainsMono_400Regular, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
