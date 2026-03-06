/**
 * GlassCard - Glassmorphism card with gradient background
 * Semi-transparent on Android, blur on iOS
 * Press-to-scale animation + optional glow border
 */
import { AnimationConfig } from '@/constants/Animations';
import { MonsterColors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  glowColor?: string;
  noPadding?: boolean;
  pressable?: boolean;
  borderGlow?: boolean;
  active?: boolean;
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  glowColor = MonsterColors.glow,
  noPadding = false,
  pressable = true,
  borderGlow = false,
  active = false,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    if (pressable) {
      scale.value = withSpring(AnimationConfig.pressScale.card, AnimationConfig.spring.press);
    }
  };

  const onPressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, AnimationConfig.spring.gentle);
    }
  };

  return (
    <Animated.View
      style={[animatedStyle, style]}
      onTouchStart={onPressIn}
      onTouchEnd={onPressOut}
      onTouchCancel={onPressOut}
      {...props}
    >
      <LinearGradient
        colors={[MonsterColors.glass, 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.gradient,
          !noPadding && styles.padded,
          active && styles.active,
          borderGlow && { borderColor: glowColor },
          Platform.OS === 'ios' && {
            shadowColor: borderGlow ? glowColor : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
          },
        ]}
      >
        {children}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MonsterColors.glassBorder,
    overflow: 'hidden',
  },
  padded: {
    padding: 16,
  },
  active: {
    borderLeftWidth: 4,
    borderLeftColor: MonsterColors.primary,
  },
});
