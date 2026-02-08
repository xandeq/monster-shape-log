import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { ProgressModal } from '@/components/ProgressModal';
import { ProgressWidget } from '@/components/ProgressWidget';
import { ScreenContainer } from '@/components/ScreenContainer';
import { MonsterColors } from '@/constants/Colors';
import { EXERCISES } from '@/constants/Exercises';
import { useWorkout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  const { getWorkoutStats, history, isWorkoutActive, workoutName, workoutTimer, startWorkout } = useWorkout();
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const stats = getWorkoutStats();

  // Get last workout title or default
  const lastWorkoutTitle = history.length > 0 ? history[0].name : "Sem treinos recentes";
  const lastWorkoutDate = history.length > 0 ? new Date(history[0].date).toLocaleDateString('pt-BR') : "";

  // Random Featured Exercise
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
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.logoRow}>
            <Image source={require('../../assets/images/logo.png')} style={styles.headerLogo} contentFit="contain" />
            <View>
                <Text style={styles.greeting}>BEM-VINDO DE VOLTA</Text>
                <Text style={styles.username}>MODO MONSTRO</Text>
            </View>
          </View>
        </View>

        {/* Active Workout Widget */}
        {isWorkoutActive ? (
            <MonsterCard style={styles.activeWorkoutCard}>
                <View style={styles.activeHeader}>
                    <View>
                        <Text style={styles.activeLabel}>EM ANDAMENTO</Text>
                        <Text style={styles.activeTitle}>{workoutName || "Treino Monstro"}</Text>
                    </View>
                    <Text style={styles.activeTimer}>{formatTime(workoutTimer)}</Text>
                </View>
                <MonsterButton title="Retomar Treino" icon="play-circle" onPress={() => router.push('/track')} style={{ marginTop: 16 }} />
            </MonsterCard>
        ) : (
             <MonsterCard style={styles.activeWorkoutCard}>
                <View style={styles.activeHeader}>
                    <View>
                         <Text style={styles.activeLabel}>PRONTO PRA ESMAGAR?</Text>
                         <Text style={styles.activeTitle}>Começar Treino</Text>
                    </View>
                    <FontAwesome name="bolt" size={24} color={MonsterColors.textSecondary} />
                </View>
                 <MonsterButton
                    title="Novo Treino"
                    icon="plus-circle"
                    onPress={() => {
                        startWorkout();
                        router.push('/track');
                    }}
                    style={{ marginTop: 16 }}
                 />
            </MonsterCard>
        )}

        <MonsterCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Treinos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(stats.totalTime / 3600)}h</Text>
              <Text style={styles.statLabel}>Tempo</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(stats.totalVolume / 1000).toFixed(1)}k</Text>
              <Text style={styles.statLabel}>Volume</Text>
            </View>
          </View>
        </MonsterCard>

        {/* Progress Widget */}
        <ProgressWidget onPress={() => setProgressModalVisible(true)} />

        <Text style={styles.sectionTitle}>AÇÕES RÁPIDAS</Text>

        <View style={styles.grid}>
          {/* History Widget */}
          <MonsterCard style={styles.gridItem} title="Histórico">
            <FontAwesome name="history" size={32} color={MonsterColors.secondary} style={styles.icon} />
             <View style={styles.gridContent}>
                <Text style={styles.gridValue}>{history.length}</Text>
                <Text style={styles.microText} numberOfLines={1}>{lastWorkoutTitle}</Text>
                <Text style={styles.gridDate}>{lastWorkoutDate}</Text>
             </View>
             <MonsterButton title="Ver" icon="list-ol" onPress={() => router.push('/history')} style={styles.microButton} variant="outline" />
          </MonsterCard>

          {/* Featured Exercise Widget */}
          <MonsterCard style={styles.gridItem} title="Destaque">
             <FontAwesome name={featuredExercise.icon} size={32} color={MonsterColors.primary} style={styles.icon} />
             <View style={styles.gridContent}>
                <Text style={styles.gridLabel}>TENTE ISSO</Text>
                <Text style={styles.gridValueSmall} numberOfLines={1}>{featuredExercise.name}</Text>
                <Text style={styles.microText}>{featuredExercise.muscleGroup}</Text>
             </View>
             <MonsterButton title="Aprender" icon="search" onPress={() => router.push('/library')} style={styles.microButton} variant="outline" />
          </MonsterCard>
        </View>

        <MonsterCard title="Dica do Dia">
          <Text style={styles.tipText}>"A dor é apenas a fraqueza saindo do corpo. Empurre mais forte hoje."</Text>
        </MonsterCard>

        <ProgressModal
            visible={progressModalVisible}
            onClose={() => setProgressModalVisible(false)}
        />

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  headerLogo: {
      width: 50,
      height: 50,
  },
  greeting: {
    fontSize: 14,
    color: MonsterColors.textSecondary,
    marginBottom: 4,
    letterSpacing: 2,
  },
  username: {
    fontSize: 32,
    fontWeight: 'bold',
    color: MonsterColors.text,
    fontStyle: 'italic',
  },
  // Active Workout Styles
  activeWorkoutCard: {
      marginBottom: 24,
      backgroundColor: MonsterColors.secondary, // Navy Blue
      borderWidth: 1,
      borderColor: MonsterColors.primary, // Yellow border
  },
  activeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  activeLabel: {
      color: MonsterColors.primary, // Pink
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 4,
      letterSpacing: 1,
  },
  activeTitle: {
      color: '#ffffff', // White text
      fontSize: 20,
      fontWeight: 'bold',
  },
  activeTimer: {
      color: '#ffffff', // White text
      fontSize: 24,
      fontFamily: 'SpaceMono',
  },
  // Key Stats
  statsCard: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: MonsterColors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MonsterColors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: MonsterColors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: MonsterColors.text,
    marginBottom: 12,
    letterSpacing: 1,
  },
  // Grid Widgets
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  gridItem: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  icon: {
    marginBottom: 8,
    alignSelf: 'center',
  },
  gridContent: {
      alignItems: 'center',
      marginBottom: 12,
  },
  gridLabel: {
      color: MonsterColors.success,
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 2,
  },
  gridValue: {
      color: MonsterColors.text,
      fontSize: 20,
      fontWeight: 'bold',
  },
  gridValueSmall: {
      color: MonsterColors.text,
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  microText: {
    color: MonsterColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  gridDate: {
      color: MonsterColors.textSecondary,
      fontSize: 10,
  },
  microButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    width: '100%',
    marginBottom: 0,
    height: 32,
  },
  tipText: {
    color: MonsterColors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
