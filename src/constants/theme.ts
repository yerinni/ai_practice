/**
 * Design tokens — see docs/design-system.md for the full style guide
 * (palette rationale, typography scale, component rules). Update both
 * together so the doc never drifts from what the code actually uses.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Snapchat-inspired: signature yellow as the single brand/action color,
// used only as a filled background (never as text/icon color on a light
// surface — #FFFC00 on white has too little contrast to read).
export const Colors = {
  light: {
    text: '#121314',
    textSecondary: '#53575B',
    background: '#FFFFFF',
    backgroundElement: '#F0F1F2',
    backgroundSelected: '#E4E5E7',
    accent: '#FFFC00',
    accentText: '#000000',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#C7C7CC',
    background: '#121314',
    backgroundElement: '#3A3E41',
    backgroundSelected: '#4C5155',
    accent: '#FFFC00',
    accentText: '#000000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
    /** Avenir Next ships as a built-in iOS font. No equivalent on Android/web. */
    brand: 'AvenirNext-DemiBold',
    brandMedium: 'AvenirNext-Medium',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    brand: 'normal',
    brandMedium: 'normal',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
    brand: "'Avenir Next', Helvetica, Arial, sans-serif",
    brandMedium: "'Avenir Next', Helvetica, Arial, sans-serif",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// Named after usage (not size) since Snapchat's own scale mixes both —
// see docs/design-system.md for which reference value each maps to.
export const Radius = {
  input: 5,
  card: 8,
  button: 64,
  pill: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
