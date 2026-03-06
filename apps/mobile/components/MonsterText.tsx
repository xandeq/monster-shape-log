/**
 * MonsterText - Typography component with cyberpunk glow support
 */
import { MonsterColors } from '@/constants/Colors';
import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

type TextVariant = 'display' | 'titleLg' | 'titleMd' | 'titleSm' | 'body' | 'caption' | 'tiny';

interface MonsterTextProps extends TextProps {
  variant?: TextVariant;
  children: React.ReactNode;
  className?: string;
  neon?: boolean;
  glow?: boolean;
  glowColor?: string;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  display: { fontSize: 32, fontWeight: '700', textTransform: 'uppercase', letterSpacing: -0.5 },
  titleLg: { fontSize: 28, lineHeight: 34, fontWeight: '700', textTransform: 'uppercase', letterSpacing: -0.25 },
  titleMd: { fontSize: 22, lineHeight: 28, fontWeight: '700', textTransform: 'uppercase', letterSpacing: -0.25 },
  titleSm: { fontSize: 18, lineHeight: 24, fontWeight: '600', textTransform: 'uppercase' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  tiny: { fontSize: 11, lineHeight: 14, fontWeight: '400', textTransform: 'uppercase', letterSpacing: 0.5 },
};

const variantColors: Record<TextVariant, string> = {
  display: MonsterColors.textPrimary,
  titleLg: MonsterColors.textPrimary,
  titleMd: MonsterColors.textPrimary,
  titleSm: MonsterColors.textPrimary,
  body: MonsterColors.textSecondary,
  caption: MonsterColors.textSecondary,
  tiny: MonsterColors.textMuted,
};

export const MonsterText: React.FC<MonsterTextProps> = ({
  children,
  variant = 'body',
  neon = false,
  glow = false,
  glowColor,
  style,
  ...props
}) => {
  const color = neon ? MonsterColors.accent : variantColors[variant];

  const shouldGlow = neon || glow;
  const glowStyles: TextStyle = shouldGlow
    ? {
        textShadowColor: glowColor || MonsterColors.glow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      }
    : {};

  return (
    <Text
      style={[variantStyles[variant], { color }, shouldGlow && glowStyles, style]}
      {...props}
    >
      {children}
    </Text>
  );
};
