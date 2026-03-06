/**
 * FitnessIllustration - SVG fitness silhouettes with gradient fill
 * Inline SVG paths for zero-latency rendering
 */
import { MonsterColors } from '@/constants/Colors';
import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop, Circle } from 'react-native-svg';

type IllustrationType = 'weightlifter' | 'runner' | 'boxer' | 'yoga' | 'dumbbell';

interface FitnessIllustrationProps {
  type: IllustrationType;
  size?: number;
  colors?: readonly string[];
  opacity?: number;
}

// Simplified fitness pose silhouette paths (100x100 viewBox)
const illustrations: Record<IllustrationType, string> = {
  weightlifter:
    // Person standing with barbell overhead
    'M50 8a6 6 0 110 12 6 6 0 010-12zm-2 16h4l2 12h10l2-3h6l-3 6H59l-2 8 8 18-4 3-10-16-10 16-4-3 8-18-2-8H33l-3-6h6l2 3h10l2-12z',
  runner:
    // Person in running pose
    'M52 6a6 6 0 110 12 6 6 0 010-12zm4 15l-8 3-6 14-12 4 2 5 15-5 4-10 6 8 14 20 4-3-12-18V42l16-8-2-5-12 6V22z',
  boxer:
    // Person in boxing stance
    'M48 6a6 6 0 110 12 6 6 0 010-12zm-6 16l4 2 12-6 3 4-10 8v8l6 18-4 3-8-16-6 16-4-3 6-18v-6l-10-4 2-5 9 4v-5z',
  yoga:
    // Person in tree pose
    'M50 4a6 6 0 110 12 6 6 0 010-12zm0 14c-2 0-3 1-3 3v10l-14 1v5l14-1v12l-8 20 4 2 8-18 8 18 4-2-8-20V48l14 1v-5l-14-1V21c0-2-1-3-3-3z',
  dumbbell:
    // Dumbbell icon
    'M20 35h8v-8h4v8h36v-8h4v8h8v30h-8v8h-4v-8H32v8h-4v-8h-8V35zm8 6v18h44V41H28z',
};

export const FitnessIllustration: React.FC<FitnessIllustrationProps> = ({
  type,
  size = 120,
  colors = MonsterColors.gradientPrimary,
  opacity = 0.6,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={opacity}>
      <Defs>
        <LinearGradient id={`fitnessGrad_${type}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors[0]} stopOpacity="0.9" />
          <Stop offset="1" stopColor={colors[1] || colors[0]} stopOpacity="0.2" />
        </LinearGradient>
      </Defs>
      <Path d={illustrations[type]} fill={`url(#fitnessGrad_${type})`} />
    </Svg>
  );
};
