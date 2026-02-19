import { styled } from '@/lib/styled';
import React, { useEffect } from 'react';
import { Dimensions, Text, View } from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type KineticMarqueeProps = {
  text: string;
  speed?: number;
  reverse?: boolean;
  className?: string;
};

const StyledView = styled(View);
const StyledText = styled(Text);
const AnimatedView = Animated.createAnimatedComponent(StyledView);

export const KineticMarquee: React.FC<KineticMarqueeProps> = ({
  text,
  speed = 10000,
  reverse = false,
  className,
}) => {
  const translateX = useSharedValue(0);
  const containerWidth = width; // Approximation

  useEffect(() => {
    const toValue = reverse ? containerWidth : -containerWidth;

    translateX.value = withRepeat(
      withTiming(toValue, {
        duration: speed,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(translateX);
    };
  }, [speed, reverse, containerWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <StyledView className={`w-full overflow-hidden bg-accent py-2 border-y-2 border-border ${className || ''}`}>
      <AnimatedView className="flex-row w-[2000px]" style={animatedStyle}>
        {[...Array(8)].map((_, i) => ( // Repeat 8 times
             <StyledText key={i} className="font-space font-bold uppercase text-2xl md:text-3xl text-black mr-8 tracking-widest">
                {text} •
             </StyledText>
        ))}
      </AnimatedView>
    </StyledView>
  );
};
