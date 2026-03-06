/**
 * GradientText - Text with gradient fill using react-native-svg
 * Cyberpunk neon gradient effect on any text
 */
import { MonsterColors } from '@/constants/Colors';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

interface GradientTextProps {
  text: string;
  fontSize?: number;
  fontWeight?: string;
  colors?: readonly string[];
  style?: ViewStyle;
  textAnchor?: 'start' | 'middle' | 'end';
  letterSpacing?: number;
}

export const GradientText: React.FC<GradientTextProps> = ({
  text,
  fontSize = 32,
  fontWeight = '700',
  colors = MonsterColors.gradientPrimary,
  style,
  textAnchor = 'middle',
  letterSpacing = 0,
}) => {
  const height = fontSize * 1.3;

  return (
    <View style={[{ height, alignItems: textAnchor === 'middle' ? 'center' : 'flex-start' }, style]}>
      <Svg height={height} width="100%">
        <Defs>
          <LinearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1] || colors[0]} />
          </LinearGradient>
        </Defs>
        <SvgText
          fill="url(#textGrad)"
          fontSize={fontSize}
          fontWeight={fontWeight}
          x={textAnchor === 'middle' ? '50%' : '0'}
          y={fontSize * 0.95}
          textAnchor={textAnchor}
          letterSpacing={letterSpacing}
        >
          {text}
        </SvgText>
      </Svg>
    </View>
  );
};
