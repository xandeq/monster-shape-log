
import { supabase } from '@/lib/supabase';

// Re-using interface from context for consistency, but good to have here
export interface ProgressionData {
    suggested_weight: number | null;
    suggested_reps: string;
    message: string;
    history_stats: {
        last_1rm: string;
        last_max_weight: number;
        volume: number;
        avg_1rm?: string; // New field for average comparison
    } | null;
}

export const getExerciseProgression = async (exerciseName: string): Promise<ProgressionData | null> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            console.log('No user session for progression check.');
            return null;
        }

        const { data, error } = await supabase.functions.invoke('calculate-progression', {
            body: { exercise_name: exerciseName }
        });

        if (error) {
            console.error('Supabase function error:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error fetching progression in lib/workout:", error);
        return null;
    }
};
