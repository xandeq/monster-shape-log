import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { MonsterCoach } from '@/components/MonsterCoach';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { ProgressModal } from '@/components/ProgressModal';
import { ProgressWidget } from '@/components/ProgressWidget';
import { MonsterColors } from '@/constants/Colors';
import { EXERCISES } from '@/constants/Exercises';
import { useWorkout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function DashboardScreen() {
  const { getWorkoutStats, history, isWorkoutActive, workoutName, workoutTimer, startWorkout } = useWorkout();
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const stats = getWorkoutStats();

  const lastWorkoutTitle = history.length > 0 ? history[0].name : "SEM TREINOS";
  const lastWorkoutDate = history.length > 0 ? new Date(history[0].date).toLocaleDateString('pt-BR') : "--/--";

  const [featuredExercise, setFeaturedExercise] = useState(EXERCISES[0]);
  useEffect(() => {
      const random = EXERCISES[Math.floor(Math.random() * EXERCISES.length)];
      setFeaturedExercise(random);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <MonsterLayout noPadding>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View className="items-center justify-center px-5 py-6 bg-background border-b border-border">
            <MonsterText variant="titleMd" className="text-white font-bold tracking-widest">MODO MONSTRO</MonsterText>
        </View>

        <View className="px-5 mt-6 space-y-6">
            {/* Active Workout Widget */}
            <MonsterCard active={isWorkoutActive} className="relative overflow-hidden">
                <View className="flex-row justify-between items-start mb-4">
                    <MonsterText variant="tiny" className="text-accent tracking-widest">
                        {isWorkoutActive ? "TREINO EM ANDAMENTO" : "PRONTO PRA ESMAGAR?"}
                    </MonsterText>
                    <MonsterText variant="titleLg" className="text-muted/10 absolute -top-2 -right-2">01</MonsterText>
                </View>

                {isWorkoutActive ? (
                    <View>
                        <View className="flex-row justify-between items-end mb-6">
                            <MonsterText variant="titleMd" className="max-w-[60%] text-white">{workoutName || "TREINO MONSTRO"}</MonsterText>
                            <MonsterText variant="titleLg" neon>{formatTime(workoutTimer)}</MonsterText>
                        </View>
                        <MonsterButton title="RETOMAR TREINO" icon={<FontAwesome name="play" size={12} color="black" />} onPress={() => router.push('/track')} />
                    </View>
                ) : (
                    <View>
                         <View className="flex-row justify-between items-center mb-6">
                             <MonsterText variant="body" className="max-w-[70%] text-text-secondary">
                                O único treino ruim é aquele que não aconteceu.
                             </MonsterText>
                         </View>
                         <MonsterButton
                            title="NOVO TREINO"
                            icon={<FontAwesome name="plus" size={12} color="black" />}
                            onPress={() => {
                                startWorkout();
                                router.push('/track');
                            }}
                         />
                    </View>
                )}
            </MonsterCard>

             {/* Stats Grid */}
            <View className="flex-row gap-4">
                 <MonsterCard className="flex-1 items-center justify-center py-6">
                    <MonsterText variant="titleLg" neon>{stats.totalWorkouts}</MonsterText>
                    <MonsterText variant="tiny" className="mt-1">TREINOS</MonsterText>
                 </MonsterCard>
                 <MonsterCard className="flex-1 items-center justify-center py-6">
                    <MonsterText variant="titleLg" neon>{Math.round(stats.totalTime / 3600)}H</MonsterText>
                    <MonsterText variant="tiny" className="mt-1">TEMPO</MonsterText>
                 </MonsterCard>
                 <MonsterCard className="flex-1 items-center justify-center py-6">
                    <MonsterText variant="titleLg" neon>{(stats.totalVolume / 1000).toFixed(0)}K</MonsterText>
                    <MonsterText variant="tiny" className="mt-1">VOLUME</MonsterText>
                 </MonsterCard>
            </View>

            {/* Quick Actions Title */}
            <MonsterText variant="titleSm" className="text-center mt-2 mb-2">AÇÕES RÁPIDAS</MonsterText>

            <View className="flex-row gap-4">
                {/* History Widget */}
                <View className="flex-1">
                    <MonsterCard className="h-full justify-between bg-elevated/50">
                         <View className="items-center mb-4">
                            <FontAwesome name="history" size={24} color={MonsterColors.textMuted} />
                            <MonsterText variant="titleLg" className="mt-2 text-white">{history.length}</MonsterText>
                            <MonsterText variant="tiny" numberOfLines={1} className="mt-1 text-center text-text-muted">{lastWorkoutTitle.toUpperCase()}</MonsterText>
                            <MonsterText variant="caption" className="opacity-50">{lastWorkoutDate}</MonsterText>
                         </View>
                         <MonsterButton title="VER" variant="secondary" size="sm" onPress={() => router.push('/history')} />
                    </MonsterCard>
                </View>

                {/* Featured Exercise Widget */}
                <View className="flex-1">
                    <MonsterCard className="h-full justify-between bg-elevated/50">
                         <View className="items-center mb-4">
                            <FontAwesome name="star" size={24} color={MonsterColors.accent} />
                            <MonsterText variant="tiny" className="text-accent mt-2">DICA MONSTRA</MonsterText>
                            <MonsterText variant="titleSm" numberOfLines={1} className="text-center mt-1 text-white">{featuredExercise.name.toUpperCase()}</MonsterText>
                            <MonsterText variant="caption" className="opacity-50">{featuredExercise.muscleGroup.toUpperCase()}</MonsterText>
                         </View>
                         <MonsterButton title="VER" variant="secondary" size="sm" onPress={() => router.push('/library')} />
                    </MonsterCard>
                </View>
            </View>

            {/* Progress & Coach */}
            <ProgressWidget onPress={() => setProgressModalVisible(true)} />
            <MonsterCoach />

            {/* Quote */}
            <MonsterCard className="mb-8">
                <MonsterText variant="body" className="italic text-center text-text-secondary">
                    "A dor é apenas a fraqueza saindo do corpo. Empurre mais forte hoje."
                </MonsterText>
            </MonsterCard>

        </View>

        <ProgressModal
            visible={progressModalVisible}
            onClose={() => setProgressModalVisible(false)}
        />

      </ScrollView>
    </MonsterLayout>
  );
}
