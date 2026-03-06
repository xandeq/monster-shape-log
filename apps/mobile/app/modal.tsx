/**
 * Analytics Screen - Volume, frequency, PRs, 1RM estimates
 * Replaces the empty modal placeholder
 */
import { MonsterColors } from '@/constants/Colors';
import { EXERCISES } from '@/constants/Exercises';
import { useWorkout } from '@/context/WorkoutContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Epley formula: estimates 1RM from weight × reps */
function epley1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

function weekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday start
  return d.toISOString().slice(0, 10);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleBar} />
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  );
}

/** Weekly volume bar chart using SVG */
function VolumeChart({ weeks }: { weeks: { label: string; volume: number }[] }) {
  const maxVol = Math.max(...weeks.map((w) => w.volume), 1);
  const BAR_W = 28;
  const CHART_H = 100;
  const GAP = 8;
  const totalW = weeks.length * (BAR_W + GAP) - GAP;

  return (
    <View style={styles.chartContainer}>
      <Svg width="100%" height={CHART_H + 24} viewBox={`0 0 ${totalW} ${CHART_H + 24}`}>
        {weeks.map((w, i) => {
          const barH = w.volume === 0 ? 4 : Math.max((w.volume / maxVol) * CHART_H, 8);
          const x = i * (BAR_W + GAP);
          const y = CHART_H - barH;
          const isLast = i === weeks.length - 1;

          return (
            <G key={w.label}>
              {/* Background bar */}
              <Rect x={x} y={0} width={BAR_W} height={CHART_H} rx={6} fill="rgba(255,255,255,0.04)" />
              {/* Volume bar */}
              <Rect
                x={x}
                y={y}
                width={BAR_W}
                height={barH}
                rx={6}
                fill={isLast ? MonsterColors.primary : 'rgba(0,255,136,0.45)'}
                opacity={w.volume === 0 ? 0.2 : 1}
              />
              {/* Label */}
              <SvgText
                x={x + BAR_W / 2}
                y={CHART_H + 16}
                textAnchor="middle"
                fontSize="9"
                fill={isLast ? MonsterColors.primary : MonsterColors.textMuted}>
                {w.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      <Text style={styles.chartUnit}>Volume total (kg × reps)</Text>
    </View>
  );
}

/** 35-day training heatmap */
function TrainingHeatmap({ trainedDates }: { trainedDates: Set<string> }) {
  const days: { date: Date; key: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Go back 34 days to show 5 full weeks
  const start = new Date(today);
  start.setDate(today.getDate() - 34);

  // Align to Sunday
  const offset = start.getDay();
  start.setDate(start.getDate() - offset);

  for (let i = 0; i < 35; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({ date: d, key: d.toISOString().slice(0, 10) });
  }

  const WEEKS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const todayKey = today.toISOString().slice(0, 10);

  return (
    <View style={styles.heatmapContainer}>
      {/* Day labels */}
      <View style={styles.heatmapRow}>
        {WEEKS.map((d, i) => (
          <Text key={i} style={styles.heatmapDayLabel}>{d}</Text>
        ))}
      </View>
      {/* Grid — 5 weeks × 7 days */}
      {[0, 1, 2, 3, 4].map((week) => (
        <View key={week} style={styles.heatmapRow}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const idx = week * 7 + day;
            const cell = days[idx];
            const trained = cell && trainedDates.has(cell.key);
            const isToday = cell && cell.key === todayKey;
            const isFuture = cell && cell.date > today;

            return (
              <View
                key={day}
                style={[
                  styles.heatmapCell,
                  trained && styles.heatmapCellTrained,
                  isToday && styles.heatmapCellToday,
                  isFuture && styles.heatmapCellFuture,
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** Single PR row */
function PRRow({ rank, exercise, weight, reps, estimate }: {
  rank: number; exercise: string; weight: number; reps: number; estimate: number;
}) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
  return (
    <View style={styles.prRow}>
      <Text style={styles.prMedal}>{medal}</Text>
      <View style={styles.prInfo}>
        <Text style={styles.prName} numberOfLines={1}>{exercise}</Text>
        <Text style={styles.prSub}>{weight}kg × {reps} reps</Text>
      </View>
      <View style={styles.prEstimate}>
        <Text style={styles.prEstimateValue}>{estimate}kg</Text>
        <Text style={styles.prEstimateLabel}>1RM est.</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const { history } = useWorkout();

  // ── Weekly volumes (last 8 weeks) ──
  const weeklyVolumes = useMemo(() => {
    const map: Record<string, number> = {};

    for (const workout of history) {
      const key = weekKey(new Date(workout.date));
      const vol = workout.exercises.reduce((acc, ex) =>
        acc + ex.sets.reduce((s, set) => {
          if (!set.completed) return s;
          return s + (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0);
        }, 0), 0);
      map[key] = (map[key] || 0) + vol;
    }

    const weeks: { label: string; volume: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const key = weekKey(d);
      const label = i === 0 ? 'Agora' : `S-${i}`;
      weeks.push({ label, volume: Math.round(map[key] || 0) });
    }
    return weeks;
  }, [history]);

  // ── Trained dates heatmap ──
  const trainedDates = useMemo(() => {
    const set = new Set<string>();
    for (const w of history) {
      set.add(new Date(w.date).toISOString().slice(0, 10));
    }
    return set;
  }, [history]);

  // ── Best lifts + 1RM ──
  const topLifts = useMemo(() => {
    const bestMap: Record<string, { weight: number; reps: number; estimate: number }> = {};

    for (const workout of history) {
      for (const ex of workout.exercises) {
        for (const set of ex.sets) {
          if (!set.completed) continue;
          const w = parseFloat(set.weight) || 0;
          const r = parseFloat(set.reps) || 0;
          if (w === 0) continue;
          const est = epley1RM(w, r);
          const prev = bestMap[ex.name];
          if (!prev || est > prev.estimate) {
            bestMap[ex.name] = { weight: w, reps: r, estimate: est };
          }
        }
      }
    }

    return Object.entries(bestMap)
      .sort((a, b) => b[1].estimate - a[1].estimate)
      .slice(0, 10);
  }, [history]);

  // ── Overall stats ──
  const stats = useMemo(() => {
    const totalVol = history.reduce((acc, w) =>
      acc + w.exercises.reduce((a, ex) =>
        a + ex.sets.reduce((s, set) =>
          s + (set.completed ? (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0) : 0), 0), 0), 0);

    const totalSets = history.reduce((acc, w) =>
      acc + w.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0), 0);

    const avgDuration = history.length > 0
      ? Math.round(history.reduce((a, w) => a + w.duration, 0) / history.length / 60)
      : 0;

    return { totalVol: Math.round(totalVol), totalSets, avgDuration };
  }, [history]);

  return (
    <View style={{ flex: 1, backgroundColor: MonsterColors.background }}>
      <StatusBar style="light" />

      {/* Header */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
        <LinearGradient
          colors={['rgba(0,255,136,0.1)', 'transparent']}
          style={styles.headerGradient}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>ANALYTICS</Text>
              <Text style={styles.headerSub}>{history.length} treinos registrados</Text>
            </View>
            <Pressable onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={MonsterColors.textSecondary} />
            </Pressable>
          </View>

          {/* Overview pills */}
          <View style={styles.overviewRow}>
            {[
              { icon: '⚡', value: `${(stats.totalVol / 1000).toFixed(1)}t`, label: 'Volume total' },
              { icon: '✅', value: String(stats.totalSets), label: 'Séries feitas' },
              { icon: '⏱️', value: `${stats.avgDuration}m`, label: 'Média/treino' },
            ].map(({ icon, value, label }) => (
              <View key={label} style={styles.overviewPill}>
                <Text style={styles.overviewIcon}>{icon}</Text>
                <Text style={styles.overviewValue}>{value}</Text>
                <Text style={styles.overviewLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Volume chart */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.card}>
          <SectionTitle>VOLUME SEMANAL</SectionTitle>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>Faça seu primeiro treino para ver os dados</Text>
          ) : (
            <VolumeChart weeks={weeklyVolumes} />
          )}
        </Animated.View>

        {/* Heatmap */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.card}>
          <SectionTitle>FREQUÊNCIA — 5 SEMANAS</SectionTitle>
          <TrainingHeatmap trainedDates={trainedDates} />
          <View style={styles.heatmapLegend}>
            <View style={[styles.heatmapCell, { width: 12, height: 12 }]} />
            <Text style={styles.legendText}>Sem treino</Text>
            <View style={[styles.heatmapCell, styles.heatmapCellTrained, { width: 12, height: 12 }]} />
            <Text style={styles.legendText}>Treinado</Text>
          </View>
        </Animated.View>

        {/* Top Lifts / 1RM */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.card}>
          <SectionTitle>TOP LIFTS — 1RM ESTIMADO</SectionTitle>
          {topLifts.length === 0 ? (
            <Text style={styles.emptyText}>Conclua séries no treino para calcular seus PRs</Text>
          ) : (
            <View style={styles.prList}>
              {topLifts.map(([exercise, data], i) => (
                <PRRow
                  key={exercise}
                  rank={i + 1}
                  exercise={exercise}
                  weight={data.weight}
                  reps={data.reps}
                  estimate={data.estimate}
                />
              ))}
            </View>
          )}
          <Text style={styles.formulaNote}>
            Fórmula de Epley: 1RM = peso × (1 + reps ÷ 30)
          </Text>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: MonsterColors.textPrimary,
    letterSpacing: 3,
  },
  headerSub: {
    fontSize: 12,
    color: MonsterColors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewRow: {
    flexDirection: 'row',
    gap: 8,
  },
  overviewPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  overviewIcon: { fontSize: 16 },
  overviewValue: {
    fontSize: 18,
    fontWeight: '800',
    color: MonsterColors.primary,
  },
  overviewLabel: {
    fontSize: 9,
    color: MonsterColors.textMuted,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitleBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: MonsterColors.primary,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: MonsterColors.textMuted,
    letterSpacing: 1.5,
  },
  // Volume chart
  chartContainer: {
    alignItems: 'center',
  },
  chartUnit: {
    fontSize: 10,
    color: MonsterColors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  // Heatmap
  heatmapContainer: {
    gap: 4,
  },
  heatmapRow: {
    flexDirection: 'row',
    gap: 4,
  },
  heatmapDayLabel: {
    width: 32,
    textAlign: 'center',
    fontSize: 9,
    color: MonsterColors.textMuted,
    fontWeight: '600',
  },
  heatmapCell: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heatmapCellTrained: {
    backgroundColor: 'rgba(0,255,136,0.35)',
    borderColor: MonsterColors.primary,
  },
  heatmapCellToday: {
    borderColor: MonsterColors.cyan,
    borderWidth: 2,
  },
  heatmapCellFuture: {
    opacity: 0.3,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  legendText: {
    fontSize: 10,
    color: MonsterColors.textMuted,
    marginRight: 8,
  },
  // PRs
  prList: {
    gap: 2,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  prMedal: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  prInfo: {
    flex: 1,
  },
  prName: {
    fontSize: 13,
    fontWeight: '700',
    color: MonsterColors.textPrimary,
  },
  prSub: {
    fontSize: 11,
    color: MonsterColors.textMuted,
    marginTop: 2,
  },
  prEstimate: {
    alignItems: 'flex-end',
  },
  prEstimateValue: {
    fontSize: 16,
    fontWeight: '800',
    color: MonsterColors.primary,
  },
  prEstimateLabel: {
    fontSize: 9,
    color: MonsterColors.textMuted,
  },
  formulaNote: {
    fontSize: 10,
    color: MonsterColors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: MonsterColors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
});
