
import { supabase } from '@/lib/supabase';

export const askMonsterCoach = async (
    prompt: string,
    context: any = {},
    // userTier is kept as param for API compatibility but is IGNORED by the server.
    // The edge function verifies the plan directly from the database.
    _userTier: 'free' | 'pro' = 'free',
): Promise<string> => {
    try {
        const coachSystem = context._isCoachChat
            ? `Você é o MONSTER COACH, personal trainer virtual especializado em hipertrofia, força e performance. Personalidade: direto, motivador, técnico. Use linguagem brasileira informal. Emojis com moderação. Máximo 4 parágrafos. Contexto do usuário: ${context.total_workouts ?? 0} treinos, ${context.total_volume_kg ?? 0}kg volume total, sequência de ${context.streak_days ?? 0} dias, ${context.this_week ?? 0} treinos esta semana. Último treino: "${context.last_workout_name ?? 'nenhum'}" (${context.last_workout_date ?? 'nunca'}) com ${context.last_workout_exercises ?? 'exercícios desconhecidos'}.`
            : undefined;

        const { data, error } = await supabase.functions.invoke('monster-ai-assistant', {
            body: { prompt, context, ...(coachSystem ? { system: coachSystem } : {}) }
        });

        if (error) {
            console.error('Monster Coach Supabase Error:', error);
            return `Erro na IA: O monstro está dormindo. (${error.message})`;
        }

        return data?.reply || "Sem resposta do monstro.";

    } catch (err) {
        console.error('Monster Coach Exception:', err);
        return "Erro de conexão com o treinador (Rede).";
    }
};

interface MusclePayload {
    name: string;
    count: number;
    sets: number;
}

export const generateWorkoutPlan = async (muscleGroups: MusclePayload[]): Promise<any> => {
    try {
        const { data, error } = await supabase.functions.invoke('monster-ai-assistant', {
            body: {
                action: 'generate_workout',
                muscleGroups,
            }
        });

        if (error) {
            throw new Error(`Supabase Function Error: ${error.message}`);
        }

        const workoutJson = JSON.parse(data.reply);
        return workoutJson;

    } catch (err) {
        console.error('Monster Coach Generator Exception:', err);
        throw err;
    }
};

export const searchExerciseVideo = async (exerciseName: string): Promise<{ title: string; url: string; thumbnail: string }[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('monster-ai-assistant', {
            body: {
                action: 'search_video',
                exerciseName,
            },
        });

        if (error) {
            console.error('Monster Coach Video Search Error:', error);
            throw new Error(`Supabase Function Error: ${error.message}`);
        }

        // The response returns { reply: JSON_STRING } or { reply: { videos: [...] } }
        let parsed = typeof data.reply === 'string' ? JSON.parse(data.reply) : data.reply;

        if (!Array.isArray(parsed) && parsed.videos) {
            parsed = parsed.videos;
        }

        return Array.isArray(parsed) ? parsed : [];

    } catch (err) {
        console.error('Monster Coach Video Search Exception:', err);
        return [];
    }
};
