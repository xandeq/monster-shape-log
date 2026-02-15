import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { MonsterText } from '@/components/MonsterText';
import { MonsterColors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { generateWorkoutPlan } from '@/lib/ai';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, TouchableOpacity, View } from 'react-native';

interface GenerateWorkoutModalProps {
    visible: boolean;
    onClose: () => void;
}

const MUSCLE_GROUPS = [
    'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Full Body'
];

interface MuscleConfig {
    name: string;
    exercises: number;
    sets: number;
}

export const GenerateWorkoutModal: React.FC<GenerateWorkoutModalProps> = ({ visible, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [selectedMuscles, setSelectedMuscles] = useState<MuscleConfig[]>([]);
    const { loadAIWorkout } = useWorkout();

    const toggleMuscle = (muscleName: string) => {
        const exists = selectedMuscles.find(m => m.name === muscleName);
        if (exists) {
            setSelectedMuscles(selectedMuscles.filter(m => m.name !== muscleName));
        } else {
            if (selectedMuscles.length >= 2) {
                Alert.alert("MÁXIMO ATINGIDO", "VOCÊ SÓ PODE ESCOLHER ATÉ 2 GRUPOS MUSCULARES.");
                return;
            }
            // Default config: 3 exercises, 4 sets
            setSelectedMuscles([...selectedMuscles, { name: muscleName, exercises: 3, sets: 4 }]);
        }
    };

    const updateMuscleConfig = (muscleName: string, field: 'exercises' | 'sets', value: number) => {
        setSelectedMuscles(selectedMuscles.map(m => {
            if (m.name === muscleName) {
                return { ...m, [field]: value };
            }
            return m;
        }));
    };

    const handleGenerate = async () => {
        if (selectedMuscles.length === 0) return;

        setLoading(true);
        try {
            const payload = selectedMuscles.map(m => ({
                name: m.name,
                count: m.exercises,
                sets: m.sets
            }));

            const workoutPlan = await generateWorkoutPlan(payload);

            if (workoutPlan && workoutPlan.exercises) {
                 const newExercises = workoutPlan.exercises.map((ex: any, index: number) => ({
                        id: Date.now() + index + Math.random().toString(),
                        name: ex.name,
                        sets: Array(ex.sets).fill(0).map((_, i) => ({
                            id: `${Date.now()}_${index}_${i}`,
                            reps: ex.reps?.toString() || '',
                            weight: ex.weight?.toString() || '',
                            completed: false
                        })),
                    }));

                loadAIWorkout(newExercises, workoutPlan.name);
                onClose();
            } else {
                Alert.alert("ERRO", "O MONSTRO NÃO CONSEGUIU MONTAR O TREINO. TENTE NOVAMENTE.");
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("ERRO DE CONEXÃO", "NÃO FOI POSSÍVEL FALAR COM O COACH. VERIFIQUE SUA INTERNET.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-background pt-6">
                <View className="flex-row justify-between items-center px-5 py-4 border-b border-border bg-elevated">
                    <MonsterText variant="titleMd" className="text-white">GERADOR IA 🦁</MonsterText>
                    <TouchableOpacity onPress={onClose} className="p-2">
                        <FontAwesome name="times" size={24} color={MonsterColors.textMuted} />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-5 pt-6 pb-10">
                    <MonsterText variant="titleSm" className="text-white mb-4">1. ESCOLHA OS MÚSCULOS (MÁX 2)</MonsterText>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {MUSCLE_GROUPS.map(muscle => {
                            const isSelected = selectedMuscles.some(m => m.name === muscle);
                            return (
                                <TouchableOpacity
                                    key={muscle}
                                    onPress={() => toggleMuscle(muscle)}
                                    className={`px-4 py-3 rounded-lg border ${isSelected ? 'bg-accent border-accent' : 'bg-elevated border-border'}`}
                                >
                                    <MonsterText
                                        variant="caption"
                                        className={`${isSelected ? 'text-black font-bold' : 'text-text-secondary'}`}
                                    >
                                        {muscle.toUpperCase()}
                                    </MonsterText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {selectedMuscles.length > 0 && (
                        <>
                            <MonsterText variant="titleSm" className="text-white mb-4">2. CONFIGURE O VOLUME</MonsterText>
                            {selectedMuscles.map((muscle) => (
                                <MonsterCard key={muscle.name} className="mb-4 bg-elevated/50">
                                    <MonsterText variant="titleSm" className="text-accent mb-4">{muscle.name.toUpperCase()}</MonsterText>

                                    <View className="flex-row gap-4">
                                        <View className="flex-1 items-center">
                                            <MonsterText variant="tiny" className="text-text-muted mb-2">EXERCÍCIOS</MonsterText>
                                            <View className="flex-row items-center bg-background rounded-full p-1 border border-border">
                                                <TouchableOpacity onPress={() => updateMuscleConfig(muscle.name, 'exercises', Math.max(1, muscle.exercises - 1))} className="w-8 h-8 items-center justify-center bg-elevated rounded-full">
                                                    <FontAwesome name="minus" size={12} color="white" />
                                                </TouchableOpacity>
                                                <MonsterText variant="titleSm" className="text-white mx-4">{muscle.exercises}</MonsterText>
                                                <TouchableOpacity onPress={() => updateMuscleConfig(muscle.name, 'exercises', Math.min(10, muscle.exercises + 1))} className="w-8 h-8 items-center justify-center bg-elevated rounded-full">
                                                    <FontAwesome name="plus" size={12} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View className="flex-1 items-center">
                                            <MonsterText variant="tiny" className="text-text-muted mb-2">SÉRIES</MonsterText>
                                            <View className="flex-row items-center bg-background rounded-full p-1 border border-border">
                                                <TouchableOpacity onPress={() => updateMuscleConfig(muscle.name, 'sets', Math.max(1, muscle.sets - 1))} className="w-8 h-8 items-center justify-center bg-elevated rounded-full">
                                                    <FontAwesome name="minus" size={12} color="white" />
                                                </TouchableOpacity>
                                                <MonsterText variant="titleSm" className="text-white mx-4">{muscle.sets}</MonsterText>
                                                <TouchableOpacity onPress={() => updateMuscleConfig(muscle.name, 'sets', Math.min(10, muscle.sets + 1))} className="w-8 h-8 items-center justify-center bg-elevated rounded-full">
                                                    <FontAwesome name="plus" size={12} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </MonsterCard>
                            ))}
                        </>
                    )}

                    <View className="mt-6 gap-3 pb-10">
                         <MonsterButton
                            title={loading ? "MONTANDO TREINO..." : "GERAR TREINO MONSTRO"}
                            onPress={handleGenerate}
                            disabled={loading || selectedMuscles.length === 0}
                            loading={loading}
                            icon={<FontAwesome name="bolt" size={16} color="black" />}
                            size="lg"
                        />
                         <MonsterButton
                            title="CANCELAR"
                            variant="ghost"
                            onPress={onClose}
                        />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};
