import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { MonsterColors } from '@/constants/Colors';
import { useProgress } from '@/context/ProgressContext';
import { useWorkout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ProgressModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ visible, onClose }) => {
  const { measurements, photos, addMeasurement, addPhoto } = useProgress();
  const { history } = useWorkout();
  const [activeTab, setActiveTab] = useState<'Corpo' | 'Fotos' | 'Força'>('Corpo');

  // Body State
  const [newWeight, setNewWeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');

  // Strength State
  const [selectedLift, setSelectedLift] = useState('Bench Press');

  // Chart Config
  const screenWidth = Dimensions.get('window').width;
  const chartConfig = {
    backgroundGradientFrom: MonsterColors.background,
    backgroundGradientTo: MonsterColors.background,
    color: (opacity = 1) => `rgba(0, 255, 148, ${opacity})`, // Neon Green
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 1,
  };

  // --- HELPERS ---
  const handleAddMeasurement = () => {
    if (!newWeight) return;
    addMeasurement({
      date: new Date().toISOString(),
      weight: parseFloat(newWeight),
      bodyFat: newBodyFat ? parseFloat(newBodyFat) : undefined,
    });
    setNewWeight('');
    setNewBodyFat('');
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated to use MediaTypeOptions.Images string directly or import if strict
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
        addPhoto({
            date: new Date().toISOString(),
            uri: result.assets[0].uri,
            label: 'Front' // Default
        });
    }
  };

  const strengthData = useMemo(() => {
    // Calculate Estimated 1RM over time for selected lift
    const relevantWorkouts = history
      .filter((w) => w.exercises.some((e) => e.name.includes(selectedLift)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ascending

    if (relevantWorkouts.length < 2) return null;

    const data = relevantWorkouts.map((w) => {
      const exercise = w.exercises.find((e) => e.name.includes(selectedLift));
      if (!exercise) return 0;

      // Find best set (highest 1RM estimate)
      const bestSet1RM = exercise.sets.reduce((max, set) => {
        if (!set.completed) return max;
        const weight = parseFloat(set.weight) || 0;
        const reps = parseFloat(set.reps) || 0;
        const e1rm = weight * (1 + reps / 30); // Epley formula
        return e1rm > max ? e1rm : max;
      }, 0);

      return bestSet1RM;
    });

    return {
        labels: relevantWorkouts.map(w => new Date(w.date).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})),
        datasets: [{ data }]
    };
  }, [history, selectedLift]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScreenContainer>
        <View style={styles.header}>
          <Text style={styles.title}>Laboratório de Progresso</Text>
          <TouchableOpacity onPress={onClose}>
            <FontAwesome name="close" size={24} color={MonsterColors.text} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['Corpo', 'Fotos', 'Força'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content}>

          {/* --- BODY TAB --- */}
          {activeTab === 'Corpo' && (
            <View>
              <MonsterCard title="Tendência de Peso">
                {measurements.length > 1 ? (
                    <LineChart
                    data={{
                        labels: measurements.slice(0, 6).reverse().map(m => new Date(m.date).getDate().toString()),
                        datasets: [{ data: measurements.slice(0, 6).reverse().map(m => m.weight) }]
                    }}
                    width={screenWidth - 64} // Card padding
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    />
                ) : <Text style={styles.emptyText}>Registre mais dados para ver tendências.</Text>}
              </MonsterCard>

              <MonsterCard title="Registrar Medida">
                <View style={styles.inputRow}>
                   <TextInput
                        style={styles.input}
                        placeholder="Peso (kg)"
                        placeholderTextColor={MonsterColors.textSecondary}
                        keyboardType="numeric"
                        value={newWeight}
                        onChangeText={setNewWeight}
                   />
                   <TextInput
                        style={styles.input}
                        placeholder="% Gordura"
                        placeholderTextColor={MonsterColors.textSecondary}
                        keyboardType="numeric"
                        value={newBodyFat}
                        onChangeText={setNewBodyFat}
                   />
                </View>
                <MonsterButton title="Registrar" onPress={handleAddMeasurement} />
              </MonsterCard>

              {measurements.map(m => (
                  <View key={m.id} style={styles.logRow}>
                      <Text style={styles.logDate}>{new Date(m.date).toLocaleDateString()}</Text>
                      <Text style={styles.logValue}>{m.weight} kg</Text>
                      <Text style={styles.logValue}>{m.bodyFat ? `${m.bodyFat}%` : '-'}</Text>
                  </View>
              ))}
            </View>
          )}

          {/* --- PHOTOS TAB --- */}
          {activeTab === 'Fotos' && (
            <View>
                <MonsterButton title="+ Add Foto" onPress={pickImage} variant="secondary" />
                <View style={styles.photoGrid}>
                    {photos.map(p => (
                        <View key={p.id} style={styles.photoWrapper}>
                            <Image source={{ uri: p.uri }} style={styles.photo} />
                            <Text style={styles.photoDate}>{new Date(p.date).toLocaleDateString('pt-BR')}</Text>
                        </View>
                    ))}
                </View>
                {photos.length === 0 && <Text style={styles.emptyText}>Nenhuma foto de progresso ainda.</Text>}
            </View>
          )}

          {/* --- STRENGTH TAB --- */}
          {activeTab === 'Força' && (
            <View>
                <View style={styles.liftSelector}>
                    {['Supino Reto', 'Agachamento', 'Levantamento Terra', 'Desenvolvimento'].map(lift => (
                        <TouchableOpacity
                            key={lift}
                            style={[styles.liftPill, selectedLift === lift && styles.activeLiftPill]}
                            onPress={() => setSelectedLift(lift)}
                        >
                            <Text style={[styles.liftText, selectedLift === lift && styles.activeLiftText]}>{lift}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <MonsterCard title={`1RM Estimado: ${selectedLift}`}>
                     {strengthData ? (
                        <LineChart
                            data={strengthData}
                            width={screenWidth - 64}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                     ) : (
                         <View style={{ padding: 20 }}>
                             <Text style={styles.emptyText}>Dados insuficientes para este exercício.</Text>
                             <Text style={styles.subText}>Registre treinos com "{selectedLift}" para ver analises.</Text>
                         </View>
                     )}
                </MonsterCard>
            </View>
          )}

        </ScrollView>
      </ScreenContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MonsterColors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: MonsterColors.primary,
  },
  tabText: {
    color: MonsterColors.textSecondary,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: MonsterColors.background,
  },
  content: {
      paddingBottom: 40,
  },
  chart: {
      marginVertical: 8,
      borderRadius: 16,
  },
  inputRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10,
  },
  input: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: MonsterColors.text,
      padding: 12,
      borderRadius: 8,
  },
  logRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logDate: { color: MonsterColors.textSecondary },
  logValue: { color: MonsterColors.text, fontWeight: 'bold' },
  photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 20,
  },
  photoWrapper: {
      width: '48%',
      marginBottom: 10,
  },
  photo: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      backgroundColor: '#333',
  },
  photoDate: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.6)',
      color: '#fff',
      paddingHorizontal: 6,
      borderRadius: 4,
      fontSize: 12,
  },
  emptyText: {
      color: MonsterColors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: 10,
  },
  liftSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
  },
  liftPill: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: MonsterColors.border,
  },
  activeLiftPill: {
      backgroundColor: MonsterColors.primary,
      borderColor: MonsterColors.primary,
  },
  liftText: { color: MonsterColors.textSecondary },
  activeLiftText: { color: MonsterColors.background, fontWeight: 'bold' },
  subText: {
      color: MonsterColors.textSecondary,
      textAlign: 'center',
      fontSize: 12,
      marginTop: 4,
  }
});
