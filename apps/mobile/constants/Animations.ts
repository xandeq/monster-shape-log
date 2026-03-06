/**
 * Monster Log - Animation Configuration
 * Centralized motion presets for consistent Cyberpunk feel
 */
import { Easing } from 'react-native-reanimated';

export const AnimationConfig = {
  // Spring presets
  spring: {
    gentle: { damping: 15, stiffness: 150, mass: 1 },
    bouncy: { damping: 10, stiffness: 200, mass: 0.8 },
    stiff: { damping: 20, stiffness: 300, mass: 1 },
    press: { damping: 15, stiffness: 400, mass: 0.5 },
  },

  // Timing presets
  timing: {
    fast: { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
    medium: { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
    slow: { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  },

  // Entrance animation config
  entrance: {
    staggerDelay: 80,
    initialDelay: 100,
    duration: 500,
  },

  // Scale on press
  pressScale: {
    card: 0.98,
    button: 0.95,
    icon: 0.85,
  },

  // Counter animation
  counter: {
    duration: 1200,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },

  // Glow pulse
  glowPulse: {
    duration: 2000,
    minOpacity: 0.3,
    maxOpacity: 0.8,
  },
};
