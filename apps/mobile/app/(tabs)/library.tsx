import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { VideoSearchControl } from '@/components/VideoSearchControl';
import { MonsterColors } from '@/constants/Colors';
import { EXERCISES, ExerciseData } from '@/constants/Exercises';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from 'react';
import { FlatList, Modal, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

const filters = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'];

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(null);

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'Todos' || ex.muscleGroup === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const renderExerciseItem = ({ item }: { item: ExerciseData }) => (
    <TouchableOpacity
        onPress={() => setSelectedExercise(item)}
        activeOpacity={0.7}
        className="w-[48%] mb-4"
    >
        <MonsterCard className="items-center justify-center p-4 bg-elevated border-border h-[160px]" noPadding>
            <View className="w-12 h-12 rounded-full bg-accent/10 items-center justify-center mb-3 border border-accent/20">
                <FontAwesome name={item.icon as any} size={20} color={MonsterColors.primary} />
            </View>
            <MonsterText variant="body" className="text-white font-bold text-center mb-1 leading-5">{item.name.toUpperCase()}</MonsterText>
            <MonsterText variant="tiny" className="text-text-muted text-center">{item.muscleGroup.toUpperCase()}</MonsterText>
        </MonsterCard>
    </TouchableOpacity>
  );

  return (
    <MonsterLayout>
      <View className="flex-row items-center bg-elevated rounded-lg px-4 mb-4 border border-border mt-2">
        <FontAwesome name="search" size={16} color={MonsterColors.textMuted} />
        <TextInput
          className="flex-1 py-3 px-3 text-white font-mono"
          placeholder="PROCURE MOVIMENTOS MONSTRO..."
          placeholderTextColor={MonsterColors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View className="mb-6 h-10">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`mr-2 px-4 py-2 rounded-full border ${activeFilter === filter ? 'bg-accent border-accent' : 'bg-transparent border-border'}`}
              onPress={() => setActiveFilter(filter)}
            >
              <MonsterText
                variant="tiny"
                className={activeFilter === filter ? 'text-black font-bold' : 'text-text-secondary'}
              >
                  {filter.toUpperCase()}
              </MonsterText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <MonsterText variant="tiny" className="text-text-secondary mb-3 tracking-widest">
          BIBLIOTECA ({filteredExercises.length})
      </MonsterText>

      <FlatList
        data={filteredExercises}
        keyExtractor={item => item.id}
        renderItem={renderExerciseItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={!!selectedExercise}
        onRequestClose={() => setSelectedExercise(null)}
      >
        <View className="flex-1 bg-background pt-6">
            {selectedExercise && (
                <>
                    <View className="flex-row justify-between items-center px-5 py-4 border-b border-border bg-elevated">
                        <MonsterText variant="titleMd" className="text-white flex-1 mr-4">{selectedExercise.name.toUpperCase()}</MonsterText>
                        <TouchableOpacity onPress={() => setSelectedExercise(null)} className="p-2">
                            <FontAwesome name="times" size={24} color={MonsterColors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                        <View className="items-center mb-8 mt-4">
                            <View className="w-24 h-24 rounded-full bg-accent/10 items-center justify-center border-2 border-accent/20">
                                <FontAwesome name={selectedExercise.icon as any} size={48} color={MonsterColors.primary} />
                            </View>
                        </View>

                        <MonsterCard className="mb-4 bg-elevated" noPadding>
                             <View className="p-4 border-b border-border">
                                <MonsterText variant="titleSm" className="text-accent">DESCRIÇÃO</MonsterText>
                             </View>
                             <View className="p-4">
                                <MonsterText variant="body" className="text-text-secondary leading-6">{selectedExercise.description}</MonsterText>
                             </View>
                        </MonsterCard>

                        <MonsterCard className="mb-4 bg-elevated" noPadding>
                             <View className="p-4 border-b border-border">
                                <MonsterText variant="titleSm" className="text-accent">POR QUE FAZER?</MonsterText>
                             </View>
                             <View className="p-4">
                                {selectedExercise.benefits.map((benefit, i) => (
                                    <View key={i} className="flex-row items-center mb-2 last:mb-0">
                                        <FontAwesome name="check" size={12} color={MonsterColors.success} style={{ marginRight: 10 }} />
                                        <MonsterText variant="body" className="text-text-secondary flex-1">{benefit}</MonsterText>
                                    </View>
                                ))}
                             </View>
                        </MonsterCard>

                        <VideoSearchControl exerciseName={selectedExercise.name} />

                        <MonsterCard className="mb-6 bg-elevated" noPadding>
                             <View className="p-4 border-b border-border">
                                <MonsterText variant="titleSm" className="text-accent">EQUIPAMENTO</MonsterText>
                             </View>
                             <View className="p-4">
                                <MonsterText variant="body" className="text-text-secondary">{selectedExercise.equipment}</MonsterText>
                             </View>
                        </MonsterCard>

                        <MonsterButton title="FECHAR" variant="secondary" onPress={() => setSelectedExercise(null)} />
                    </ScrollView>
                </>
            )}
        </View>
      </Modal>

    </MonsterLayout>
  );
}
