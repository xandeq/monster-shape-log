import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { MonsterColors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TrackScreen() {
  const {
      currentWorkout,
      workoutTimer,
      workoutName,
      setWorkoutName,
      finishWorkout,
      cancelWorkout,
      addExercise,
      addSet,
      updateSet,
      toggleSet,
  } = useWorkout();

  const [newExerciseName, setNewExerciseName] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) return;
    addExercise(newExerciseName);
    setNewExerciseName('');
  };

  const onFinishPress = () => {
    if (Platform.OS === 'web') {
        if (confirm("Finalizar Treino: Tem certeza que quer finalizar essa sessão monstra?")) {
             finishWorkout();
             router.replace('/');
        }
    } else {
        Alert.alert(
        "Finalizar Treino",
        "Tem certeza que quer finalizar essa sessão monstra?",
        [
            { text: "Cancelar", style: "cancel" },
            {
            text: "Finalizar",
            style: "destructive",
            onPress: () => {
                finishWorkout();
                router.replace('/');
            }
            }
        ]
        );
    }
  };

    const onCancelPress = () => {
    if (Platform.OS === 'web') {
        if (confirm("Cancelar Treino: Isso irá descartar o progresso atual. Tem certeza?")) {
             cancelWorkout();
             router.replace('/');
        }
    } else {
        Alert.alert(
        "Cancelar Treino",
        "Isso irá descartar o progresso atual. Tem certeza?",
        [
            { text: "Não", style: "cancel" },
            {
            text: "Descartar",
            style: "destructive",
            onPress: () => {
                cancelWorkout();
                router.replace('/');
            }
            }
        ]
        );
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <MonsterCard title="Treino Ativo">
             <View style={styles.headerRow}>
                <TextInput
                  style={styles.workoutTitleInput}
                  placeholder="Nome do treino..."
                  placeholderTextColor={MonsterColors.textSecondary}
                  value={workoutName}
                  onChangeText={setWorkoutName}
                />
                <Text style={styles.timer}>{formatTime(workoutTimer)}</Text>
             </View>
          </MonsterCard>

          {currentWorkout.length === 0 && (
              <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Nenhum exercício adicionado. Vamos trabalhar.</Text>
              </View>
          )}

          {currentWorkout.map((exercise) => (
            <MonsterCard key={exercise.id} title={exercise.name}>
              <View style={styles.setsHeader}>
                <Text style={[styles.setHeaderText, { flex: 0.5 }]}>Série</Text>
                <Text style={styles.setHeaderText}>kg</Text>
                <Text style={styles.setHeaderText}>Reps</Text>
                <Text style={[styles.setHeaderText, { flex: 0.5 }]}>Feito</Text>
              </View>

              {exercise.sets.map((set, index) => (
                <View key={set.id} style={styles.setRow}>
                  <View style={[styles.setCell, { flex: 0.5 }]}>
                    <Text style={styles.setNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.setCell}>
                    <TextInput
                      style={[styles.input, set.completed && styles.inputCompleted]}
                      placeholder="0"
                      placeholderTextColor={MonsterColors.textSecondary}
                      keyboardType="numeric"
                      value={set.weight}
                      onChangeText={(val) => updateSet(exercise.id, set.id, 'weight', val)}
                      editable={!set.completed}
                    />
                  </View>
                  <View style={styles.setCell}>
                    <TextInput
                      style={[styles.input, set.completed && styles.inputCompleted]}
                      placeholder="0"
                      placeholderTextColor={MonsterColors.textSecondary}
                      keyboardType="numeric"
                      value={set.reps}
                      onChangeText={(val) => updateSet(exercise.id, set.id, 'reps', val)}
                      editable={!set.completed}
                    />
                  </View>
                  <View style={[styles.setCell, { flex: 0.5, alignItems: 'center' }]}>
                    <TouchableOpacity
                      style={[styles.checkbox, set.completed && styles.checkboxCompleted]}
                      onPress={() => toggleSet(exercise.id, set.id)}
                    >
                      {set.completed && <FontAwesome name="check" size={12} color="#000" />}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <MonsterButton
                title="Add Série"
                icon="plus"
                variant="secondary"
                style={{ marginTop: 10, paddingVertical: 8 }}
                onPress={() => addSet(exercise.id)}
              />
            </MonsterCard>
          ))}

          <MonsterCard>
            <Text style={styles.label}>Adicionar Exercício</Text>
            <View style={styles.addExerciseRow}>
              <TextInput
                style={styles.newExerciseInput}
                placeholder="Ex. Levantamento Terra"
                placeholderTextColor={MonsterColors.textSecondary}
                value={newExerciseName}
                onChangeText={setNewExerciseName}
              />
              <MonsterButton title="Add" icon="plus" onPress={handleAddExercise} style={styles.addButton} />
            </View>
          </MonsterCard>

          <View style={styles.actionRow}>
            <MonsterButton
                title="Descartar"
                icon="trash"
                variant="outline"
                onPress={onCancelPress}
                style={{ flex: 1, marginBottom: 0 }}
            />
            <View style={{ width: 10 }} />
            <MonsterButton
                title="Finalizar"
                icon="flag-checkered"
                variant="secondary"
                onPress={onFinishPress}
                style={{ flex: 1, marginBottom: 0 }}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  workoutTitleInput: {
    color: MonsterColors.text,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  timer: {
    color: MonsterColors.primary,
    fontFamily: 'SpaceMono',
    fontSize: 16,
  },
  emptyState: {
      padding: 20,
      alignItems: 'center',
  },
  emptyText: {
      color: MonsterColors.textSecondary,
      fontStyle: 'italic',
  },
  setsHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 0,
  },
  setHeaderText: {
    flex: 1,
    color: MonsterColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  setCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  setNumber: {
    color: MonsterColors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: MonsterColors.text,
    borderRadius: 4,
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputCompleted: {
    color: MonsterColors.success,
    backgroundColor: 'rgba(0, 255, 148, 0.05)',
    borderColor: 'rgba(0, 255, 148, 0.2)',
  },
  checkbox: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MonsterColors.border,
  },
  checkboxCompleted: {
    backgroundColor: MonsterColors.primary,
    borderColor: MonsterColors.primary,
  },
  label: {
    color: MonsterColors.text,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  addExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  newExerciseInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: MonsterColors.text,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: MonsterColors.border,
  },
  addButton: {
    marginBottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  actionRow: {
      flexDirection: 'row',
      marginTop: 20,
  }
});
