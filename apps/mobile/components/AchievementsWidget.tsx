/**
 * AchievementsWidget — Grid of unlocked/locked achievement badges
 */
import { MonsterColors } from '@/constants/Colors';
import { Achievement } from '@/lib/achievements';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { MonsterText } from './MonsterText';

interface Props {
  achievements: Achievement[];
}

export function AchievementsWidget({ achievements }: Props) {
  const [detail, setDetail] = useState<Achievement | null>(null);
  const unlocked = achievements.filter(a => a.unlocked).length;

  return (
    <>
      <GlassCard>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <MonsterText variant="titleSm" style={styles.title}>CONQUISTAS</MonsterText>
          </View>
          <View style={styles.progressPill}>
            <Text style={styles.progressText}>{unlocked}/{achievements.length}</Text>
          </View>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {achievements.map((a, i) => (
            <Animated.View key={a.id} entering={ZoomIn.delay(i * 40).duration(280)}>
              <TouchableOpacity
                style={[styles.badge, !a.unlocked && styles.badgeLocked]}
                onPress={() => setDetail(a)}
                activeOpacity={0.75}
              >
                <View style={[
                  styles.emojiWrap,
                  a.unlocked
                    ? { borderColor: a.color + '50', backgroundColor: a.color + '18' }
                    : styles.emojiWrapLocked,
                ]}>
                  <Text style={[styles.emoji, !a.unlocked && styles.emojiLocked]}>
                    {a.emoji}
                  </Text>
                </View>
                <Text
                  style={[styles.badgeTitle, !a.unlocked && styles.lockedText]}
                  numberOfLines={2}
                >
                  {a.title}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </GlassCard>

      {/* Detail Modal */}
      <Modal transparent visible={!!detail} animationType="fade" onRequestClose={() => setDetail(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setDetail(null)}>
          {detail && (
            <View style={[styles.detailCard, { borderColor: detail.color + '40' }]}>
              <Text style={styles.detailEmoji}>{detail.emoji}</Text>
              <Text style={[styles.detailTitle, detail.unlocked && { color: detail.color }]}>
                {detail.title}
              </Text>
              <Text style={styles.detailDesc}>{detail.description}</Text>
              <View style={[styles.statusBadge, detail.unlocked ? styles.statusUnlocked : styles.statusLocked]}>
                <Text style={styles.statusText}>
                  {detail.unlocked ? '✓ DESBLOQUEADO' : '🔒 BLOQUEADO'}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: MonsterColors.textPrimary,
    letterSpacing: 2,
  },
  progressPill: {
    backgroundColor: 'rgba(0,255,136,0.12)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.2)',
  },
  progressText: {
    color: MonsterColors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    width: 66,
    alignItems: 'center',
    gap: 5,
  },
  badgeLocked: {
    opacity: 0.35,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiWrapLocked: {
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  emoji: {
    fontSize: 22,
  },
  emojiLocked: {
    opacity: 0.4,
  },
  badgeTitle: {
    fontSize: 8,
    fontWeight: '700',
    color: MonsterColors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 11,
  },
  lockedText: {
    color: MonsterColors.textMuted,
  },

  // Detail modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCard: {
    backgroundColor: MonsterColors.elevated,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 28,
    alignItems: 'center',
    width: 240,
    gap: 8,
  },
  detailEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: MonsterColors.textPrimary,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  detailDesc: {
    fontSize: 12,
    color: MonsterColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusUnlocked: {
    backgroundColor: 'rgba(0,255,136,0.15)',
  },
  statusLocked: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: MonsterColors.textSecondary,
    letterSpacing: 1,
  },
});
