/**
 * PRBadge - Animated "PR!" badge shown when a personal record is beaten
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface PRBadgeProps {
  /** 'inline' sits next to input, 'float' animates and fades above */
  mode?: 'inline' | 'float';
}

export function PRBadge({ mode = 'inline' }: PRBadgeProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Burst in
    scale.value = withSequence(
      withSpring(1.4, { damping: 5, stiffness: 300 }),
      withSpring(1.0, { damping: 8 }),
    );
    opacity.value = withTiming(1, { duration: 150 });

    if (mode === 'float') {
      translateY.value = withDelay(800, withTiming(-20, { duration: 600 }));
      opacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withDelay(800, withTiming(0, { duration: 600 })),
      );
    }
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.badge, animStyle]}>
      <Text style={styles.trophy}>🏆</Text>
      <Text style={styles.text}>PR!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 2,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  trophy: {
    fontSize: 10,
  },
  text: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
});
