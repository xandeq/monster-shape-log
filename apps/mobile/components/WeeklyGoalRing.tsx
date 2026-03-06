/**
 * WeeklyGoalRing — Animated SVG ring showing weekly workout progress vs goal
 */
import { MonsterColors } from '@/constants/Colors';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 82;
const STROKE = 8;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface Props {
  current: number;
  goal: number;
  onEditGoal: () => void;
}

export function WeeklyGoalRing({ current, goal, onEditGoal }: Props) {
  const progress = Math.min(current / Math.max(goal, 1), 1);
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 1100 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progressValue.value),
  }));

  const isGoalMet = current >= goal;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onEditGoal} style={styles.ringWrap} activeOpacity={0.75}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <SvgLinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={isGoalMet ? MonsterColors.amber : MonsterColors.primary} />
              <Stop offset="1" stopColor={isGoalMet ? '#FF2D55' : MonsterColors.cyan} />
            </SvgLinearGradient>
          </Defs>
          {/* Track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Progress arc */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke="url(#ringGrad)"
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>

        {/* Center text */}
        <View style={styles.center}>
          <Text style={[styles.current, isGoalMet && styles.currentMet]}>
            {current}
          </Text>
          <Text style={styles.goal}>/{goal}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.labels}>
        <Text style={styles.label}>ESTA SEMANA</Text>
        {isGoalMet && <Text style={styles.goalMet}>✓ META!</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  ringWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  current: {
    fontSize: 22,
    fontWeight: '900',
    color: MonsterColors.primary,
  },
  currentMet: {
    color: MonsterColors.amber,
  },
  goal: {
    fontSize: 11,
    fontWeight: '600',
    color: MonsterColors.textMuted,
    marginTop: 6,
  },
  labels: {
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 8,
    fontWeight: '700',
    color: MonsterColors.textMuted,
    letterSpacing: 1.5,
  },
  goalMet: {
    fontSize: 8,
    fontWeight: '800',
    color: MonsterColors.amber,
    letterSpacing: 1,
  },
});
