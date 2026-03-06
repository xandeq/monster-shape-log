import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '@/context/WorkoutContext';

const TEMPLATES_KEY = '@monster_templates_v1';

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Array<{ name: string; defaultSets: number }>;
  createdAt: string;
}

export const getTemplates = async (): Promise<WorkoutTemplate[]> => {
  try {
    const raw = await AsyncStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveTemplate = async (name: string, exercises: Exercise[]): Promise<void> => {
  const templates = await getTemplates();
  const template: WorkoutTemplate = {
    id: Date.now().toString(),
    name: name.trim() || 'Template',
    exercises: exercises.map(e => ({ name: e.name, defaultSets: e.sets.length })),
    createdAt: new Date().toISOString(),
  };
  templates.unshift(template);
  await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const templates = await getTemplates();
  await AsyncStorage.setItem(
    TEMPLATES_KEY,
    JSON.stringify(templates.filter(t => t.id !== id)),
  );
};

/** Convert a template to Exercise[] ready to load into workout */
export const templateToExercises = (template: WorkoutTemplate): Exercise[] =>
  template.exercises.map((ex, ei) => ({
    id: `${Date.now()}_${ei}`,
    name: ex.name,
    sets: Array.from({ length: ex.defaultSets }, (_, si) => ({
      id: `${Date.now()}_${ei}_${si}`,
      weight: '',
      reps: '',
      completed: false,
    })),
  }));
