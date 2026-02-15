import { MonsterCard } from '@/components/MonsterCard';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { WorkoutDetailsModal } from '@/components/WorkoutDetailsModal';
import { MonsterColors } from '@/constants/Colors';
import { useWorkout, Workout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useState } from 'react';
import { Alert, FlatList, Platform, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const { history, deleteWorkout } = useWorkout();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMM", { locale: ptBR }).toUpperCase();
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}H ${mins}M`;
    return `${mins}M`;
  };

  const countSets = (workout: Workout) => {
    return workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  };

  const handleWorkoutPress = (workout: Workout) => {
    setSelectedWorkout(workout);
    setDetailsVisible(true);
  };

  const handleDelete = (workoutId: string) => {
    if (Platform.OS === 'web') {
        if (confirm("TEM CERTEZA QUE DESEJA EXCLUIR ESTE TREINO? ESSA AÇÃO NÃO PODE SER DESFEITA.")) {
            deleteWorkout(workoutId);
        }
    } else {
        Alert.alert(
            "EXCLUIR TREINO",
            "TEM CERTEZA QUE DESEJA EXCLUIR ESTE TREINO? ESSA AÇÃO NÃO PODE SER DESFEITA.",
            [
                { text: "CANCELAR", style: "cancel" },
                { text: "EXCLUIR", style: "destructive", onPress: () => deleteWorkout(workoutId) }
            ]
        );
    }
  };

  return (
    <MonsterLayout>
      <MonsterText variant="titleLg" className="text-white mb-6">LEGADO</MonsterText>

      <FlatList
        data={[...history].reverse()}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleWorkoutPress(item)} activeOpacity={0.7} className="mb-4">
            <MonsterCard noPadding>
                <View className="flex-row justify-between items-center p-4 bg-elevated border-b border-border">
                    <View>
                        <MonsterText variant="caption" className="text-accent mb-1">{formatDate(item.date)}</MonsterText>
                        <MonsterText variant="titleMd" className="text-white">{item.name?.toUpperCase() || 'TREINO SEM NOME'}</MonsterText>
                        <View className="flex-row items-center mt-2 gap-3">
                             <View className="flex-row items-center gap-1">
                                <FontAwesome name="clock-o" size={12} color={MonsterColors.textMuted} />
                                <MonsterText variant="tiny" className="text-text-muted">{formatDuration(item.duration)}</MonsterText>
                             </View>
                             <View className="flex-row items-center gap-1">
                                <FontAwesome name="list" size={12} color={MonsterColors.textMuted} />
                                <MonsterText variant="tiny" className="text-text-muted">{countSets(item)} SÉRIES</MonsterText>
                             </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-3 bg-background rounded-lg border border-border">
                        <FontAwesome name="trash" size={18} color={MonsterColors.error} />
                    </TouchableOpacity>
                </View>

                {/* Preview first 2 exercises */}
                <View className="p-3 bg-elevated/50">
                    {item.exercises.slice(0, 2).map((ex, idx) => (
                        <MonsterText key={idx} variant="caption" className="text-text-secondary mb-1">
                            • {ex.name}
                        </MonsterText>
                    ))}
                    {item.exercises.length > 2 && (
                        <MonsterText variant="tiny" className="text-text-muted mt-1">
                            + {item.exercises.length - 2} EXERCÍCIOS
                        </MonsterText>
                    )}
                </View>
            </MonsterCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
            <View className="items-center justify-center py-20 opacity-50">
              <FontAwesome name="history" size={64} color={MonsterColors.textMuted} />
              <MonsterText variant="body" className="text-text-muted mt-6 text-center">
                NENHUM TREINO REGISTRADO.
                {"\n"}
                VÁ CONSTRUIR SEU LEGADO.
              </MonsterText>
            </View>
          }
      />

      <WorkoutDetailsModal
        visible={detailsVisible}
        workout={selectedWorkout}
        onClose={() => setDetailsVisible(false)}
      />
    </MonsterLayout>
  );
}
