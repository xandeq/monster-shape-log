import { MonsterCard } from '@/components/MonsterCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { MonsterColors } from '@/constants/Colors';
import { Workout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WorkoutDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  workout: Workout | null;
}

export const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({ visible, onClose, workout }) => {
  if (!workout) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScreenContainer>
        <View style={styles.header}>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{workout.name}</Text>
                <Text style={styles.date}>{formatDate(workout.date)}</Text>
            </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="close" size={24} color={MonsterColors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Summary Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <FontAwesome name="clock-o" size={20} color={MonsterColors.primary} style={{ marginBottom: 4 }} />
                    <Text style={styles.statValue}>{formatDuration(workout.duration)}</Text>
                    <Text style={styles.statLabel}>Duração</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <FontAwesome name="database" size={20} color={MonsterColors.primary} style={{ marginBottom: 4 }} />
                    <Text style={styles.statValue}>{workout.exercises.length}</Text>
                    <Text style={styles.statLabel}>Exercícios</Text>
                </View>
                 <View style={styles.statDivider} />
                 <View style={styles.statItem}>
                    <FontAwesome name="check-square-o" size={20} color={MonsterColors.primary} style={{ marginBottom: 4 }} />
                    <Text style={styles.statValue}>
                        {workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)}
                    </Text>
                    <Text style={styles.statLabel}>Séries</Text>
                 </View>
            </View>

            {/* Exercises List */}
            {workout.exercises.map((exercise, index) => (
                <MonsterCard key={index} title={exercise.name} style={styles.exerciseCard}>
                    <View style={styles.setsHeader}>
                        <Text style={styles.colSet}>Série</Text>
                        <Text style={styles.colMetric}>kg</Text>
                        <Text style={styles.colMetric}>Reps</Text>
                    </View>
                    {exercise.sets.map((set, setIndex) => (
                        <View key={set.id} style={[styles.setRow, !set.completed && styles.incompleteRow]}>
                            <View style={styles.colSet}>
                                <Text style={styles.setText}>{setIndex + 1}</Text>
                            </View>
                            <View style={styles.colMetric}>
                                <Text style={styles.setText}>{set.weight || '-'}</Text>
                            </View>
                            <View style={styles.colMetric}>
                                <Text style={styles.setText}>{set.reps || '-'}</Text>
                            </View>
                        </View>
                    ))}
                </MonsterCard>
            ))}

            <View style={{ height: 40 }} />
        </ScrollView>
      </ScreenContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MonsterColors.text,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  date: {
      color: MonsterColors.textSecondary,
      fontSize: 14,
  },
  closeButton: {
      padding: 8,
  },
  content: {
    paddingBottom: 20,
  },
  statsRow: {
      flexDirection: 'row',
      backgroundColor: MonsterColors.secondary, // Navy background
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      justifyContent: 'space-around',
      alignItems: 'center',
  },
  statItem: {
      alignItems: 'center',
  },
  statValue: {
      color: '#ffffff', // White
      fontSize: 18,
      fontWeight: 'bold',
  },
  statLabel: {
      color: MonsterColors.primary,
      fontSize: 12,
      marginTop: 2,
  },
  statDivider: {
      width: 1,
      height: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
  },
  exerciseCard: {
      marginBottom: 16,
  },
  setsHeader: {
      flexDirection: 'row',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: MonsterColors.border,
      marginBottom: 8,
  },
  setRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  incompleteRow: {
      opacity: 0.5,
  },
  colSet: {
      width: 60,
      alignItems: 'center',
  },
  colMetric: {
      flex: 1,
      alignItems: 'center',
  },
  setText: {
      color: MonsterColors.text,
      fontSize: 16,
  },
});
