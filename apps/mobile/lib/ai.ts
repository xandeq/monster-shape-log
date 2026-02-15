

import { supabase } from '@/lib/supabase';

export const askMonsterCoach = async (prompt: string, context: any = {}): Promise<string> => {
    try {
        console.log("Asking Monster Coach (via Supabase Invoke)...");

        const { data, error } = await supabase.functions.invoke('monster-ai-assistant', {
            body: { prompt, context }
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
        console.log(`Asking Monster Coach to generate workout for: ${JSON.stringify(muscleGroups)}...`);

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
        console.log(`Asking Monster Coach to find video for: ${exerciseName}...`);

        // DEBUG: Check what headers are potentially being sent
        const session = await supabase.auth.getSession();
        console.log("DEBUG: Access Token:", session.data.session?.access_token ? "Exists (Valid)" : "Missing");
        // console.log("DEBUG: Supabase Key used:", supabase['supabaseKey']); // Accessing internal property might differ based on version

        // Force using the Anon Key for Authorization to bypass any potential stale User Token issues
        // The edge function is public (for now) so this is safe for search.
        const { data, error } = await supabase.functions.invoke('monster-ai-assistant', {
            body: {
                action: 'search_video',
                exerciseName,
            },
            headers: {
                // Explicitly set authorization to the Anon Key
                Authorization: `Bearer ${supabase['supabaseKey'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYm1wenFod29remRyZGVudXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODUyNTIsImV4cCI6MjA4NjA2MTI1Mn0.qTTb00H865Ymt1qxYM3bYvdthgtMvKnYpwpDjS7hD1o'}`
            }
        });

        if (error) {
            console.error('Monster Coach Video Search Error:', error);
            throw new Error(`Supabase Function Error: ${error.message}`);
        }

        // The AI (or YouTube part) returns { reply: JSON_STRING }
        // The JSON_STRING might be an array OR an object { "videos": [...] }
        let parsed = typeof data.reply === 'string' ? JSON.parse(data.reply) : data.reply;

        // Handle case where it returns { videos: [...] }
        if (!Array.isArray(parsed) && parsed.videos) {
            parsed = parsed.videos;
        }

        return Array.isArray(parsed) ? parsed : [];

    } catch (err) {
        console.error('Monster Coach Video Search Exception:', err);
        return [];
    }
};
