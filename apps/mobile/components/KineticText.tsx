import { styled } from '@/lib/styled';
import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type KineticTextProps = {
  children: React.ReactNode;
  variant?: 'poster' | 'mega' | 'display' | 'heading' | 'label' | 'body';
  style?: any; // NativeWind style prop
  containerStyle?: ViewStyle;
  delay?: number;
  stagger?: boolean;
  className?: string;
  numberOfLines?: number;
};

const StyledText = styled(Text);
const StyledView = styled(View);
const AnimatedText = Animated.createAnimatedComponent(StyledText);

export const KineticText: React.FC<KineticTextProps> = ({
  children,
  variant = 'body',
  style,
  containerStyle,
  delay = 0,
  stagger = false,
  className,
  numberOfLines,
}) => {
  const textContent = typeof children === 'string'
    ? children
    : Array.isArray(children)
        ? children.join('')
        : String(children);

  const words = textContent.split(' ');

  const getVariantClass = () => {
    switch (variant) {
        case 'poster': return "font-space font-bold uppercase text-6xl md:text-8xl leading-none text-foreground"; // Reduced from 10xl
        case 'mega': return "font-space font-bold uppercase text-4xl md:text-6xl leading-none text-foreground"; // Reduced from 7xl/9xl
        case 'display': return "font-space font-bold uppercase text-2xl md:text-4xl leading-none text-foreground tracking-tighter"; // Reduced from 5xl/7xl
        case 'heading': return "font-space font-bold uppercase text-xl md:text-2xl text-foreground tracking-tight"; // Reduced from 3xl/5xl
        case 'label': return "font-space font-bold uppercase text-xs md:text-sm tracking-widest text-accent"; // Reduced from sm/base
        case 'body': return "font-inter text-sm md:text-base text-muted-foreground leading-relaxed"; // Reduced from lg/xl
        default: return "font-inter text-sm text-muted-foreground";
    }
  };

  if (!stagger) {
    return (
      <AnimatedText
        entering={FadeInDown.delay(delay).duration(800).springify()}
        className={`${getVariantClass()} ${className || ''}`}
        style={style}
        numberOfLines={numberOfLines}
      >
        {children}
      </AnimatedText>
    );
  }

  return (
    <StyledView className="flex-row flex-wrap" style={containerStyle}>
      {words.map((word, index) => (
        <AnimatedText
          key={`${word}-${index}`}
          entering={FadeInDown.delay(delay + index * 100)
            .duration(600)
            .springify()
            .damping(12)}
          className={`${getVariantClass()} mr-2 ${className || ''}`}
          style={style}
        >
          {word}
        </AnimatedText>
      ))}
    </StyledView>
  );
};
