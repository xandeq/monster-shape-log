import { MonsterCard } from '@/components/MonsterCard';
import { MonsterText } from '@/components/MonsterText';
import { MonsterColors } from '@/constants/Colors';
import { Workout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';

interface WorkoutDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  workout: Workout | null;
}

export const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({ visible, onClose, workout }) => {
  if (!workout) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }).toUpperCase();
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}H ${mins}M`;
    return `${mins}M`;
  };

  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background pt-6">

        {/* Header */}
        <View className="flex-row justify-between items-start px-5 py-4 border-b border-border bg-elevated">
            <View className="flex-1 mr-4">
                <MonsterText variant="titleMd" className="text-white mb-1">{workout.name}</MonsterText>
                <MonsterText variant="caption" className="text-accent">{formatDate(workout.date)}</MonsterText>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-background rounded-lg border border-border">
                <FontAwesome name="times" size={20} color={MonsterColors.textMuted} />
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* Stats Grid */}
            <View className="flex-row gap-3 mb-6">
                <MonsterCard className="flex-1 items-center justify-center p-4 bg-elevated border-accent/20" noPadding>
                    <FontAwesome name="clock-o" size={20} color={MonsterColors.accent} style={{ marginBottom: 8 }} />
                    <MonsterText variant="titleSm" className="text-white">{formatDuration(workout.duration)}</MonsterText>
                    <MonsterText variant="tiny" className="text-text-muted mt-1">DURAÇÃO</MonsterText>
                </MonsterCard>

                <MonsterCard className="flex-1 items-center justify-center p-4 bg-elevated border-accent/20" noPadding>
                    <FontAwesome name="database" size={20} color={MonsterColors.accent} style={{ marginBottom: 8 }} />
                    <MonsterText variant="titleSm" className="text-white">{workout.exercises.length}</MonsterText>
                    <MonsterText variant="tiny" className="text-text-muted mt-1">EXERCÍCIOS</MonsterText>
                </MonsterCard>

                <MonsterCard className="flex-1 items-center justify-center p-4 bg-elevated border-accent/20" noPadding>
                    <FontAwesome name="check-square-o" size={20} color={MonsterColors.accent} style={{ marginBottom: 8 }} />
                    <MonsterText variant="titleSm" className="text-white">{totalSets}</MonsterText>
                    <MonsterText variant="tiny" className="text-text-muted mt-1">SÉRIES</MonsterText>
                </MonsterCard>
            </View>

            {/* Exercises List */}
            {workout.exercises.map((exercise, index) => (
                <MonsterCard key={index} className="mb-4" noPadding>
                    <View className="p-4 border-b border-border bg-elevated">
                        <MonsterText variant="titleSm" className="text-white">{exercise.name.toUpperCase()}</MonsterText>
                    </View>

                    <View className="p-2">
                        <View className="flex-row px-2 py-2 mb-1">
                            <MonsterText variant="tiny" className="w-16 text-center text-text-muted">SÉRIE</MonsterText>
                            <MonsterText variant="tiny" className="flex-1 text-center text-text-muted">CARGA (KG)</MonsterText>
                            <MonsterText variant="tiny" className="flex-1 text-center text-text-muted">REPS</MonsterText>
                        </View>

                        {exercise.sets.map((set, setIndex) => (
                            <View key={set.id} className={`flex-row py-3 border-b border-border last:border-0 ${!set.completed ? 'opacity-50' : ''}`}>
                                <View className="w-16 items-center justify-center">
                                    <View className="w-6 h-6 rounded-full bg-elevated items-center justify-center border border-border">
                                        <MonsterText variant="tiny" className="text-text-secondary">{setIndex + 1}</MonsterText>
                                    </View>
                                </View>
                                <View className="flex-1 items-center justify-center">
                                    <MonsterText variant="body" className="text-white font-bold">{set.weight || '-'}</MonsterText>
                                </View>
                                <View className="flex-1 items-center justify-center">
                                    <MonsterText variant="body" className="text-white font-bold">{set.reps || '-'}</MonsterText>
                                </View>
                            </View>
                        ))}
                    </View>
                </MonsterCard>
            ))}
        </ScrollView>
      </View>
    </Modal>
  );
};
