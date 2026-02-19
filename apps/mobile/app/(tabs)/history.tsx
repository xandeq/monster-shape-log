import { MonsterCard } from '@/components/MonsterCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { WorkoutDetailsModal } from '@/components/WorkoutDetailsModal';
import { MonsterColors } from '@/constants/Colors';
import { useWorkout, Workout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const { history, deleteWorkout } = useWorkout();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

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

  const countSets = (workout: Workout) => {
    return workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  };

  const handleWorkoutPress = (workout: Workout) => {
    setSelectedWorkout(workout);
    setDetailsVisible(true);
  };

  if (history.length === 0) {
     return (
        <ScreenContainer>
            <Text style={styles.header}>Monstros Recentes</Text>
            <MonsterCard title="Sem histórico">
                <Text style={styles.emptyText}>Vá para Registrar e esmague seu primeiro treino!</Text>
            </MonsterCard>
        </ScreenContainer>
     )
  }

  return (
    <ScreenContainer>
      <Text style={styles.header}>Monstros Recentes</Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleWorkoutPress(item)} activeOpacity={0.7}>
            <MonsterCard style={styles.card}>
                <View style={styles.row}>
                <View>
                    <Text style={styles.date}>{formatDate(item.date)}</Text>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.details}>{formatDuration(item.duration)} • {countSets(item)} Séries</Text>
                </View>
                <View style={styles.iconContainer}>
                    <TouchableOpacity onPress={() => {
                        if (Platform.OS === 'web') {
                            if (confirm("Tem certeza que deseja excluir este treino? Essa ação não pode ser desfeita.")) {
                                deleteWorkout(item.id);
                            }
                        } else {
                            Alert.alert(
                                "Excluir Treino",
                                "Tem certeza que deseja excluir este treino? Essa ação não pode ser desfeita.",
                                [
                                    { text: "Cancelar", style: "cancel" },
                                    { text: "Excluir", style: "destructive", onPress: () => deleteWorkout(item.id) }
                                ]
                            );
                        }
                    }} style={{ padding: 8 }}>
                        <FontAwesome name="trash" size={20} color={MonsterColors.error} />
                    </TouchableOpacity>
                    <FontAwesome name="chevron-right" size={16} color={MonsterColors.textSecondary} />
                </View>
                </View>
            </MonsterCard>
          </TouchableOpacity>
        )}
      />

      <WorkoutDetailsModal
        visible={detailsVisible}
        workout={selectedWorkout}
        onClose={() => setDetailsVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MonsterColors.text,
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: MonsterColors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  title: {
    color: MonsterColors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  details: {
    color: MonsterColors.text,
    fontSize: 14,
  },
  iconContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
      color: MonsterColors.textSecondary,
      fontStyle: 'italic',
  }
});
