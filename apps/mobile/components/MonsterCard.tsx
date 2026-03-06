/**
 * MonsterCard - Card component with optional glassmorphism
 * Backward compatible: glass=false uses solid bg, glass=true uses gradient
 */
import { MonsterColors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

interface MonsterCardProps extends ViewProps {
  children: React.ReactNode;
  active?: boolean;
  noPadding?: boolean;
  glass?: boolean;
  glowColor?: string;
}

export const MonsterCard: React.FC<MonsterCardProps> = ({
  children,
  active = false,
  noPadding = false,
  glass = false,
  glowColor,
  style,
  ...props
}) => {
  if (glass) {
    return (
      <LinearGradient
        colors={[MonsterColors.glass, 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.card,
          styles.glassCard,
          !noPadding && styles.padded,
          active && styles.active,
          glowColor && { borderColor: glowColor },
          style as ViewStyle,
        ]}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.card,
        !noPadding && styles.padded,
        active && styles.active,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: MonsterColors.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MonsterColors.border,
  },
  glassCard: {
    backgroundColor: 'transparent',
    borderColor: MonsterColors.glassBorder,
  },
  padded: {
    padding: 16,
  },
  active: {
    borderLeftWidth: 4,
    borderLeftColor: MonsterColors.accent,
  },
});
