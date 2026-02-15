import { supabase } from '@/lib/supabase';
import { getExerciseProgression, ProgressionData } from '@/lib/workout';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

// Define types
export interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name: string;
  date: string; // ISO string
  duration: number; // in seconds
  exercises: Exercise[];
}



interface WorkoutContextType {
  history: Workout[];
  currentWorkout: Exercise[];
  workoutTimer: number;
  isWorkoutActive: boolean;
  workoutName: string;

  setWorkoutName: (name: string) => void;
  startWorkout: () => void;
  finishWorkout: () => Promise<void>;
  cancelWorkout: () => void;
  addExercise: (name: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => void;
  toggleSet: (exerciseId: string, setId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  clearHistory: () => void;
  getWorkoutStats: () => { totalWorkouts: number; totalVolume: number; totalTime: number };
  loadAIWorkout: (exercises: Exercise[], name: string) => void;
  removeExercise: (exerciseId: string) => void;
  deleteWorkout: (workoutId: string) => Promise<void>;
  getExerciseProgression: (exerciseName: string) => Promise<ProgressionData | null>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [history, setHistory] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  // Fetch History on Mount
  useEffect(() => {
    if (session?.user) {
        fetchHistory();
    } else {
        setHistory([]);
    }
  }, [session]);

  const fetchHistory = async () => {
    try {
      if (!session?.user) return;

      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });

      if (workoutsError) throw workoutsError;

      if (!workoutsData) return;

      // For each workout, fetch exercises and sets
      // Optimized approach: fetch all exercises and sets linked to these workouts
      // For MVP simplicity, we might just load them eagerly or use joins if we defined views.
      // Let's do a client-side join for simplicity for now.

      const enrichedWorkouts: Workout[] = await Promise.all(workoutsData.map(async (w: any) => {
          const { data: exercisesData } = await supabase
            .from('workout_exercises')
            .select('*')
            .eq('workout_id', w.id);

          if (!exercisesData) return { ...w, exercises: [] };

          const exercises: Exercise[] = await Promise.all(exercisesData.map(async (e: any) => {
             const { data: setsData } = await supabase
                .from('workout_sets')
                .select('*')
                .eq('exercise_id', e.id)
                .order('created_at', { ascending: true });

             return {
                 id: e.id,
                 name: e.name,
                 sets: setsData ? setsData.map((s: any) => ({
                     id: s.id,
                     weight: s.weight,
                     reps: s.reps,
                     completed: s.completed
                 })) : []
             };
          }));

          return {
              id: w.id,
              name: w.name,
              date: w.date,
              duration: w.duration,
              exercises
          };
      }));

      setHistory(enrichedWorkouts);
    } catch (error) {
      console.log('Error fetching history:', error);
      // Fallback to local if offline or table doesn't exist yet
    }
  };

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  const startWorkout = () => {
      setIsWorkoutActive(true);
      if (currentWorkout.length === 0 && workoutTimer === 0) {
          setWorkoutName('Treino Monstro');
      }
  };

  const finishWorkout = async () => {
    if (!session?.user) {
        Alert.alert('Erro', 'Você precisa estar logado para salvar.');
        return;
    }

    try {
        // 1. Insert Workout
        const { data: workoutData, error: workoutError } = await supabase
            .from('workouts')
            .insert([{
                user_id: session.user.id,
                name: workoutName || "Treino Monstro",
                duration: workoutTimer,
                date: new Date().toISOString()
            }])
            .select()
            .single();

        if (workoutError) throw workoutError;
        const workoutId = workoutData.id;

        // 2. Insert Exercises & Sets
        for (const exercise of currentWorkout) {
            const { data: exerciseData, error: exerciseError } = await supabase
                .from('workout_exercises')
                .insert([{
                    user_id: session.user.id,
                    workout_id: workoutId,
                    name: exercise.name
                }])
                .select()
                .single();

            if (exerciseError) continue;
            const exerciseId = exerciseData.id;

            const setsToInsert = exercise.sets.map(s => ({
                user_id: session.user.id,
                exercise_id: exerciseId,
                weight: s.weight,
                reps: s.reps,
                completed: s.completed
            }));

            await supabase.from('workout_sets').insert(setsToInsert);
        }

        // Refresh History
        await fetchHistory();

        // Reset Local State
        setCurrentWorkout([]);
        setWorkoutTimer(0);
        setIsWorkoutActive(false);
        setWorkoutName('');

    } catch (error) {
        console.error("Error saving workout:", error);
        Alert.alert("Erro", "Falha ao salvar o treino. Verifique sua conexão.");
    }
  };

  const cancelWorkout = () => {
    setCurrentWorkout([]);
    setWorkoutTimer(0);
    setIsWorkoutActive(false);
    setWorkoutName('');
  };

  const addExercise = (name: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(), // Temporary ID for UI
      name: name.trim(),
      sets: [
        { id: Date.now().toString() + '_1', weight: '', reps: '', completed: false }
      ]
    };
    setCurrentWorkout([...currentWorkout, newExercise]);
    if (!isWorkoutActive) setIsWorkoutActive(true);
  };

  const addSet = (exerciseId: string) => {
    setCurrentWorkout(currentWorkout.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, {
            id: Date.now().toString(),
            weight: lastSet ? lastSet.weight : '',
            reps: lastSet ? lastSet.reps : '',
            completed: false
          }]
        };
      }
      return ex;
    }));
    if (!isWorkoutActive) setIsWorkoutActive(true);
  };

  const updateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    setCurrentWorkout(currentWorkout.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set => {
            if (set.id === setId) {
              return { ...set, [field]: value };
            }
            return set;
          })
        };
      }
      return ex;
    }));
  };

  const toggleSet = (exerciseId: string, setId: string) => {
    setCurrentWorkout(currentWorkout.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set => {
            if (set.id === setId) {
              return { ...set, completed: !set.completed };
            }
            return set;
          })
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setCurrentWorkout(currentWorkout.map(ex => {
          if (ex.id === exerciseId) {
              return {
                  ...ex,
                  sets: ex.sets.filter(set => set.id !== setId)
              };
          }
          return ex;
      }).filter(ex => ex.sets.length > 0));
  };

  const removeExercise = (exerciseId: string) => {
    setCurrentWorkout(currentWorkout.filter(ex => ex.id !== exerciseId));
  };

  const clearHistory = async () => {
    // Optional: Delete from Supabase? Or just local clear?
    // Let's protect data by not deleting from DB for now safely, or implement delete all.
    // For this MVP, let's just clear local state to simplify, or actually delete if requested.
    // await supabase.from('workouts').delete().neq('id', '0'); // Delete all
    setHistory([]);
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
        if (session?.user) {
            const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
            if (error) throw error;
        }
        setHistory(prev => prev.filter(w => w.id !== workoutId));
    } catch (error) {
        console.error("Error deleting workout:", error);
        Alert.alert("Erro", "Falha ao excluir o treino.");
    }
  };

  // No need to redefine getExerciseProgression, we import it but we want to expose it via context if needed, or just let components import it directly.
  // Actually, keeping it in context allows dependency injection or mocking easily, but let's just wrap the lib call.
  // However, since it's stateless (depends on session which lib handles or we pass), let's just expose the lib function wrapped or directly using the lib.
  // BUT context already has it defined in interface.

  // Let's reuse the imported function
  const getExerciseProgressionWrapper = async (exerciseName: string) => {
      return getExerciseProgression(exerciseName);
  };

  const getWorkoutStats = () => {
    const totalWorkouts = history.length;
    const totalTime = history.reduce((acc, curr) => acc + curr.duration, 0);

    const totalVolume = history.reduce((acc, workout) => {
      const workoutVol = workout.exercises.reduce((exAcc, ex) => {
        return exAcc + ex.sets.reduce((setAcc, set) => {
           if (!set.completed) return setAcc;
           const w = parseFloat(set.weight) || 0;
           const r = parseFloat(set.reps) || 0;
           return setAcc + (w * r);
        }, 0);
      }, 0);
      return acc + workoutVol;
    }, 0);

    return { totalWorkouts, totalVolume, totalTime };
  };

  const loadAIWorkout = (exercises: Exercise[], name: string) => {
      setCurrentWorkout(exercises);
      setWorkoutName(name);
      setIsWorkoutActive(true);
      if (workoutTimer === 0) setWorkoutTimer(0); // Optional: reset or keep
  };

  return (
    <WorkoutContext.Provider value={{
        history,
        currentWorkout,
        workoutTimer,
        isWorkoutActive,
        workoutName,
        setWorkoutName,
        startWorkout,
        finishWorkout,
        cancelWorkout,
        addExercise,
        addSet,
        updateSet,
        toggleSet,
        removeSet,
        clearHistory,
        getWorkoutStats,
        loadAIWorkout,
        removeExercise,
        deleteWorkout,
        getExerciseProgression: getExerciseProgressionWrapper
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};
