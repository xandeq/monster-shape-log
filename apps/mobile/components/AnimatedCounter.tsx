/**
 * AnimatedCounter - Number that counts up from 0 to target value
 * Uses reanimated for smooth 60fps animation
 */
import { AnimationConfig } from '@/constants/Animations';
import { MonsterColors } from '@/constants/Colors';
import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  style?: TextStyle;
  decimalPlaces?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  duration = AnimationConfig.counter.duration,
  style,
  decimalPlaces = 0,
}) => {
  const animatedValue = useSharedValue(0);
  const [displayText, setDisplayText] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: AnimationConfig.counter.easing,
    });
  }, [value]);

  const updateDisplay = (current: number) => {
    setDisplayText(`${prefix}${current.toFixed(decimalPlaces)}${suffix}`);
  };

  useAnimatedReaction(
    () => animatedValue.value,
    (current) => {
      runOnJS(updateDisplay)(current);
    }
  );

  return (
    <Text
      style={[
        {
          color: MonsterColors.primary,
          fontSize: 28,
          fontWeight: '700',
          textShadowColor: MonsterColors.glow,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        },
        style,
      ]}
    >
      {displayText}
    </Text>
  );
};
