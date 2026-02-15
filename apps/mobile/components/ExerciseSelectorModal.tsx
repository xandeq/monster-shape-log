import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { MonsterText } from '@/components/MonsterText';
import { MonsterColors } from '@/constants/Colors';
import { EXERCISES } from '@/constants/Exercises';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, TextInput, TouchableOpacity, View } from 'react-native';

interface ExerciseSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exerciseName: string) => void;
}

const MUSCLE_GROUPS = ["Todos", "Peito", "Costas", "Pernas", "Ombros", "Bíceps", "Tríceps", "Abdômen", "Cardio"];

export const ExerciseSelectorModal: React.FC<ExerciseSelectorModalProps> = ({ visible, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'Todos' || ex.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const renderItem = ({ item }: { item: typeof EXERCISES[0] }) => (
    <TouchableOpacity
      onPress={() => {
        onSelect(item.name);
        onClose();
      }}
      activeOpacity={0.7}
    >
        <MonsterCard className="mb-3 flex-row items-center p-4 bg-elevated border-border" noPadding>
            <View className="w-12 h-12 rounded-lg bg-background items-center justify-center border border-border mr-4">
                 <FontAwesome name={item.icon as any} size={20} color={MonsterColors.primary} />
            </View>
            <View className="flex-1">
                <MonsterText variant="titleSm" className="text-white">{item.name.toUpperCase()}</MonsterText>
                <MonsterText variant="caption" className="text-text-muted">{item.muscleGroup.toUpperCase()}</MonsterText>
            </View>
            <FontAwesome name="plus-circle" size={24} color={MonsterColors.accent} />
        </MonsterCard>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background pt-10 px-5">

        <View className="flex-row justify-between items-center mb-6">
            <MonsterText variant="titleMd" className="text-white">BIBLIOTECA MONSTRA</MonsterText>
            <TouchableOpacity onPress={onClose} className="p-2">
                <FontAwesome name="times" size={24} color={MonsterColors.textMuted} />
            </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-elevated rounded-lg px-4 mb-4 border border-border">
            <FontAwesome name="search" size={16} color={MonsterColors.textMuted} />
            <TextInput
                className="flex-1 py-3 px-3 text-white font-mono"
                placeholder="BUSCAR EXERCÍCIO..."
                placeholderTextColor={MonsterColors.textMuted}
                value={search}
                onChangeText={setSearch}
            />
        </View>

        <View className="mb-4 h-12">
            <FlatList
                data={MUSCLE_GROUPS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => setSelectedMuscle(item)}
                        className={`mr-3 px-4 py-2 rounded-full border ${selectedMuscle === item ? 'bg-accent border-accent' : 'bg-transparent border-border'}`}
                    >
                        <MonsterText
                            variant="tiny"
                            className={selectedMuscle === item ? 'text-black font-bold' : 'text-text-secondary'}
                        >
                            {item.toUpperCase()}
                        </MonsterText>
                    </TouchableOpacity>
                )}
            />
        </View>

        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
              <View className="items-center justify-center py-10">
                  <FontAwesome name="search" size={40} color={MonsterColors.textMuted} />
                  <MonsterText variant="body" className="text-text-muted mt-4 text-center">NENHUM EXERCÍCIO ENCONTRADO.</MonsterText>
              </View>
          }
        />

        <MonsterButton title="CANCELAR" variant="ghost" onPress={onClose} className="mb-8" />
      </View>
    </Modal>
  );
};
