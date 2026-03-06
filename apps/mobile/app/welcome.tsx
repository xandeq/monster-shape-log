/**
 * Welcome Screen - Cyberpunk Neon onboarding
 * Animated entrance with staggered reveals, glowing logo, SVG illustrations
 */
import { FitnessIllustration } from '@/components/FitnessIllustration';
import { GradientText } from '@/components/GradientText';
import { MonsterButton } from '@/components/MonsterButton';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { AnimationConfig } from '@/constants/Animations';
import { MonsterColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
  // Glow pulse animation
  const glowOpacity = useSharedValue(0.3);
  const floatY = useSharedValue(0);
  const lineWidth = useSharedValue(0);

  useEffect(() => {
    // Pulsing glow
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    // Floating illustration
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    // Line reveal
    lineWidth.value = withDelay(
      800,
      withTiming(80, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const lineStyle = useAnimatedStyle(() => ({
    width: lineWidth.value,
  }));

  return (
    <MonsterLayout noPadding>
      <View style={styles.container}>

        {/* Background glow orbs */}
        <Animated.View style={[styles.glowOrb, styles.glowOrbGreen, glowStyle]} />
        <Animated.View style={[styles.glowOrb, styles.glowOrbPurple, glowStyle]} />

        {/* Background illustrations */}
        <Animated.View style={[styles.bgIllustrationLeft, floatStyle]}>
          <FitnessIllustration type="weightlifter" size={140} opacity={0.08} />
        </Animated.View>
        <Animated.View style={[styles.bgIllustrationRight, floatStyle]}>
          <FitnessIllustration type="boxer" size={120} opacity={0.06} colors={MonsterColors.gradientSecondary} />
        </Animated.View>

        {/* Main content */}
        <View style={styles.content}>

          {/* Hero illustration */}
          <Animated.View
            entering={FadeIn.delay(200).duration(800)}
            style={styles.heroIllustration}
          >
            <Animated.View style={floatStyle}>
              <FitnessIllustration type="weightlifter" size={160} opacity={0.5} />
            </Animated.View>
          </Animated.View>

          {/* Logo */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(600).springify().damping(12)}
            style={styles.logoContainer}
          >
            <GradientText
              text="MONSTER"
              fontSize={48}
              fontWeight="900"
              colors={MonsterColors.gradientPrimary}
            />
            <MonsterText
              variant="display"
              style={styles.logoSecondary}
            >
              LOG
            </MonsterText>

            {/* Animated accent line */}
            <Animated.View style={[styles.accentLine, lineStyle]}>
              <LinearGradient
                colors={[...MonsterColors.gradientPrimary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.accentLineGradient}
              />
            </Animated.View>
          </Animated.View>

          {/* Tagline */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(500)}
            style={styles.taglineContainer}
          >
            <MonsterText variant="titleSm" style={styles.tagline}>
              O ÚNICO APP QUE ACOMPANHA
            </MonsterText>
            <MonsterText variant="titleSm" neon glow style={styles.taglineAccent}>
              SUA EVOLUÇÃO MONSTRA
            </MonsterText>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInUp.delay(900).duration(500)}>
            <MonsterText variant="body" style={styles.description}>
              Registre treinos, acompanhe progresso e liberte o monstro. Sem frescura.
            </MonsterText>
          </Animated.View>

          {/* Feature pills */}
          <Animated.View
            entering={FadeInUp.delay(1100).duration(500)}
            style={styles.pillsContainer}
          >
            {[
              { icon: 'barbell-outline' as const, label: 'TREINOS' },
              { icon: 'analytics-outline' as const, label: 'ANALYTICS' },
              { icon: 'flame-outline' as const, label: 'STREAKS' },
            ].map((item, index) => (
              <View key={item.label} style={styles.pill}>
                <Ionicons name={item.icon} size={14} color={MonsterColors.primary} />
                <MonsterText variant="tiny" style={styles.pillText}>{item.label}</MonsterText>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* CTA Buttons */}
        <Animated.View
          entering={FadeInUp.delay(1300).duration(500).springify().damping(14)}
          style={styles.buttonsContainer}
        >
          <MonsterButton
            title="COMEÇAR AGORA"
            onPress={() => router.push('/(auth)/register')}
            size="lg"
            icon={<Ionicons name="arrow-forward" size={18} color={MonsterColors.background} />}
            fullWidth
          />
          <View style={styles.buttonSpacer} />
          <MonsterButton
            title="JÁ TENHO CONTA"
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
            size="lg"
            fullWidth
          />
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeIn.delay(1500).duration(400)} style={styles.footer}>
          <MonsterText variant="tiny" style={styles.footerText}>
            MONSTER LOG CORP // ALL RIGHTS RESERVED
          </MonsterText>
        </Animated.View>
      </View>
    </MonsterLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  // Background glow orbs
  glowOrb: {
    position: 'absolute',
    borderRadius: 200,
  },
  glowOrbGreen: {
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    backgroundColor: MonsterColors.glow,
  },
  glowOrbPurple: {
    bottom: 100,
    left: -80,
    width: 160,
    height: 160,
    backgroundColor: MonsterColors.glowPurple,
  },
  bgIllustrationLeft: {
    position: 'absolute',
    top: 60,
    left: -30,
  },
  bgIllustrationRight: {
    position: 'absolute',
    bottom: 200,
    right: -20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  heroIllustration: {
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoSecondary: {
    fontSize: 48,
    color: MonsterColors.textPrimary,
    letterSpacing: 6,
    marginTop: -8,
  },
  accentLine: {
    height: 3,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  accentLineGradient: {
    flex: 1,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  tagline: {
    color: MonsterColors.textSecondary,
    fontSize: 14,
    letterSpacing: 2,
  },
  taglineAccent: {
    fontSize: 16,
    letterSpacing: 2,
  },
  description: {
    textAlign: 'center',
    color: MonsterColors.textMuted,
    paddingHorizontal: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: MonsterColors.borderGlow,
    backgroundColor: 'rgba(0,255,136,0.05)',
  },
  pillText: {
    color: MonsterColors.primary,
    fontSize: 10,
    letterSpacing: 1,
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  buttonSpacer: {
    height: 12,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
    opacity: 0.3,
  },
  footerText: {
    color: MonsterColors.textMuted,
    textAlign: 'center',
  },
});
