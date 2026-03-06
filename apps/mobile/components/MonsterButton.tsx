/**
 * MonsterButton - Gradient button with press animation
 * Primary: green→cyan gradient | Secondary: gradient border | Danger: red
 */
import { AnimationConfig } from '@/constants/Animations';
import { MonsterColors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export interface MonsterButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onPress?: () => void;
  style?: any;
}

export const MonsterButton: React.FC<MonsterButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  icon,
  fullWidth = false,
  size = 'md',
  disabled,
  onPress,
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(AnimationConfig.pressScale.button, AnimationConfig.spring.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring.gentle);
  };

  const sizeStyle = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md;

  const textColor = {
    primary: MonsterColors.background,
    secondary: MonsterColors.primary,
    danger: '#FFFFFF',
    ghost: MonsterColors.primary,
  }[variant];

  const indicatorColor = variant === 'secondary' || variant === 'ghost' ? MonsterColors.primary : '#000';

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </>
      )}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <Animated.View style={[animatedStyle, (disabled || loading) && styles.disabled]}>
        {variant === 'primary' ? (
          <LinearGradient
            colors={MonsterColors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.base, sizeStyle, styles.primaryShadow]}
          >
            {buttonContent}
          </LinearGradient>
        ) : variant === 'secondary' ? (
          <LinearGradient
            colors={MonsterColors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.base, sizeStyle, { padding: 1.5 }]}
          >
            <View style={[styles.base, sizeStyle, styles.secondaryInner]}>
              {buttonContent}
            </View>
          </LinearGradient>
        ) : variant === 'danger' ? (
          <View style={[styles.base, sizeStyle, styles.danger]}>
            {buttonContent}
          </View>
        ) : (
          <View style={[styles.base, sizeStyle, styles.ghost]}>
            {buttonContent}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  sm: { height: 40, paddingHorizontal: 16 },
  md: { height: 48, paddingHorizontal: 24 },
  lg: { height: 56, paddingHorizontal: 32 },
  primaryShadow: {
    shadowColor: MonsterColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryInner: {
    backgroundColor: MonsterColors.background,
  },
  danger: {
    backgroundColor: MonsterColors.error,
    borderWidth: 1,
    borderColor: MonsterColors.error,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  iconWrap: { marginRight: 8 },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
  },
});
