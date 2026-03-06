/**
 * Monster Log - Cyberpunk Neon Design System
 * Deep blue-black backgrounds + neon green/purple/cyan accents
 */

export const MonsterColors = {
  // Backgrounds
  background: '#050510',       // Deep blue-black
  secondary: '#0A0F1E',        // Dark navy
  elevated: '#111827',          // Card backgrounds

  // Brand / Accents
  primary: '#00FF88',           // Neon Green
  accent: '#00FF88',            // Alias for primary
  accentPink: '#FF2D55',        // Neon Pink
  purple: '#7C3AED',            // Electric Purple
  cyan: '#06B6D4',              // Cyan Blue
  amber: '#F59E0B',             // Gold / Amber (streaks, rewards)

  // Text
  textPrimary: '#F8FAFC',       // Bright warm white
  textSecondary: '#94A3B8',     // Slate gray
  textMuted: '#64748B',         // Darker slate

  // Status
  success: '#10B981',           // Emerald (distinct from primary)
  error: '#EF4444',             // Red
  warning: '#F59E0B',           // Amber

  // Borders & Effects
  border: 'rgba(255,255,255,0.08)',         // Subtle white border
  borderGlow: 'rgba(0,255,136,0.15)',       // Green glow border
  glass: 'rgba(255,255,255,0.05)',          // Glassmorphism fill
  glassBorder: 'rgba(255,255,255,0.1)',     // Glass border
  glow: 'rgba(0,255,136,0.3)',              // Green glow shadow
  glowPurple: 'rgba(124,58,237,0.3)',       // Purple glow
  glowCyan: 'rgba(6,182,212,0.3)',          // Cyan glow

  // Gradient arrays (for LinearGradient)
  gradientPrimary: ['#00FF88', '#06B6D4'] as const,
  gradientSecondary: ['#7C3AED', '#EC4899'] as const,
  gradientFire: ['#F59E0B', '#EF4444'] as const,
  gradientDark: ['#050510', '#0A0F1E'] as const,
  gradientCard: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] as const,

  // Legacy support
  text: '#F8FAFC',
  tint: '#00FF88',
  tabIconDefault: '#64748B',
  tabIconSelected: '#00FF88',
};

export default {
  light: {
    text: '#F8FAFC',
    background: '#050510',
    tint: '#00FF88',
    tabIconDefault: '#64748B',
    tabIconSelected: '#00FF88',
  },
  dark: {
    text: '#F8FAFC',
    background: '#050510',
    tint: '#00FF88',
    tabIconDefault: '#64748B',
    tabIconSelected: '#00FF88',
  },
};
