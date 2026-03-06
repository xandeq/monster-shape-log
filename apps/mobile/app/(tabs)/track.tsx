import { ExerciseSelectorModal } from '@/components/ExerciseSelectorModal';
import { GenerateWorkoutModal } from '@/components/GenerateWorkoutModal';
import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { MonsterLayout } from '@/components/MonsterLayout';
import { MonsterText } from '@/components/MonsterText';
import { PRBadge } from '@/components/PRBadge';
import { ProgressWidget } from '@/components/ProgressWidget';
import { TemplatePickerModal } from '@/components/TemplatePickerModal';
import { MonsterColors } from '@/constants/Colors';
import { ProgressionData, useWorkout } from '@/context/WorkoutContext';
import { saveTemplate, templateToExercises, WorkoutTemplate } from '@/lib/templates';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

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
      removeExercise,
      removeSet,
      getExerciseProgression,
      loadAIWorkout,
  } = useWorkout();

  const [newExerciseName, setNewExerciseName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [libraryModalVisible, setLibraryModalVisible] = useState(false);
  const [progressionMap, setProgressionMap] = useState<Record<string, ProgressionData | null>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [prFlashSets, setPrFlashSets] = useState<Set<string>>(new Set());
  const [templatePickerVisible, setTemplatePickerVisible] = useState(false);

  const handleSaveTemplate = () => {
    if (currentWorkout.length === 0) {
      Alert.alert('Vazio', 'Adicione exercícios antes de salvar um template.');
      return;
    }
    const name = workoutName || 'Meu Template';
    Alert.alert(
      'SALVAR TEMPLATE',
      `Salvar "${name}" com ${currentWorkout.length} exercício(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salvar',
          onPress: async () => {
            await saveTemplate(name, currentWorkout);
            Alert.alert('✓ Salvo!', 'Template guardado.');
          },
        },
      ],
    );
  };

  const handleLoadTemplate = (template: WorkoutTemplate) => {
    if (currentWorkout.length > 0) {
      Alert.alert(
        'Substituir Treino?',
        'O treino atual será substituído pelo template.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Carregar', onPress: () => loadAIWorkout(templateToExercises(template), template.name) },
        ],
      );
    } else {
      loadAIWorkout(templateToExercises(template), template.name);
    }
  };

  const isPR = (exerciseId: string, weight: string) => {
    if (!weight) return false;
    const maxWeight = progressionMap[exerciseId]?.history_stats?.last_max_weight;
    if (!maxWeight) return false;
    return parseFloat(weight) > maxWeight;
  };

  const handleToggleSet = (exerciseId: string, setId: string) => {
    const exercise = currentWorkout.find(e => e.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    if (set && !set.completed && isPR(exerciseId, set.weight)) {
      setPrFlashSets(prev => new Set([...prev, setId]));
      setTimeout(() => {
        setPrFlashSets(prev => { const n = new Set(prev); n.delete(setId); return n; });
      }, 2200);
    }
    toggleSet(exerciseId, setId);
  };

  useEffect(() => {
    const loadProgression = async () => {
        for (const exercise of currentWorkout) {
            // Check if we already have data or are loading
            if (progressionMap[exercise.id] === undefined && !loadingMap[exercise.id]) {
                 setLoadingMap(prev => ({ ...prev, [exercise.id]: true }));
                 // We use a local variable to avoid race conditions if needed, but simple is fine
                 getExerciseProgression(exercise.name).then(data => {
                     setProgressionMap(prev => ({ ...prev, [exercise.id]: data }));
                     setLoadingMap(prev => ({ ...prev, [exercise.id]: false }));
                 });
            }
        }
    };
    loadProgression();
  }, [currentWorkout]);

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
    // ... existing logic ...
    if (Platform.OS === 'web') {
        if (confirm("FINALIZAR TREINO: TEM CERTEZA QUE QUER FINALIZAR ESSA SESSÃO MONSTRA?")) {
             finishWorkout();
             router.replace('/');
        }
    } else {
        Alert.alert(
        "FINALIZAR TREINO",
        "TEM CERTEZA QUE QUER FINALIZAR ESSA SESSÃO MONSTRA?",
        [
            { text: "CANCELAR", style: "cancel" },
            {
            text: "FINALIZAR",
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
    // ... existing logic ...
    if (Platform.OS === 'web') {
        if (confirm("CANCELAR TREINO: ISSO IRÁ DESCARTAR O PROGRESSO ATUAL. TEM CERTEZA?")) {
             cancelWorkout();
             router.replace('/');
        }
    } else {
        Alert.alert(
        "CANCELAR TREINO",
        "ISSO IRÁ DESCARTAR O PROGRESSO ATUAL. TEM CERTEZA?",
        [
            { text: "NÃO", style: "cancel" },
            {
            text: "DESCARTAR",
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
    <MonsterLayout noPadding>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 20 }}>

          <MonsterCard className="border-accent/50 mb-6" active>
             <View className="flex-row justify-between items-center">
                <TextInput
                  className="font-mono font-bold text-lg text-white flex-1 mr-4 bg-transparent py-2"
                  placeholder="NOME DO TREINO..."
                  placeholderTextColor={MonsterColors.textMuted}
                  value={workoutName}
                  onChangeText={setWorkoutName}
                />
                <MonsterText variant="titleMd" neon>{formatTime(workoutTimer)}</MonsterText>
             </View>
          </MonsterCard>

          {currentWorkout.length === 0 && (
              <View className="p-8 items-center justify-center border-2 border-dashed border-border rounded-xl bg-elevated/20 mt-4 space-y-4">
                  <MonsterText variant="body" className="text-text-secondary italic text-center">
                    NENHUM EXERCÍCIO ADICIONADO.
                    {"\n"}
                    O FERRO ESTÁ ESPERANDO.
                  </MonsterText>
                   <MonsterButton
                        title="CRIAR TREINO COM IA"
                        onPress={() => setModalVisible(true)}
                        icon={<FontAwesome name="magic" size={14} color="#000" />}
                        variant="secondary"
                    />
              </View>
          )}

          {currentWorkout.map((exercise) => (
            <MonsterCard key={exercise.id} className="mb-4" noPadding>
                {/* Exercise Header */}
                <View className="flex-row justify-between items-center p-4 border-b border-border bg-elevated">
                    <MonsterText variant="titleSm" className="text-white flex-1">{exercise.name.toUpperCase()}</MonsterText>
                    <TouchableOpacity onPress={() => removeExercise(exercise.id)} className="p-2">
                        <FontAwesome name="trash" size={16} color={MonsterColors.error} />
                    </TouchableOpacity>
                </View>

                {/* Monster Coach Widget */}
                <View className="px-4 pt-4">
                    <ProgressWidget
                        data={progressionMap[exercise.id] || null}
                        loading={!!loadingMap[exercise.id]}
                    />
                </View>

                {/* Sets Header */}
                <View className="flex-row px-4 py-2 bg-secondary/50">
                    <MonsterText variant="tiny" className="flex-[0.5] text-center">SÉRIE</MonsterText>
                    <MonsterText variant="tiny" className="flex-1 text-center">KG</MonsterText>
                    <MonsterText variant="tiny" className="flex-1 text-center">REPS</MonsterText>
                    <MonsterText variant="tiny" className="flex-[0.5] text-center">FEITO</MonsterText>
                    <View className="flex-[0.3]" />
                </View>

                {/* Sets List */}
                <View className="p-2 space-y-2">
                    {exercise.sets.map((set, index) => (
                        <View key={set.id} className={`flex-row items-center p-2 rounded-lg ${set.completed ? 'bg-success/10' : 'bg-background'}`}>
                             {/* Set Number */}
                             <View className="flex-[0.5] items-center justify-center">
                                <View className="w-6 h-6 rounded-full bg-elevated items-center justify-center">
                                    <MonsterText variant="tiny" className="text-text-muted">{index + 1}</MonsterText>
                                </View>
                             </View>

                             {/* Weight Input */}
                             <View className="flex-1 px-1">
                                <View style={{ position: 'relative' }}>
                                  <TextInput
                                    className={`bg-elevated text-white rounded text-center py-3 text-base font-bold font-mono border ${set.completed ? 'border-success text-success' : 'border-border'}`}
                                    placeholder="0"
                                    placeholderTextColor={MonsterColors.textMuted}
                                    keyboardType="numeric"
                                    value={set.weight}
                                    onChangeText={(val) => updateSet(exercise.id, set.id, 'weight', val)}
                                    editable={!set.completed}
                                  />
                                  {prFlashSets.has(set.id) && (
                                    <View style={{ position: 'absolute', top: -14, alignSelf: 'center', zIndex: 20 }}>
                                      <PRBadge mode="float" />
                                    </View>
                                  )}
                                </View>
                             </View>

                             {/* Reps Input */}
                             <View className="flex-1 px-1">
                                <TextInput
                                  className={`bg-elevated text-white rounded text-center py-3 text-base font-bold font-mono border ${set.completed ? 'border-success text-success' : 'border-border'}`}
                                  placeholder="0"
                                  placeholderTextColor={MonsterColors.textMuted}
                                  keyboardType="numeric"
                                  value={set.reps}
                                  onChangeText={(val) => updateSet(exercise.id, set.id, 'reps', val)}
                                  editable={!set.completed}
                                />
                             </View>

                             {/* Check Button */}
                             <View className="flex-[0.5] items-center justify-center">
                                <TouchableOpacity
                                  className={`w-10 h-10 rounded-lg items-center justify-center border ${set.completed ? 'bg-success border-success' : 'bg-elevated border-border'}`}
                                  onPress={() => handleToggleSet(exercise.id, set.id)}
                                >
                                  {set.completed && <FontAwesome name="check" size={14} color="#000" />}
                                </TouchableOpacity>
                             </View>

                             {/* Delete Set */}
                             <View className="flex-[0.3] items-center justify-center">
                                <TouchableOpacity onPress={() => removeSet(exercise.id, set.id)} className="p-2">
                                    <FontAwesome name="times" size={14} color={MonsterColors.textMuted} />
                                </TouchableOpacity>
                             </View>
                        </View>
                    ))}

                    <MonsterButton
                        title="ADD SÉRIE"
                        icon={<FontAwesome name="plus" size={10} color={MonsterColors.accent} />}
                        variant="ghost"
                        size="sm"
                        onPress={() => addSet(exercise.id)}
                        className="mt-2 border border-dashed border-border"
                    />
                </View>
            </MonsterCard>
          ))}

          {/* Add Exercise Section */}
          <MonsterCard className="mt-4 border-dashed border-border bg-transparent p-4">
            <View className="flex-row justify-between items-center mb-4">
              <MonsterText variant="titleSm" className="text-white">ADICIONAR EXERCÍCIO</MonsterText>
              {/* Template buttons */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,255,136,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(0,255,136,0.2)' }}
                  onPress={() => setTemplatePickerVisible(true)}
                >
                  <Ionicons name="copy-outline" size={12} color={MonsterColors.primary} />
                  <MonsterText variant="tiny" style={{ color: MonsterColors.primary, fontSize: 9 }}>TEMPLATES</MonsterText>
                </TouchableOpacity>
                {currentWorkout.length > 0 && (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(6,182,212,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)' }}
                    onPress={handleSaveTemplate}
                  >
                    <Ionicons name="bookmark-outline" size={12} color={MonsterColors.cyan} />
                    <MonsterText variant="tiny" style={{ color: MonsterColors.cyan, fontSize: 9 }}>SALVAR</MonsterText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View className="flex-row items-center gap-3">
                 <TouchableOpacity
                    className="w-12 h-12 bg-elevated rounded-lg items-center justify-center border border-border"
                    onPress={() => setLibraryModalVisible(true)}
                 >
                    <FontAwesome name="book" size={20} color={MonsterColors.textPrimary} />
                 </TouchableOpacity>

                 <TextInput
                    className="flex-1 bg-elevated text-white rounded-lg p-3 border border-border font-mono h-[48px]"
                    placeholder="EX. LEVANTAMENTO TERRA"
                    placeholderTextColor={MonsterColors.textMuted}
                    value={newExerciseName}
                    onChangeText={setNewExerciseName}
                  />
            </View>
            <MonsterButton title="ADICIONAR" icon={<FontAwesome name="plus" size={12} color="black" />} onPress={handleAddExercise} className="mt-4" />
          </MonsterCard>

          {/* Action Buttons */}
          <View className="flex-row mt-8 gap-4 mb-8">
            <View style={{ flex: 1 }}>
                <MonsterButton
                    title="DESCARTAR"
                    icon={<FontAwesome name="trash" size={12} color="white" />}
                    variant="danger"
                    onPress={onCancelPress}
                />
            </View>
            <View style={{ flex: 1 }}>
                <MonsterButton
                    title="FINALIZAR"
                    icon={<FontAwesome name="flag-checkered" size={12} color="black" />}
                    variant="primary"
                    onPress={onFinishPress}
                />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <GenerateWorkoutModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <ExerciseSelectorModal
        visible={libraryModalVisible}
        onClose={() => setLibraryModalVisible(false)}
        onSelect={(name) => addExercise(name)}
      />
      <TemplatePickerModal
        visible={templatePickerVisible}
        onClose={() => setTemplatePickerVisible(false)}
        onLoad={handleLoadTemplate}
      />
    </MonsterLayout>
  );
}
