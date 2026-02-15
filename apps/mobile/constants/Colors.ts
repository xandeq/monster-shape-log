/**
 * Monster Log - Design System Colors
 * Updated for Hardcore Workout Aesthetic
 */

const tintColorLight = '#00FF88';
const tintColorDark = '#00FF88';

export const MonsterColors = {
  background: '#0A0A0A',
  secondary: '#111111',
  elevated: '#1A1A1A',

  primary: '#00FF88', // Neon Green
  accent: '#00FF88', // Alias
  accentPink: '#FF2D55', // Neon Pink

  textPrimary: '#FFFFFF',
  textSecondary: '#D4D4D4', // Light Gray (Neutral-300)
  textMuted: '#A3A3A3', // Medium Gray (Neutral-400), much lighter than #666666

  success: '#00FF88',
  error: '#FF3B30',
  warning: '#FF9500',

  border: '#1F1F1F',

  // Legacy support
  text: '#FFFFFF',
  tint: tintColorDark,
  tabIconDefault: '#666666',
  tabIconSelected: tintColorDark,
};

export default {
  light: {
    text: '#FFFFFF',
    background: '#0A0A0A',
    tint: tintColorLight,
    tabIconDefault: '#666666',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#0A0A0A',
    tint: tintColorDark,
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
  },
};
