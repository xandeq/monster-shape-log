import { MonsterColors } from '@/constants/Colors';
import { useWorkout, Workout } from '@/context/WorkoutContext';
import { WorkoutDetailsModal } from '@/components/WorkoutDetailsModal';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function HistoryScreen() {
  const { history, deleteWorkout, refreshHistory } = useWorkout();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const countSets = (workout: Workout) =>
    workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);

  const totalVolume = (workout: Workout) => {
    const vol = workout.exercises.reduce((acc, ex) =>
      acc + ex.sets.reduce((s, set) => {
        if (!set.completed) return s;
        return s + (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0);
      }, 0), 0);
    return vol > 0 ? `${vol.toLocaleString('pt-BR')}kg` : null;
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshHistory();
    } finally {
      setRefreshing(false);
    }
  }, [refreshHistory]);

  const handleDelete = (item: Workout) => {
    const doDelete = async () => {
      setDeletingId(item.id);
      try {
        await deleteWorkout(item.id);
      } finally {
        setDeletingId(null);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Excluir este treino?')) doDelete();
    } else {
      Alert.alert('Excluir Treino', `"${item.name}" será removido permanentemente.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // ── Empty state ──
  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="barbell-outline" size={64} color={MonsterColors.textMuted} />
          <Text style={styles.emptyTitle}>NENHUM TREINO AINDA</Text>
          <Text style={styles.emptySubtitle}>
            Vá para a aba Treino e esmague seu primeiro treino!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header stats */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: MonsterColors.primary }]}>{history.length}</Text>
          <Text style={styles.statLabel}>TREINOS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: MonsterColors.cyan }]}>
            {history.filter(w => {
              const days = (Date.now() - new Date(w.date).getTime()) / 86_400_000;
              return days <= 7;
            }).length}
          </Text>
          <Text style={styles.statLabel}>ESTA SEMANA</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: MonsterColors.amber }]}>
            {Math.round(history.reduce((a, w) => a + w.duration, 0) / 3600)}h
          </Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </View>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 4 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={MonsterColors.primary}
            colors={[MonsterColors.primary]}
          />
        }
        renderItem={({ item, index }) => {
          const vol = totalVolume(item);
          const sets = countSets(item);
          const isDeleting = deletingId === item.id;

          return (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
              <TouchableOpacity
                onPress={() => { setSelectedWorkout(item); setDetailsVisible(true); }}
                activeOpacity={0.75}
                style={styles.card}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                  style={styles.cardGradient}>
                  {/* Left accent bar */}
                  <View style={[styles.accentBar, { backgroundColor: MonsterColors.primary }]} />

                  <View style={styles.cardContent}>
                    {/* Date + name */}
                    <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>

                    {/* Chips */}
                    <View style={styles.chipsRow}>
                      <View style={styles.chip}>
                        <Ionicons name="time-outline" size={11} color={MonsterColors.textMuted} />
                        <Text style={styles.chipText}>{formatDuration(item.duration)}</Text>
                      </View>
                      <View style={styles.chip}>
                        <Ionicons name="checkmark-circle-outline" size={11} color={MonsterColors.textMuted} />
                        <Text style={styles.chipText}>{sets} séries</Text>
                      </View>
                      {vol && (
                        <View style={styles.chip}>
                          <Ionicons name="trending-up-outline" size={11} color={MonsterColors.textMuted} />
                          <Text style={styles.chipText}>{vol}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Right actions */}
                  <View style={styles.cardActions}>
                    {isDeleting ? (
                      <ActivityIndicator size="small" color={MonsterColors.error} />
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        style={styles.deleteBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="trash-outline" size={18} color={MonsterColors.error} />
                      </TouchableOpacity>
                    )}
                    <Ionicons name="chevron-forward" size={16} color={MonsterColors.textMuted} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

      <WorkoutDetailsModal
        visible={detailsVisible}
        workout={selectedWorkout}
        onClose={() => setDetailsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MonsterColors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 12,
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9,
    color: MonsterColors.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: MonsterColors.textMuted,
    letterSpacing: 2,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: MonsterColors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 76,
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    opacity: 0.7,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 11,
    color: MonsterColors.textMuted,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: MonsterColors.textPrimary,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  chipText: {
    fontSize: 10,
    color: MonsterColors.textSecondary,
  },
  cardActions: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    padding: 4,
  },
});
