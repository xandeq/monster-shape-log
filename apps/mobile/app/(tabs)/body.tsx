/**
 * Body Screen - Interactive muscle diagram with training heatmap
 */
import BodyDiagram from '@/components/BodyDiagram';
import { MonsterColors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

function StatPill({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <View style={[styles.statPill, { borderColor: color + '33' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function BodyScreen() {
  const { history } = useWorkout();

  const stats = useMemo(() => {
    const last7 = history.filter((w) => {
      const days = (Date.now() - new Date(w.date).getTime()) / 86_400_000;
      return days <= 7;
    });
    const last30 = history.filter((w) => {
      const days = (Date.now() - new Date(w.date).getTime()) / 86_400_000;
      return days <= 30;
    });

    // Count unique muscle groups trained in last 7 days
    const musclesThisWeek = new Set<string>();
    for (const w of last7) {
      for (const ex of w.exercises) {
        musclesThisWeek.add(ex.name.split(' ')[0]); // rough grouping
      }
    }

    return {
      workoutsWeek: last7.length,
      workoutsMonth: last30.length,
      musclesWeek: musclesThisWeek.size,
    };
  }, [history]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
        <LinearGradient
          colors={['rgba(0,255,136,0.08)', 'transparent']}
          style={styles.headerGradient}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="body" size={22} color={MonsterColors.primary} />
            <Text style={styles.headerTitle}>MAPA MUSCULAR</Text>
          </View>
          <Text style={styles.headerSub}>
            Músculos acendem conforme seus treinos recentes
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Quick stats */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
        <StatPill
          icon="🔥"
          value={String(stats.workoutsWeek)}
          label="esta semana"
          color={MonsterColors.primary}
        />
        <StatPill
          icon="📅"
          value={String(stats.workoutsMonth)}
          label="este mês"
          color={MonsterColors.cyan}
        />
        <StatPill
          icon="💪"
          value={String(stats.musclesWeek)}
          label="grupos ativos"
          color={MonsterColors.amber}
        />
      </Animated.View>

      {/* Body diagram */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.diagramCard}>
        <BodyDiagram />
      </Animated.View>

      {/* Recovery guide */}
      <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.recoveryCard}>
        <Text style={styles.recoveryTitle}>GUIA DE RECUPERAÇÃO</Text>
        <View style={styles.recoveryGrid}>
          {[
            { color: MonsterColors.primary, label: 'Hoje', desc: 'Treinado hoje' },
            { color: '#AAFF77', label: 'Ontem', desc: '24h de recuperação' },
            { color: '#FFDD00', label: '2-3 dias', desc: 'Quase recuperado' },
            { color: '#FF9900', label: '4-5 dias', desc: 'Bom para retreinar' },
            { color: '#888', label: '+7 dias', desc: 'Não treinado' },
          ].map(({ color, label, desc }) => (
            <View key={label} style={styles.recoveryItem}>
              <View style={[styles.recoveryDot, { backgroundColor: color }]} />
              <View>
                <Text style={[styles.recoveryLabel, { color }]}>{label}</Text>
                <Text style={styles.recoveryDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: MonsterColors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  header: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.12)',
  },
  headerGradient: {
    padding: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: MonsterColors.textPrimary,
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: 13,
    color: MonsterColors.textSecondary,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    gap: 2,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9,
    color: MonsterColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  diagramCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
    minHeight: 300,
  },
  recoveryCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
  },
  recoveryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: MonsterColors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  recoveryGrid: {
    gap: 8,
  },
  recoveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recoveryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  recoveryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  recoveryDesc: {
    fontSize: 11,
    color: MonsterColors.textMuted,
  },
});
