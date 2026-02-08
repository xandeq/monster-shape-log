
import { supabase } from './supabase';

export interface AIResponse {
    reply?: string;
    error?: string;
}

export const askMonsterCoach = async (prompt: string, context: any = {}): Promise<string> => {
    try {
        const { data, error } = await supabase.functions.invoke('monster-ai-assistant', {
            body: { prompt, context },
        });

        if (error) {
            console.error('Monster Coach Error:', error);
            return "O monstro tá tirando um cochilo... Tente de novo mais tarde! (Erro na IA)";
        }

        return data?.reply || "Sem resposta do monstro.";
    } catch (err) {
        console.error('Monster Coach Exception:', err);
        return "Erro de conexão com o treinador.";
    }
};
