/**
 * Dashboard - Cyberpunk Neon main screen
 * GlassCards, AnimatedCounters, staggered entrance, gradient accents
 */
import { AchievementsWidget } from '@/components/AchievementsWidget';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { FitnessIllustration } from '@/components/FitnessIllustration';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCoach } from '@/components/MonsterCoach';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { ProgressModal } from '@/components/ProgressModal';
import { WeeklyGoalRing } from '@/components/WeeklyGoalRing';
import { MonsterColors } from '@/constants/Colors';
import { EXERCISES } from '@/constants/Exercises';
import { useSubscription } from '@/context/SubscriptionContext';
import { useWorkout } from '@/context/WorkoutContext';
import { computeStreak, getAchievements } from '@/lib/achievements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen() {
  const { getWorkoutStats, history, isWorkoutActive, workoutName, workoutTimer, startWorkout } = useWorkout();
  const { isPro } = useSubscription();
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const stats = getWorkoutStats();

  const lastWorkoutTitle = history.length > 0 ? history[0].name : 'SEM TREINOS';
  const lastWorkoutDate = history.length > 0 ? new Date(history[0].date).toLocaleDateString('pt-BR') : '--/--';

  const [featuredExercise, setFeaturedExercise] = useState(EXERCISES[0]);
  const [weeklyGoal, setWeeklyGoal] = useState(3);

  useEffect(() => {
    const random = EXERCISES[Math.floor(Math.random() * EXERCISES.length)];
    setFeaturedExercise(random);
    // Load saved weekly goal
    AsyncStorage.getItem('@monster_weekly_goal').then(v => {
      if (v) setWeeklyGoal(parseInt(v));
    });
  }, []);

  // Compute real streak from history
  const currentStreak = computeStreak(history);

  // Compute this-week workout count (Sun–Sat)
  const weekStart = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  })();
  const thisWeekCount = history.filter(w => new Date(w.date) >= weekStart).length;

  const achievements = getAchievements(history);

  const editWeeklyGoal = () => {
    Alert.alert(
      'META SEMANAL',
      'Quantos treinos por semana?',
      [2, 3, 4, 5, 6].map(n => ({
        text: `${n}x por semana`,
        onPress: () => {
          setWeeklyGoal(n);
          AsyncStorage.setItem('@monster_weekly_goal', String(n));
        },
      })).concat([{ text: 'Cancelar', style: 'cancel' } as any]),
    );
  };

  // Glow pulse for active workout
  const glowPulse = useSharedValue(0.3);
  useEffect(() => {
    if (isWorkoutActive) {
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [isWorkoutActive]);

  const activeGlow = useAnimatedStyle(() => ({
    shadowOpacity: glowPulse.value,
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <MonsterLayout noPadding>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ─── HEADER ─── */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <MonsterText variant="tiny" style={styles.headerLabel}>BEM VINDO AO</MonsterText>
              <GradientText text="MODO MONSTRO" fontSize={26} fontWeight="900" />
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={18} color={MonsterColors.amber} />
              <MonsterText variant="titleSm" style={styles.streakNumber}>{currentStreak}</MonsterText>
            </View>
          </View>

          {/* Subtle separator */}
          <LinearGradient
            colors={['transparent', MonsterColors.borderGlow, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerLine}
          />
        </Animated.View>

        <View style={styles.body}>

          {/* ─── ACTIVE WORKOUT / CTA CARD ─── */}
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            {isWorkoutActive ? (
              <Animated.View style={activeGlow}>
                <GlassCard borderGlow active glowColor={MonsterColors.primary} style={styles.workoutCard}>
                  <View style={styles.workoutCardInner}>
                    {/* Top row */}
                    <View style={styles.workoutHeader}>
                      <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <MonsterText variant="tiny" style={styles.liveText}>TREINO ATIVO</MonsterText>
                      </View>
                      <MonsterText variant="tiny" style={styles.workoutNumber}>01</MonsterText>
                    </View>

                    {/* Name + Timer */}
                    <View style={styles.workoutRow}>
                      <MonsterText variant="titleMd" style={styles.workoutName} numberOfLines={1}>
                        {workoutName || 'TREINO MONSTRO'}
                      </MonsterText>
                      <View style={styles.timerContainer}>
                        <Ionicons name="time-outline" size={16} color={MonsterColors.primary} />
                        <MonsterText variant="titleLg" neon glow style={styles.timerText}>
                          {formatTime(workoutTimer)}
                        </MonsterText>
                      </View>
                    </View>

                    <MonsterButton
                      title="RETOMAR TREINO"
                      icon={<Ionicons name="play" size={14} color={MonsterColors.background} />}
                      onPress={() => router.push('/track')}
                      fullWidth
                    />
                  </View>
                </GlassCard>
              </Animated.View>
            ) : (
              <GlassCard borderGlow glowColor={MonsterColors.borderGlow} style={styles.workoutCard}>
                <View style={styles.ctaCardInner}>
                  {/* Background illustration */}
                  <View style={styles.ctaIllustration}>
                    <FitnessIllustration type="runner" size={100} opacity={0.1} />
                  </View>

                  <View style={styles.ctaContent}>
                    <MonsterText variant="tiny" style={styles.ctaLabel}>PRONTO PRA ESMAGAR?</MonsterText>
                    <MonsterText variant="body" style={styles.ctaDescription}>
                      O único treino ruim é aquele que não aconteceu.
                    </MonsterText>
                  </View>

                  <MonsterButton
                    title="NOVO TREINO"
                    icon={<Ionicons name="add" size={18} color={MonsterColors.background} />}
                    onPress={() => {
                      startWorkout();
                      router.push('/track');
                    }}
                    fullWidth
                    size="lg"
                  />
                </View>
              </GlassCard>
            )}
          </Animated.View>

          {/* ─── STATS GRID ─── */}
          <Animated.View entering={FadeInUp.delay(350).duration(500)} style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons name="barbell-outline" size={18} color={MonsterColors.primary} />
              </View>
              <AnimatedCounter value={stats.totalWorkouts} style={styles.statValue} />
              <MonsterText variant="tiny" style={styles.statLabel}>TREINOS</MonsterText>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: MonsterColors.glowPurple }]}>
                <Ionicons name="time-outline" size={18} color={MonsterColors.purple} />
              </View>
              <AnimatedCounter
                value={Math.round(stats.totalTime / 3600)}
                suffix="H"
                style={[styles.statValue, { color: MonsterColors.purple, textShadowColor: MonsterColors.glowPurple }]}
              />
              <MonsterText variant="tiny" style={styles.statLabel}>TEMPO</MonsterText>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <WeeklyGoalRing
                current={thisWeekCount}
                goal={weeklyGoal}
                onEditGoal={editWeeklyGoal}
              />
            </GlassCard>
          </Animated.View>

          {/* ─── QUICK ACTIONS SECTION ─── */}
          <Animated.View entering={FadeInUp.delay(500).duration(500)}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['transparent', MonsterColors.borderGlow, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sectionLine}
              />
              <MonsterText variant="tiny" style={styles.sectionTitle}>AÇÕES RÁPIDAS</MonsterText>
              <LinearGradient
                colors={['transparent', MonsterColors.borderGlow, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sectionLine}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.quickActionsGrid}>
            {/* History Widget */}
            <GlassCard style={styles.quickActionCard}>
              <View style={styles.quickActionContent}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="calendar-outline" size={24} color={MonsterColors.cyan} />
                </View>
                <AnimatedCounter value={history.length} style={[styles.quickActionValue, { color: MonsterColors.cyan, textShadowColor: MonsterColors.glowCyan }]} />
                <MonsterText variant="tiny" numberOfLines={1} style={styles.quickActionLabel}>
                  {lastWorkoutTitle.toUpperCase()}
                </MonsterText>
                <MonsterText variant="tiny" style={styles.quickActionDate}>{lastWorkoutDate}</MonsterText>
              </View>
              <MonsterButton title="HISTÓRICO" variant="secondary" size="sm" onPress={() => router.push('/history')} fullWidth />
            </GlassCard>

            {/* Featured Exercise Widget */}
            <GlassCard style={styles.quickActionCard}>
              <View style={styles.quickActionContent}>
                <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                  <Ionicons name="star" size={24} color={MonsterColors.amber} />
                </View>
                <MonsterText variant="tiny" style={styles.tipLabel}>DICA MONSTRA</MonsterText>
                <MonsterText variant="titleSm" numberOfLines={1} style={styles.tipTitle}>
                  {featuredExercise.name.toUpperCase()}
                </MonsterText>
                <MonsterText variant="tiny" style={styles.tipMuscle}>
                  {featuredExercise.muscleGroup.toUpperCase()}
                </MonsterText>
              </View>
              <MonsterButton title="EXPLORAR" variant="secondary" size="sm" onPress={() => router.push('/library')} fullWidth />
            </GlassCard>
          </Animated.View>

          {/* ─── PROGRESS CTA ─── */}
          <Animated.View entering={FadeInUp.delay(700).duration(500)}>
            <GlassCard borderGlow glowColor={MonsterColors.glowPurple}>
              <View style={styles.progressRow}>
                <View style={styles.progressInfo}>
                  <Ionicons name="analytics" size={20} color={MonsterColors.purple} />
                  <MonsterText variant="titleSm" style={styles.progressTitle}>LABORATÓRIO</MonsterText>
                </View>
                <MonsterText variant="tiny" style={styles.progressSub}>
                  Peso, fotos, 1RM estimado
                </MonsterText>
              </View>
              <MonsterButton
                title="VER PROGRESSO"
                icon={<Ionicons name="stats-chart" size={14} color={MonsterColors.background} />}
                onPress={() => setProgressModalVisible(true)}
                fullWidth
              />
            </GlassCard>
          </Animated.View>

          {/* ─── AI PERSONAL TRAINER CARD ─── */}
          <Animated.View entering={FadeInUp.delay(780).duration(500)}>
            <GlassCard borderGlow glowColor="rgba(0,255,136,0.18)" style={{ overflow: 'hidden' }}>
              <View style={{ position: 'absolute', right: -12, top: -8, opacity: 0.05 }}>
                <Ionicons name="chatbubbles" size={110} color="#fff" />
              </View>
              <View style={styles.coachCardHeader}>
                <LinearGradient
                  colors={['rgba(0,255,136,0.2)', 'rgba(6,182,212,0.2)']}
                  style={styles.coachAvatarGrad}
                >
                  <Ionicons name="fitness" size={22} color={MonsterColors.primary} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <MonsterText variant="titleSm" style={styles.coachTitle}>PERSONAL TRAINER IA</MonsterText>
                  <MonsterText variant="tiny" style={styles.coachSub}>
                    Análise · Dicas · Nutrição · Recuperação
                  </MonsterText>
                </View>
                <View style={styles.onlinePill}>
                  <View style={styles.onlinePillDot} />
                  <MonsterText variant="tiny" style={{ color: MonsterColors.primary, fontSize: 9, fontWeight: '700' }}>ONLINE</MonsterText>
                </View>
              </View>
              <MonsterButton
                title="FALAR COM O COACH"
                icon={<Ionicons name="chatbubble-ellipses" size={14} color={MonsterColors.background} />}
                onPress={() => router.push('/coach')}
                fullWidth
                size="lg"
              />
            </GlassCard>
          </Animated.View>

          {/* ─── MONSTER COACH WIDGET ─── */}
          <Animated.View entering={FadeInUp.delay(850).duration(500)}>
            <MonsterCoach />
          </Animated.View>

          {/* ─── PRO UPGRADE BANNER (free users only) ─── */}
          {!isPro && (
            <Animated.View entering={FadeInUp.delay(900).duration(500)}>
              <LinearGradient
                colors={['rgba(0,255,136,0.08)', 'rgba(124,58,237,0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.proBanner}
              >
                <View style={styles.proBannerLeft}>
                  <Ionicons name="flash" size={16} color={MonsterColors.primary} />
                  <View>
                    <MonsterText variant="tiny" style={styles.proBannerTitle}>
                      MODO MONSTRO PRO
                    </MonsterText>
                    <MonsterText variant="tiny" style={styles.proBannerSub}>
                      Coach IA ilimitado · Analytics · Templates ∞
                    </MonsterText>
                  </View>
                </View>
                <MonsterButton
                  title="VER PLANOS"
                  size="sm"
                  onPress={() => router.push('/plans')}
                />
              </LinearGradient>
            </Animated.View>
          )}

          {/* ─── ACHIEVEMENTS ─── */}
          <Animated.View entering={FadeInUp.delay(920).duration(500)}>
            <AchievementsWidget achievements={achievements} />
          </Animated.View>
        </View>

        <ProgressModal
          visible={progressModalVisible}
          onClose={() => setProgressModalVisible(false)}
        />
      </ScrollView>
    </MonsterLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },

  // ── Header ──
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    color: MonsterColors.textMuted,
    letterSpacing: 3,
    marginBottom: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  streakNumber: {
    color: MonsterColors.amber,
    fontSize: 16,
  },
  headerLine: {
    height: 1,
    marginTop: 12,
  },

  // ── Body ──
  body: {
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 8,
  },

  // ── Active Workout Card ──
  workoutCard: {
    overflow: 'hidden',
  },
  workoutCardInner: {
    gap: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MonsterColors.primary,
  },
  liveText: {
    color: MonsterColors.primary,
    letterSpacing: 2,
  },
  workoutNumber: {
    color: 'rgba(255,255,255,0.06)',
    fontSize: 32,
    fontWeight: '900',
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  workoutName: {
    maxWidth: '55%',
    color: MonsterColors.textPrimary,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 24,
  },

  // ── CTA Card (no active workout) ──
  ctaCardInner: {
    gap: 16,
  },
  ctaIllustration: {
    position: 'absolute',
    right: -10,
    top: -10,
  },
  ctaContent: {
    gap: 8,
  },
  ctaLabel: {
    color: MonsterColors.primary,
    letterSpacing: 3,
  },
  ctaDescription: {
    color: MonsterColors.textSecondary,
    maxWidth: '75%',
  },

  // ── Stats Grid ──
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,255,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
  },
  statLabel: {
    color: MonsterColors.textMuted,
    marginTop: 4,
  },

  // ── Section Header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  sectionTitle: {
    color: MonsterColors.textMuted,
    letterSpacing: 3,
  },

  // ── Quick Actions ──
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    justifyContent: 'space-between',
  },
  quickActionContent: {
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(6,182,212,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  quickActionLabel: {
    color: MonsterColors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionDate: {
    color: MonsterColors.textMuted,
    opacity: 0.5,
    marginTop: 2,
  },
  tipLabel: {
    color: MonsterColors.amber,
    marginTop: 4,
    letterSpacing: 2,
  },
  tipTitle: {
    color: MonsterColors.textPrimary,
    textAlign: 'center',
    marginTop: 4,
  },
  tipMuscle: {
    color: MonsterColors.textMuted,
    opacity: 0.6,
    marginTop: 2,
  },

  // ── Progress CTA ──
  progressRow: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  progressTitle: {
    color: MonsterColors.textPrimary,
  },
  progressSub: {
    color: MonsterColors.textMuted,
    marginLeft: 28,
  },

  // ── AI Coach Card ──
  coachCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  coachAvatarGrad: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  coachTitle: {
    color: MonsterColors.textPrimary,
    letterSpacing: 1,
  },
  coachSub: {
    color: MonsterColors.textMuted,
    marginTop: 2,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.2)',
  },
  onlinePillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: MonsterColors.primary,
  },

  // ── PRO Upgrade Banner ──
  proBanner: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  proBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  proBannerTitle: {
    color: MonsterColors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  proBannerSub: {
    color: MonsterColors.textMuted,
    marginTop: 1,
    fontSize: 9,
  },
});
