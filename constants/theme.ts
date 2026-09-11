/**
 * FitByte Design System — Monochrome Performance (Binary Luxury).
 * High-Contrast Light Minimalist design system.
 */

import { Platform } from 'react-native';

// ─── Grayscale Palette ────────────────────────────────────────────────────────
export const MONO_FONT = 'JetBrainsMono_400Regular';

export const DS = {
  // Backgrounds & Surfaces (High-Contrast Light Monochrome)
  bg:           '#F9F9F9',   // light canvas
  surface:      '#FFFFFF',   // main cards and headers
  card:         '#FFFFFF',   // nested containers
  raised:       '#F3F3F3',   // chips, badges, secondary surface
  subtle:       '#EEEEEE',   // subtle dividers / active fill
  surfaceDim:   '#DADADA',

  // Borders (Strict 1px border logic)
  border:       '#E5E5E5',   // light structural border
  borderMid:    '#CFC4C5',   // variant border
  borderDark:   '#000000',   // primary focus/active border

  // Text
  textPrimary:  '#1A1C1C',   // primary body / headings
  textSecond:   '#4C4546',   // supporting labels / metadata
  textMuted:    '#7E7576',   // captions, timestamps, placeholders

  // Primary Accent (Pure Black)
  accent:        '#000000',
  accentPressed: '#2F3131',
  accentDim:     '#E2E2E2',

  // Status Colors (Monochrome High Contrast)
  statusGood:    '#1A1C1C',
  statusWarn:    '#4C4546',
  statusBad:     '#BA1A1A',

  statusGoodDim: '#EEEEEE',
  statusWarnDim: '#EEEEEE',
  statusBadDim:  '#FFDAD6',

  // Heatmap / calendar intensity
  hmEmpty:      '#F3F3F3',
  hmLow:        '#E2E2E2',
  hmMid:        '#5E5E5E',
  hmHigh:       '#000000',

  // Ring & Track
  ringTrack:    '#F3F3F3',

  // Overlays
  overlay:      'rgba(0,0,0,0.4)',

  // Typography
  fontMono:     'JetBrainsMono_400Regular',
} as const;

// ─── Colors ───────────────────────────────────────────────────────────────────
const tintColorLight = DS.accent;
const tintColorDark  = DS.accent;

export const Colors = {
  light: {
    text:            DS.textPrimary,
    background:      DS.bg,
    tint:            tintColorLight,
    icon:            DS.textSecond,
    tabIconDefault:  DS.textSecond,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text:            DS.textPrimary,
    background:      DS.bg,
    tint:            tintColorDark,
    icon:            DS.textSecond,
    tabIconDefault:  DS.textSecond,
    tabIconSelected: tintColorDark,
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

// ─── Radius ───────────────────────────────────────────────────────────────────
export const Radius = {
  sm:   4,
  md:   8,
  lg:   16,
  xl:   24,
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

