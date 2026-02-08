import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { MonsterColors } from '@/constants/Colors';
import { EXERCISES, ExerciseData } from '@/constants/Exercises';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  return (
    <ScreenContainer>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color={MonsterColors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Procure movimentos monstro..."
          placeholderTextColor={MonsterColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter, index) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                activeFilter === filter && styles.activeFilter
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText
              ]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>BIBLIOTECA ({filteredExercises.length})</Text>

        <View style={styles.grid}>
          {filteredExercises.map((ex) => (
            <TouchableOpacity
                key={ex.id}
                style={styles.cardWrapper}
                onPress={() => setSelectedExercise(ex)}
            >
                <MonsterCard style={styles.card}>
                <View style={styles.iconBox}>
                    <FontAwesome name={ex.icon} size={24} color={MonsterColors.primary} />
                </View>
                <Text style={styles.exName}>{ex.name}</Text>
                <Text style={styles.exMuscle}>{ex.muscleGroup}</Text>
                </MonsterCard>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedExercise}
        onRequestClose={() => setSelectedExercise(null)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                {selectedExercise && (
                    <ScreenContainer style={{ paddingHorizontal: 0 }}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                            <TouchableOpacity onPress={() => setSelectedExercise(null)}>
                                <FontAwesome name="close" size={24} color={MonsterColors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.modalScroll}>
                            <View style={styles.modalIconContainer}>
                                <FontAwesome name={selectedExercise.icon} size={64} color={MonsterColors.primary} />
                            </View>

                            <MonsterCard title="Descrição">
                                <Text style={styles.modalText}>{selectedExercise.description}</Text>
                            </MonsterCard>

                            <MonsterCard title="Por que fazer?">
                                {selectedExercise.benefits.map((benefit, i) => (
                                    <View key={i} style={styles.benefitRow}>
                                        <FontAwesome name="check-circle" size={16} color={MonsterColors.success} />
                                        <Text style={styles.benefitText}>{benefit}</Text>
                                    </View>
                                ))}
                            </MonsterCard>

                            <MonsterCard title="Equipamento">
                                <Text style={styles.modalText}>{selectedExercise.equipment}</Text>
                            </MonsterCard>

                            <MonsterButton title="Fechar" icon="close" onPress={() => setSelectedExercise(null)} style={{ marginTop: 20 }} />
                        </ScrollView>
                    </ScreenContainer>
                )}
            </View>
        </View>
      </Modal>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: MonsterColors.text,
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 20,
    height: 40,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeFilter: {
    backgroundColor: MonsterColors.primary,
    borderColor: MonsterColors.primary,
  },
  filterText: {
    color: MonsterColors.textSecondary,
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: MonsterColors.background,
  },
  sectionTitle: {
    color: MonsterColors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
     marginBottom: 12,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardWrapper: {
      width: '47%', // Adjusted for gap and padding
  },
  card: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 0,
    height: 140, // Uniform height
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 255, 148, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exName: {
    color: MonsterColors.text,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  exMuscle: {
    color: MonsterColors.textSecondary,
    fontSize: 12,
  },
  // Modal Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'flex-end',
  },
  modalContent: {
      height: '90%',
      backgroundColor: MonsterColors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: MonsterColors.border,
  },
  modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: MonsterColors.text,
  },
  modalScroll: {
      padding: 20,
      paddingBottom: 40,
  },
  modalIconContainer: {
      alignItems: 'center',
      marginBottom: 30,
  },
  modalText: {
      color: MonsterColors.textSecondary,
      fontSize: 16,
      lineHeight: 24,
  },
  benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 10,
  },
  benefitText: {
      color: MonsterColors.text,
      fontSize: 14,
  },
});
