/**
 * BodyDiagram - Interactive anatomical muscle map
 * Front/back SVG body with neon highlights based on training recency
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Rect,
  Stop,
  G,
} from 'react-native-svg';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { MonsterColors } from '@/constants/Colors';
import { EXERCISES } from '@/constants/Exercises';
import { useWorkout } from '@/context/WorkoutContext';

// ─── Types ──────────────────────────────────────────────────────────────────

export type MuscleKey = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
type ViewMode = 'front' | 'back';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_TO_MUSCLE: Record<string, MuscleKey> = {
  Peito: 'chest',
  Costas: 'back',
  Pernas: 'legs',
  Ombros: 'shoulders',
  Braços: 'arms',
  Core: 'core',
  Cardio: 'legs',
};

const MUSCLE_LABELS: Record<MuscleKey, string> = {
  chest: 'PEITO',
  back: 'COSTAS',
  legs: 'PERNAS',
  shoulders: 'OMBROS',
  arms: 'BRAÇOS',
  core: 'CORE',
};

const MUSCLE_COLORS: Record<MuscleKey, string> = {
  chest: '#06B6D4',
  back: '#7C3AED',
  legs: '#00FF88',
  shoulders: '#F59E0B',
  arms: '#FF2D55',
  core: '#F97316',
};

const MUSCLE_ICONS: Record<MuscleKey, string> = {
  chest: '💪',
  back: '🏋️',
  legs: '🦵',
  shoulders: '🔥',
  arms: '💪',
  core: '⚡',
};

// ─── SVG Paths (viewBox 0 0 200 480) ────────────────────────────────────────

/** Front-view muscle paths per group */
const FRONT_PATHS: Record<MuscleKey, string[]> = {
  chest: [
    // Left pec
    'M 84,64 Q 58,68 50,88 Q 46,106 58,118 Q 70,124 84,120 Z',
    // Right pec
    'M 116,64 Q 142,68 150,88 Q 154,106 142,118 Q 130,124 116,120 Z',
  ],
  shoulders: [
    // Left front delt
    'M 48,84 Q 34,76 28,94 Q 24,112 34,124 Q 46,130 56,120 Q 62,110 60,96 Q 56,84 48,84 Z',
    // Right front delt
    'M 152,84 Q 166,76 172,94 Q 176,112 166,124 Q 154,130 144,120 Q 138,110 140,96 Q 144,84 152,84 Z',
  ],
  arms: [
    // Left bicep
    'M 26,126 Q 16,132 12,150 Q 10,168 18,180 Q 28,186 40,180 Q 48,170 48,154 Q 48,138 38,128 Z',
    // Right bicep
    'M 174,126 Q 184,132 188,150 Q 190,168 182,180 Q 172,186 160,180 Q 152,170 152,154 Q 152,138 162,128 Z',
    // Left forearm
    'M 10,184 Q 4,198 4,214 Q 6,226 16,230 Q 28,230 34,220 Q 38,208 40,184 Z',
    // Right forearm
    'M 190,184 Q 196,198 196,214 Q 194,226 184,230 Q 172,230 166,220 Q 162,208 160,184 Z',
  ],
  core: [
    // Abs center
    'M 84,122 Q 80,132 78,152 Q 76,172 78,194 L 84,210 L 100,214 L 116,210 L 122,194 Q 124,172 122,152 Q 120,132 116,122 Z',
    // Left oblique
    'M 50,118 Q 44,136 44,160 Q 44,180 52,198 Q 62,212 78,214 L 84,210 Q 78,194 78,174 Q 78,148 84,122 Q 74,120 64,118 Z',
    // Right oblique
    'M 150,118 Q 156,136 156,160 Q 156,180 148,198 Q 138,212 122,214 L 116,210 Q 122,194 122,174 Q 122,148 116,122 Q 126,120 136,118 Z',
  ],
  legs: [
    // Left quad
    'M 70,220 Q 60,248 58,278 Q 56,300 66,316 Q 76,324 88,318 Q 94,308 94,284 Q 94,256 90,228 Z',
    // Right quad
    'M 130,220 Q 140,248 142,278 Q 144,300 134,316 Q 124,324 112,318 Q 106,308 106,284 Q 106,256 110,228 Z',
    // Inner quads
    'M 92,228 Q 96,260 96,284 Q 96,306 102,318 L 100,320 L 98,318 Q 104,306 104,284 Q 104,260 108,228 Z',
    // Left calf
    'M 64,324 Q 56,344 56,366 Q 54,388 62,402 Q 72,412 84,406 Q 90,394 90,372 Q 88,348 86,328 Z',
    // Right calf
    'M 136,324 Q 144,344 144,366 Q 146,388 138,402 Q 128,412 116,406 Q 110,394 110,372 Q 112,348 114,328 Z',
  ],
  back: [], // not visible in front
};

/** Back-view muscle paths per group */
const BACK_PATHS: Record<MuscleKey, string[]> = {
  back: [
    // Left trap
    'M 84,64 Q 68,70 54,84 Q 44,100 50,116 Q 62,124 76,118 Q 88,110 90,92 Z',
    // Right trap
    'M 116,64 Q 132,70 146,84 Q 156,100 150,116 Q 138,124 124,118 Q 112,110 110,92 Z',
    // Left lat
    'M 48,118 Q 40,146 42,176 Q 46,200 60,212 Q 72,218 86,212 L 88,128 Q 76,122 62,120 Z',
    // Right lat
    'M 152,118 Q 160,146 158,176 Q 154,200 140,212 Q 128,218 114,212 L 112,128 Q 124,122 138,120 Z',
    // Lower back
    'M 86,214 Q 80,236 80,264 Q 80,288 88,306 L 100,312 L 112,306 Q 120,288 120,264 Q 120,236 114,214 Z',
  ],
  shoulders: [
    // Left rear delt
    'M 36,96 Q 24,88 20,108 Q 18,124 28,134 Q 40,140 52,132 Q 58,120 56,106 Q 52,94 36,96 Z',
    // Right rear delt
    'M 164,96 Q 176,88 180,108 Q 182,124 172,134 Q 160,140 148,132 Q 142,120 144,106 Q 148,94 164,96 Z',
  ],
  arms: [
    // Left tricep
    'M 22,132 Q 12,138 8,158 Q 6,176 14,188 Q 26,194 38,186 Q 46,176 46,158 Q 44,140 34,134 Z',
    // Right tricep
    'M 178,132 Q 188,138 192,158 Q 194,176 186,188 Q 174,194 162,186 Q 154,176 154,158 Q 156,140 166,134 Z',
    // Left rear forearm
    'M 8,192 Q 2,208 2,224 Q 4,234 14,238 Q 26,238 32,228 Q 36,216 38,192 Z',
    // Right rear forearm
    'M 192,192 Q 198,208 198,224 Q 196,234 186,238 Q 174,238 168,228 Q 164,216 162,192 Z',
  ],
  core: [
    // Lower back already in 'back'
  ],
  legs: [
    // Left glute
    'M 68,226 Q 60,250 60,278 Q 60,300 72,316 Q 84,326 98,322 L 100,318 Q 96,302 96,278 Q 96,252 92,232 L 84,224 Z',
    // Right glute
    'M 132,226 Q 140,250 140,278 Q 140,300 128,316 Q 116,326 102,322 L 100,318 Q 104,302 104,278 Q 104,252 108,232 L 116,224 Z',
    // Left hamstring
    'M 66,322 Q 56,346 54,372 Q 52,396 62,412 Q 72,422 84,416 Q 92,404 92,380 Q 90,354 88,328 Z',
    // Right hamstring
    'M 134,322 Q 144,346 146,372 Q 148,396 138,412 Q 128,422 116,416 Q 108,404 108,380 Q 110,354 112,328 Z',
    // Left calf (back - gastroc)
    'M 58,416 Q 50,436 50,458 Q 52,474 62,480 Q 74,482 82,474 Q 86,462 86,442 Q 86,424 84,418 Z',
    // Right calf (back)
    'M 142,416 Q 150,436 150,458 Q 148,474 138,480 Q 126,482 118,474 Q 114,462 114,442 Q 114,424 116,418 Z',
  ],
  chest: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns 0-1 intensity based on how recently the muscle was trained */
function getMuscleIntensity(
  muscleName: MuscleKey,
  history: import('@/context/WorkoutContext').Workout[],
): number {
  const now = Date.now();
  const DAY = 86_400_000;

  // Find most recent workout + total volume for this muscle in last 7 days
  let mostRecentMs = 0;
  let totalVolumeLast7 = 0;

  for (const workout of history) {
    const workoutDate = new Date(workout.date).getTime();
    const daysSince = (now - workoutDate) / DAY;

    for (const ex of workout.exercises) {
      const exerciseData = EXERCISES.find(
        (e) => e.name.toLowerCase() === ex.name.toLowerCase(),
      );
      if (!exerciseData) continue;
      const muscle = CATEGORY_TO_MUSCLE[exerciseData.muscleGroup];
      if (muscle !== muscleName) continue;

      if (workoutDate > mostRecentMs) mostRecentMs = workoutDate;

      // Accumulate volume (weight × reps on completed sets) in last 7 days
      if (daysSince <= 7) {
        for (const set of ex.sets) {
          if (set.completed) {
            totalVolumeLast7 += (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0);
          }
        }
      }
    }
  }

  if (!mostRecentMs) return 0;

  const daysSince = (now - mostRecentMs) / DAY;

  // Base score from recency
  let base: number;
  if (daysSince <= 1) base = 1.0;
  else if (daysSince <= 2) base = 0.8;
  else if (daysSince <= 3) base = 0.6;
  else if (daysSince <= 5) base = 0.4;
  else if (daysSince <= 7) base = 0.2;
  else base = 0.08;

  // Volume bonus: normalize up to 10000kg → +0 to +0.15 boost
  const volumeBonus = Math.min(totalVolumeLast7 / 10000, 1) * 0.15;

  return Math.min(base + volumeBonus, 1.0);
}

/** Converts hex + opacity to rgba string */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Sub-component: Body SVG ──────────────────────────────────────────────────

function BodySvg({
  view,
  intensities,
  selectedMuscle,
  onMuscleTap,
}: {
  view: ViewMode;
  intensities: Record<MuscleKey, number>;
  selectedMuscle: MuscleKey | null;
  onMuscleTap: (m: MuscleKey) => void;
}) {
  const isBack = view === 'back';
  const paths = isBack ? BACK_PATHS : FRONT_PATHS;
  const muscles = Object.keys(MUSCLE_COLORS) as MuscleKey[];

  return (
    <Svg
      viewBox="0 0 200 490"
      width="100%"
      height="100%"
      style={{ maxHeight: 480 }}>
      <Defs>
        {muscles.map((m) => (
          <LinearGradient key={m} id={`grad_${m}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={MUSCLE_COLORS[m]} stopOpacity="1" />
            <Stop offset="1" stopColor={MUSCLE_COLORS[m]} stopOpacity="0.5" />
          </LinearGradient>
        ))}
      </Defs>

      {/* ── Body outline ── */}

      {/* Head */}
      <Circle cx="100" cy="28" r="22" fill="#1A2040" stroke="#2A3060" strokeWidth="1.5" />
      {/* Hair / head top */}
      <Path d="M 78,16 Q 100,2 122,16 Q 116,8 100,6 Q 84,8 78,16 Z" fill="#0F1530" />
      {/* Eyes */}
      <Ellipse cx="92" cy="28" rx="3" ry="2.5" fill="#06B6D4" opacity="0.7" />
      <Ellipse cx="108" cy="28" rx="3" ry="2.5" fill="#06B6D4" opacity="0.7" />

      {/* Neck */}
      <Rect x="89" y="48" width="22" height="18" rx="4" fill="#1A2040" stroke="#2A3060" strokeWidth="1" />

      {/* Torso outline */}
      {!isBack ? (
        <Path
          d="M 56,64 Q 36,72 26,96 Q 18,118 22,138 L 6,192 Q 2,218 6,232 L 8,236 L 14,236 Q 8,230 14,224 L 14,232 L 14,244 L 62,244 L 62,240 L 68,240 L 68,244 L 132,244 L 132,240 L 138,240 L 138,244 L 186,244 L 186,232 L 192,224 L 186,236 L 192,236 L 194,232 L 194,192 L 178,138 Q 182,118 174,96 Q 164,72 144,64 L 116,62 L 100,60 L 84,62 Z"
          fill="#0E1428"
          stroke="#1E2848"
          strokeWidth="1"
        />
      ) : (
        <Path
          d="M 56,64 Q 36,72 26,96 Q 18,118 22,138 L 6,192 Q 2,218 6,232 L 8,236 L 186,236 L 194,232 L 194,192 L 178,138 Q 182,118 174,96 Q 164,72 144,64 L 116,62 L 100,60 L 84,62 Z"
          fill="#0E1428"
          stroke="#1E2848"
          strokeWidth="1"
        />
      )}

      {/* Pelvis */}
      <Path
        d="M 62,236 Q 56,250 58,264 L 66,266 L 100,270 L 134,266 L 142,264 Q 144,250 138,236 Z"
        fill="#121830"
        stroke="#1E2848"
        strokeWidth="1"
      />

      {/* Left leg outline */}
      <Path
        d="M 62,268 Q 54,300 54,340 Q 52,380 58,420 L 58,480 L 92,480 L 96,420 Q 100,380 100,340 Q 100,300 96,268 Z"
        fill="#0E1428"
        stroke="#1E2848"
        strokeWidth="1"
      />
      {/* Right leg outline */}
      <Path
        d="M 138,268 Q 146,300 146,340 Q 148,380 142,420 L 142,480 L 108,480 L 104,420 Q 100,380 100,340 Q 100,300 104,268 Z"
        fill="#0E1428"
        stroke="#1E2848"
        strokeWidth="1"
      />

      {/* ── Muscle overlays ── */}
      {muscles.map((muscle) => {
        const intensity = intensities[muscle];
        const color = MUSCLE_COLORS[muscle];
        const isSelected = selectedMuscle === muscle;
        const effectiveIntensity = isSelected ? Math.max(intensity, 0.5) : intensity;
        const opacity = effectiveIntensity === 0 ? 0.08 : effectiveIntensity;
        const glowOpacity = isSelected ? 0.6 : opacity * 0.5;
        const musclePaths = paths[muscle] ?? [];

        if (musclePaths.length === 0) return null;

        return (
          <G key={muscle}>
            {/* Glow layer */}
            {musclePaths.map((d, i) => (
              <Path
                key={`glow_${i}`}
                d={d}
                fill={color}
                opacity={glowOpacity * 0.4}
                stroke={color}
                strokeWidth="4"
                strokeOpacity={glowOpacity * 0.3}
              />
            ))}
            {/* Main fill — last path handles onPress for reliable Android touch */}
            {musclePaths.map((d, i) => (
              <Path
                key={`fill_${i}`}
                d={d}
                fill={isSelected ? `url(#grad_${muscle})` : color}
                opacity={opacity}
                stroke={color}
                strokeWidth={isSelected ? 1.5 : 0.5}
                strokeOpacity={isSelected ? 1 : 0.4}
                onPress={() => onMuscleTap(muscle)}
              />
            ))}
          </G>
        );
      })}

      {/* Spine line */}
      {isBack && (
        <Path
          d="M 100,62 L 100,236"
          stroke="#2A3060"
          strokeWidth="1.5"
          strokeDasharray="4,3"
          opacity="0.4"
        />
      )}

      {/* Abs detail lines (front only) */}
      {!isBack && intensities.core > 0 && (
        <>
          <Path d="M 84,140 Q 100,143 116,140" stroke={MUSCLE_COLORS.core} strokeWidth="1" opacity={intensities.core * 0.6} fill="none" />
          <Path d="M 82,160 Q 100,163 118,160" stroke={MUSCLE_COLORS.core} strokeWidth="1" opacity={intensities.core * 0.6} fill="none" />
          <Path d="M 82,180 Q 100,183 118,180" stroke={MUSCLE_COLORS.core} strokeWidth="1" opacity={intensities.core * 0.6} fill="none" />
          <Path d="M 100,122 L 100,200" stroke={MUSCLE_COLORS.core} strokeWidth="1" opacity={intensities.core * 0.4} />
        </>
      )}
    </Svg>
  );
}

// ─── Legend item ──────────────────────────────────────────────────────────────

function LegendItem({
  muscle,
  intensity,
  selected,
  onPress,
}: {
  muscle: MuscleKey;
  intensity: number;
  selected: boolean;
  onPress: () => void;
}) {
  const color = MUSCLE_COLORS[muscle];
  const label = MUSCLE_LABELS[muscle];
  const daysText =
    intensity === 0
      ? 'Não treinado'
      : intensity >= 1.0
      ? 'Hoje'
      : intensity >= 0.8
      ? 'Ontem'
      : intensity >= 0.6
      ? '2-3 dias'
      : intensity >= 0.4
      ? '4-5 dias'
      : intensity >= 0.2
      ? '6-7 dias'
      : '+7 dias';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.legendItem,
        selected && { borderColor: color, backgroundColor: hexToRgba(color, 0.12) },
      ]}>
      {/* Color dot */}
      <View
        style={[
          styles.legendDot,
          {
            backgroundColor: color,
            opacity: intensity === 0 ? 0.25 : 1,
            shadowColor: color,
            shadowOpacity: intensity > 0 ? 0.7 : 0,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 0 },
            elevation: intensity > 0 ? 4 : 0,
          },
        ]}
      />
      <View style={styles.legendTextContainer}>
        <Text style={[styles.legendLabel, { color: intensity === 0 ? MonsterColors.textMuted : MonsterColors.textPrimary }]}>
          {label}
        </Text>
        <Text style={[styles.legendSub, { color: intensity === 0 ? '#4A5568' : color }]}>
          {daysText}
        </Text>
      </View>
      {/* Intensity bar */}
      <View style={styles.intensityBarBg}>
        <View
          style={[
            styles.intensityBarFill,
            {
              width: `${intensity * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

// ─── Exercise chip ────────────────────────────────────────────────────────────

function ExerciseChip({ name }: { name: string }) {
  return (
    <View style={styles.exerciseChip}>
      <Text style={styles.exerciseChipText}>{name}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BodyDiagram() {
  const { history } = useWorkout();
  const [view, setView] = useState<ViewMode>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleKey | null>(null);

  const intensities = useMemo(() => {
    const muscles: MuscleKey[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
    return Object.fromEntries(
      muscles.map((m) => [m, getMuscleIntensity(m, history)]),
    ) as Record<MuscleKey, number>;
  }, [history]);

  const musclesForSelected = useMemo(() => {
    if (!selectedMuscle) return [];
    const cat = Object.entries(CATEGORY_TO_MUSCLE).find(([, v]) => v === selectedMuscle)?.[0];
    if (!cat) return [];
    return EXERCISES.filter((e) => e.muscleGroup === cat).map((e) => e.name);
  }, [selectedMuscle]);

  const handleMuscleTap = (muscle: MuscleKey) => {
    setSelectedMuscle((prev) => (prev === muscle ? null : muscle));
  };

  return (
    <View style={styles.container}>
      {/* ── Toggle front/back ── */}
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleBtn, view === 'front' && styles.toggleActive]}
          onPress={() => setView('front')}>
          <Ionicons
            name="body-outline"
            size={14}
            color={view === 'front' ? MonsterColors.background : MonsterColors.textMuted}
          />
          <Text style={[styles.toggleText, view === 'front' && styles.toggleTextActive]}>
            FRENTE
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, view === 'back' && styles.toggleActive]}
          onPress={() => setView('back')}>
          <Ionicons
            name="body"
            size={14}
            color={view === 'back' ? MonsterColors.background : MonsterColors.textMuted}
          />
          <Text style={[styles.toggleText, view === 'back' && styles.toggleTextActive]}>
            COSTAS
          </Text>
        </Pressable>
      </View>

      {/* ── Main layout: SVG + legend ── */}
      <View style={styles.mainRow}>
        {/* Body SVG */}
        <View style={styles.svgContainer}>
          <BodySvg
            view={view}
            intensities={intensities}
            selectedMuscle={selectedMuscle}
            onMuscleTap={handleMuscleTap}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          {(Object.keys(MUSCLE_COLORS) as MuscleKey[]).map((m) => (
            <LegendItem
              key={m}
              muscle={m}
              intensity={intensities[m]}
              selected={selectedMuscle === m}
              onPress={() => handleMuscleTap(m)}
            />
          ))}
        </View>
      </View>

      {/* ── Selected muscle exercises ── */}
      {selectedMuscle && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.exercisePanel}>
          <View style={styles.exercisePanelHeader}>
            <View
              style={[
                styles.exercisePanelDot,
                { backgroundColor: MUSCLE_COLORS[selectedMuscle] },
              ]}
            />
            <Text style={[styles.exercisePanelTitle, { color: MUSCLE_COLORS[selectedMuscle] }]}>
              {MUSCLE_LABELS[selectedMuscle]}
            </Text>
            <Text style={styles.exercisePanelCount}>
              {musclesForSelected.length} exercícios
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseScroll}>
            {musclesForSelected.map((name) => (
              <ExerciseChip key={name} name={name} />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* ── Hint ── */}
      {!selectedMuscle && (
        <Animated.View entering={FadeIn.duration(600)} style={styles.hint}>
          <Ionicons name="finger-print-outline" size={14} color={MonsterColors.textMuted} />
          <Text style={styles.hintText}>Toque em um músculo para ver os exercícios</Text>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  toggleRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 17,
  },
  toggleActive: {
    backgroundColor: MonsterColors.primary,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: MonsterColors.textMuted,
    letterSpacing: 1,
  },
  toggleTextActive: {
    color: MonsterColors.background,
  },
  mainRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  svgContainer: {
    flex: 1,
    aspectRatio: 200 / 490,
    maxHeight: 400,
    alignSelf: 'flex-start',
  },
  legendContainer: {
    width: 140,
    gap: 4,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  legendSub: {
    fontSize: 9,
    marginTop: 1,
  },
  intensityBarBg: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  intensityBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  exercisePanel: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  exercisePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  exercisePanelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exercisePanelTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  exercisePanelCount: {
    fontSize: 11,
    color: MonsterColors.textMuted,
    marginLeft: 'auto',
  },
  exerciseScroll: {
    flexGrow: 0,
  },
  exerciseChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  exerciseChipText: {
    fontSize: 11,
    color: MonsterColors.textSecondary,
    fontWeight: '500',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    opacity: 0.5,
  },
  hintText: {
    fontSize: 11,
    color: MonsterColors.textMuted,
  },
});
