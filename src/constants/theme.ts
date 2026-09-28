/**
 * Design tokens — see docs/design-system.md for the full style guide
 * (palette rationale, typography scale, component rules). Update both
 * together so the doc never drifts from what the code actually uses.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#3A2B1E',
    textSecondary: '#8A7360',
    background: '#FBF5EC',
    backgroundElement: '#F3E8D8',
    backgroundSelected: '#E7D2AE',
    accent: '#C1693F',
    accentText: '#FFF8EF',
  },
  dark: {
    text: '#F2E6D3',
    textSecondary: '#B8A48C',
    background: '#211812',
    backgroundElement: '#2E221A',
    backgroundSelected: '#46341F',
    accent: '#E0895A',
    accentText: '#241A14',
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
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
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

export const Radius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
