/**
 * FitByte Design System — Grayscale-first with minimal blue accent.
 * Blue is reserved strictly for: primary buttons, active tab, selected states.
 */

import { Platform } from 'react-native';

// ─── Grayscale Palette ────────────────────────────────────────────────────────
export const MONO_FONT = 'JetBrainsMono_400Regular';

export const DS = {
  // Backgrounds
  bg:           '#0A0A0A',   // near-black page background
  surface:      '#111111',   // charcoal — section card
  card:         '#161616',   // graphite — nested card
  raised:       '#1C1C1C',   // dark gray — chips, badges, inputs
  subtle:       '#222222',   // very subtle elevation

  // Borders
  border:       '#252525',   // low-contrast separator
  borderMid:    '#2E2E2E',   // slightly stronger

  // Text
  textPrimary:  '#E8E8E8',   // off-white — headings, values
  textSecond:   '#8A8A8A',   // medium gray — labels, secondary info
  textMuted:    '#555555',   // low contrast — captions, timestamps

  // Accent — blue, used SPARINGLY
  accent:       '#3B82F6',   // blue — primary buttons, active tab, selected state only
  accentDim:    'rgba(59,130,246,0.12)',

  // Status (muted, non-neon)
  statusGood:   '#4A7C59',   // muted sage green
  statusWarn:   '#8A6C3A',   // muted amber
  statusBad:    '#7A3D3D',   // muted red

  // Heatmap / calendar grayscale intensity
  hmEmpty:      '#1C1C1C',
  hmLow:        '#303030',
  hmMid:        '#555555',
  hmHigh:       '#C0C0C0',

  // Typography
  fontMono:     'JetBrainsMono_400Regular',
} as const;

// ─── Legacy Colors (kept for useThemeColor hook compatibility) ─────────────────
const tintColorLight = DS.accent;
const tintColorDark  = DS.accent;

export const Colors = {
  light: {
    text:            '#11181C',
    background:      '#ffffff',
    tint:            tintColorLight,
    icon:            '#555555',
    tabIconDefault:  '#555555',
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
  displayLg:  { fontSize: 32, fontWeight: '600' as const, letterSpacing: -0.5 },
  displayMd:  { fontSize: 28, fontWeight: '600' as const, letterSpacing: -0.3 },
  titleLg:    { fontSize: 22, fontWeight: '600' as const },
  titleMd:    { fontSize: 18, fontWeight: '600' as const },
  titleSm:    { fontSize: 15, fontWeight: '600' as const },
  body:       { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySm:     { fontSize: 13, fontWeight: '400' as const, lineHeight: 20 },
  caption:    { fontSize: 12, fontWeight: '400' as const },
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
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
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  full: 999,
};

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
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
