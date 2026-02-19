import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { MonsterText } from '@/components/MonsterText';
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
    propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: MonsterColors.accent
    }
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
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    const relevantWorkouts = history
      .filter((w) => w.exercises.some((e) => e.name.includes(selectedLift)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (relevantWorkouts.length < 2) return null;

    const data = relevantWorkouts.map((w) => {
      const exercise = w.exercises.find((e) => e.name.includes(selectedLift));
      if (!exercise) return 0;

      const bestSet1RM = exercise.sets.reduce((max, set) => {
        if (!set.completed) return max;
        // Handle string/number conversion safely
        const weight = typeof set.weight === 'string' ? parseFloat(set.weight) : set.weight || 0;
        const reps = typeof set.reps === 'string' ? parseFloat(set.reps) : set.reps || 0;
        const e1rm = weight * (1 + reps / 30);
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
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background pt-6">
        <View className="flex-row justify-between items-center px-5 py-4 border-b border-border bg-elevated">
          <MonsterText variant="titleMd" className="text-white">LABORATÓRIO DE PROGRESSO</MonsterText>
          <TouchableOpacity onPress={onClose} className="p-2">
            <FontAwesome name="times" size={24} color={MonsterColors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row px-4 py-4 gap-2">
          {['Corpo', 'Fotos', 'Força'].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2 rounded-lg items-center justify-center border ${activeTab === tab ? 'bg-accent border-accent' : 'bg-transparent border-border'}`}
              onPress={() => setActiveTab(tab as any)}
            >
              <MonsterText variant="body" className={activeTab === tab ? 'text-black font-bold' : 'text-text-secondary'}>
                {tab.toUpperCase()}
              </MonsterText>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          {/* --- BODY TAB --- */}
          {activeTab === 'Corpo' && (
            <View>
              <MonsterCard className="mb-6 bg-elevated" noPadding>
                <View className="p-4 border-b border-border">
                    <MonsterText variant="titleSm" className="text-white">TENDÊNCIA DE PESO</MonsterText>
                </View>
                <View className="items-center py-4">
                    {measurements.length > 1 ? (
                        <LineChart
                        data={{
                            labels: measurements.slice(0, 6).reverse().map(m => new Date(m.date).getDate().toString()),
                            datasets: [{ data: measurements.slice(0, 6).reverse().map(m => m.weight) }]
                        }}
                        width={screenWidth - 48}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={{ borderRadius: 16 }}
                        />
                    ) : (
                        <View className="py-10">
                            <MonsterText variant="body" className="text-text-muted italic">REGISTRE MAIS DADOS PARA VER TENDÊNCIAS.</MonsterText>
                        </View>
                    )}
                </View>
              </MonsterCard>

              <MonsterCard className="mb-6 bg-elevated" noPadding>
                <View className="p-4 border-b border-border">
                     <MonsterText variant="titleSm" className="text-white">REGISTRAR MEDIDA</MonsterText>
                </View>
                <View className="p-4">
                    <View className="flex-row gap-3 mb-4">
                        <View className="flex-1">
                            <TextInput
                                    className="bg-background border border-border rounded-lg p-3 text-white font-mono placeholder:text-text-muted/50"
                                    placeholder="PESO (KG)"
                                    placeholderTextColor={MonsterColors.textMuted}
                                    keyboardType="numeric"
                                    value={newWeight}
                                    onChangeText={setNewWeight}
                            />
                        </View>
                        <View className="flex-1">
                            <TextInput
                                    className="bg-background border border-border rounded-lg p-3 text-white font-mono placeholder:text-text-muted/50"
                                    placeholder="% GORDURA"
                                    placeholderTextColor={MonsterColors.textMuted}
                                    keyboardType="numeric"
                                    value={newBodyFat}
                                    onChangeText={setNewBodyFat}
                            />
                        </View>
                    </View>
                    <MonsterButton title="REGISTRAR" onPress={handleAddMeasurement} icon="plus" />
                </View>
              </MonsterCard>

              {measurements.map(m => (
                  <View key={m.id} className="flex-row justify-between py-3 border-b border-border/50">
                      <MonsterText variant="body" className="text-text-secondary">{new Date(m.date).toLocaleDateString()}</MonsterText>
                      <MonsterText variant="body" className="text-white font-bold">{m.weight} KG</MonsterText>
                      <MonsterText variant="body" className="text-text-muted">{m.bodyFat ? `${m.bodyFat}%` : '-'}</MonsterText>
                  </View>
              ))}
            </View>
          )}

          {/* --- PHOTOS TAB --- */}
          {activeTab === 'Fotos' && (
            <View>
                <MonsterButton title="ADICIONAR FOTO" onPress={pickImage} variant="secondary" icon="camera" className="mb-6" />
                <View className="flex-row flex-wrap gap-2">
                    {photos.map(p => (
                        <View key={p.id} className="w-[48%] mb-4 bg-elevated rounded-lg overflow-hidden border border-border">
                            <Image source={{ uri: p.uri }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
                            <View className="absolute bottom-0 right-0 bg-black/60 px-2 py-1 rounded-tl-lg">
                                <MonsterText variant="tiny" className="text-white">{new Date(p.date).toLocaleDateString('pt-BR')}</MonsterText>
                            </View>
                        </View>
                    ))}
                </View>
                {photos.length === 0 && (
                    <View className="py-10 items-center">
                        <MonsterText variant="body" className="text-text-muted italic">NENHUMA FOTO DE PROGRESSO AINDA.</MonsterText>
                    </View>
                )}
            </View>
          )}

          {/* --- STRENGTH TAB --- */}
          {activeTab === 'Força' && (
            <View>
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {['Supino Reto', 'Agachamento', 'Levantamento Terra', 'Desenvolvimento'].map(lift => (
                        <TouchableOpacity
                            key={lift}
                            className={`px-3 py-2 rounded-full border ${selectedLift === lift ? 'bg-accent border-accent' : 'bg-transparent border-border'}`}
                            onPress={() => setSelectedLift(lift)}
                        >
                            <MonsterText variant="tiny" className={selectedLift === lift ? 'text-black font-bold' : 'text-text-secondary'}>
                                {lift.toUpperCase()}
                            </MonsterText>
                        </TouchableOpacity>
                    ))}
                </View>

                <MonsterCard className="bg-elevated" noPadding>
                    <View className="p-4 border-b border-border">
                         <MonsterText variant="titleSm" className="text-white">1RM ESTIMADO: {selectedLift.toUpperCase()}</MonsterText>
                    </View>
                     <View className="py-4 items-center">
                        {strengthData ? (
                            <LineChart
                                data={strengthData}
                                width={screenWidth - 48}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={{ borderRadius: 16 }}
                            />
                        ) : (
                             <View className="py-10 px-6 items-center">
                                 <MonsterText variant="body" className="text-text-muted italic text-center mb-2">DADOS INSUFICIENTES PARA ESTE EXERCÍCIO.</MonsterText>
                                 <MonsterText variant="caption" className="text-text-muted/50 text-center">REGISTRE TREINOS COM "{selectedLift.toUpperCase()}" PARA VER ANÁLISES.</MonsterText>
                             </View>
                        )}
                     </View>
                </MonsterCard>
            </View>
          )}

        </ScrollView>
      </View>
    </Modal>
  );
};
