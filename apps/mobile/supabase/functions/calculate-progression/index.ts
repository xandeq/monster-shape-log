
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: req.headers.get("Authorization")! },
                },
            }
        );

        const { exercise_name } = await req.json();

        if (!exercise_name) {
            throw new Error("Nome do exercício é obrigatório com payload: { exercise_name: string }");
        }

        // 1. Get User
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Usuário não autenticado");
        }

        // 2. Fetch History (Last 5 workouts)
        const { data: exercisesData, error: exercisesError } = await supabase
            .from('workout_exercises')
            .select(`
            id,
            workout_id,
            name,
            created_at,
            workout_sets (
                id, weight, reps, completed
            ),
            workouts (
                date
            )
        `)
            .eq('user_id', user.id)
            .eq('name', exercise_name)
            .order('created_at', { ascending: false })
            .limit(5);

        if (exercisesError) throw exercisesError;

        if (!exercisesData || exercisesData.length === 0) {
            return new Response(
                JSON.stringify({
                    suggested_weight: null, // No history
                    suggested_reps: "8-12",
                    message: "Primeira vez? Esse é o começo da sua lenda. Escolha uma carga moderada para testar a forma.",
                    history_stats: null,
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const sortedHistory = exercisesData.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // 3. Analyze History
        // Helper to calculate 1RM for a session
        const getSession1RM = (session: any) => {
            const sets = session.workout_sets || [];
            const validSets = sets.filter((s: any) => s.completed && !isNaN(parseFloat(s.weight)) && !isNaN(parseFloat(s.reps)));
            if (validSets.length === 0) return 0;

            let max1RM = 0;
            validSets.forEach((s: any) => {
                const w = parseFloat(s.weight);
                const r = parseFloat(s.reps);
                const rm = w * (1 + r / 30);
                if (rm > max1RM) max1RM = rm;
            });
            return max1RM;
        };

        const lastSession = sortedHistory[0];
        const last1RM = getSession1RM(lastSession);
        const lastSets = lastSession.workout_sets || [];
        const validLastSets = lastSets.filter((s: any) => s.completed && !isNaN(parseFloat(s.weight)) && !isNaN(parseFloat(s.reps)));

        // Calculate Average 1RM of previous sessions (excluding last one)
        let totalPrev1RM = 0;
        let prevCount = 0;

        for (let i = 1; i < sortedHistory.length; i++) {
            const rm = getSession1RM(sortedHistory[i]);
            if (rm > 0) {
                totalPrev1RM += rm;
                prevCount++;
            }
        }

        const avgPrev1RM = prevCount > 0 ? totalPrev1RM / prevCount : 0;
        const performanceDrop = avgPrev1RM > 0 ? (last1RM - avgPrev1RM) / avgPrev1RM : 0;

        // Get statistics for display
        const weights = validLastSets.map((s: any) => parseFloat(s.weight));
        const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
        const totalVolume = validLastSets.reduce((acc: number, s: any) => acc + (parseFloat(s.weight) * parseFloat(s.reps)), 0);

        // Best set of last session for rep logic
        let bestSet = validLastSets[0] || { weight: 0, reps: 0 };
        let bestSet1RM = 0;
        validLastSets.forEach((s: any) => {
            const w = parseFloat(s.weight);
            const r = parseFloat(s.reps);
            const rm = w * (1 + r / 30);
            if (rm > bestSet1RM) {
                bestSet1RM = rm;
                bestSet = s;
            }
        });
        const bestSetReps = parseFloat(bestSet.reps);

        // Progression Logic
        let suggestedWeight = maxWeight;
        let message = "Mantenha a intensidade.";
        let suggestedReps = "8-12";

        // Target Reps Logic (Assuming standard hypertrophy range 8-12)
        const TARGET_REPS_MIN = 8;
        const TARGET_REPS_MAX = 12;

        if (performanceDrop < -0.10) {
            // DELOAD SUGGESTION: Drop > 10%
            suggestedWeight = maxWeight * 0.90;
            message = "Sua performance caiu um pouco. Vamos fazer um deload de 10% para recuperar.";
            suggestedReps = "8-12";
        } else if (bestSetReps >= TARGET_REPS_MAX) {
            // PROGRESSION: Hit target reps (upper bound)
            suggestedWeight = maxWeight + 2; // +2kg as per prompt
            message = "Progresso detectado! Aumente 2kg e destrua.";
            suggestedReps = "8-10";
        } else if (bestSetReps < TARGET_REPS_MIN) {
            // STALL/FAIL: keep weight
            suggestedWeight = maxWeight;
            message = "Mantenha a carga e foque em atingir as repetições alvo.";
            suggestedReps = `${TARGET_REPS_MIN}-${TARGET_REPS_MAX}`;
        } else {
            // MAINTENANCE: Inside range
            suggestedWeight = maxWeight;
            message = "Carga ajustada. Tente fazer mais uma repetição que no treino passado.";
            suggestedReps = `${TARGET_REPS_MIN}-${TARGET_REPS_MAX}`;
        }

        // formatting
        // Ensure weight is rounded nicely (e.g. to 0.5 or integer)
        suggestedWeight = Math.round(suggestedWeight * 2) / 2;

        return new Response(
            JSON.stringify({
                suggested_weight: suggestedWeight,
                suggested_reps: suggestedReps,
                message: message,
                history_stats: {
                    last_1rm: last1RM.toFixed(1),
                    avg_1rm: avgPrev1RM > 0 ? avgPrev1RM.toFixed(1) : null,
                    last_max_weight: maxWeight,
                    volume: totalVolume
                }
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
