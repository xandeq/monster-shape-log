/**
 * Monster Log - Gradient Presets
 * Ready-to-spread configurations for expo-linear-gradient
 */
import { MonsterColors } from './Colors';

export const GradientPresets = {
  primary: {
    colors: MonsterColors.gradientPrimary,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  primaryHorizontal: {
    colors: MonsterColors.gradientPrimary,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  secondary: {
    colors: MonsterColors.gradientSecondary,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  fire: {
    colors: MonsterColors.gradientFire,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  darkBg: {
    colors: MonsterColors.gradientDark,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  glassCard: {
    colors: MonsterColors.gradientCard,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  tabBar: {
    colors: ['#050510', '#0A0F1E'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
} as const;
