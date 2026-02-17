
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Get the prompt from the request body
        // muscleGroups is now expected to be: [{ name: 'Peito', count: 3, sets: 4 }, ...]
        const { prompt, context, action, muscleGroups, exerciseName } = await req.json()

        // 2. Auth bypassed for debugging/development as requested
        // In production, uncomment the auth verification logic.

        if (action === 'search_video') {
            const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
            if (!YOUTUBE_API_KEY) {
                throw new Error('Missing YOUTUBE_API_KEY environment variable');
            }

            // Construct the YouTube Data API search query
            const query = encodeURIComponent(`execução correta ${exerciseName} musculação`);
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`;

            console.log(`Searching YouTube for: ${exerciseName}`);

            const ytResponse = await fetch(url);

            if (!ytResponse.ok) {
                const errorText = await ytResponse.text();
                throw new Error(`YouTube API Error: ${errorText}`);
            }

            const ytData = await ytResponse.json();

            if (!ytData.items || ytData.items.length === 0) {
                // Fallback if no videos found
                return new Response(JSON.stringify({ reply: { videos: [] } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // Map the results to our generic video format
            const videos = ytData.items.map((item: any) => ({
                title: item.snippet.title,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url
            }));

            // Return the videos directly
            return new Response(JSON.stringify({ reply: { videos } }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ... Logic for other actions continues below ...

        const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openAiApiKey) {
            throw new Error('Missing OPENAI_API_KEY environment variable')
        }

        let systemPrompt = ""
        let userMessage = ""
        let isJsonMode = false

        if (action === 'generate_workout') {
            isJsonMode = true

            // Build a specific instruction for each muscle group
            const instructions = muscleGroups.map((m: any) =>
                `${m.count} exercícios de ${m.name} com ${m.sets} séries cada`
            ).join(', e ');

            systemPrompt = `
                Você é o Treinador Monstro. Crie um treino de musculação PESADO e sério.
                Retorne APENAS um JSON válido (sem markdown, sem explicações extras) com este formato exato:
                {
                    "name": "Nome do Treino",
                    "exercises": [
                        { "name": "Nome do Exercício", "sets": 4, "reps": "8-12", "weight": 0, "muscleGroup": "Músculo Alvo" }
                    ]
                }

                Instruções Fatais:
                Gere EXATAMENTE: ${instructions}.
                Não invente exercícios extras.
                IMPORTANTE: Responda APENAS com o JSON.
            `
            userMessage = `Crie um treino seguindo a estrutura: ${instructions}.`
        } else {
            systemPrompt = `
                Você é o "Treinador Monstro", um assistente de musculação motivador, experiente e direto.
                Seu estilo é "bodybuilder raiz" (usa gírias como "shape", "esmagar", "frango", "monstro", "fibra"), mas sempre com embasamento técnico correto.
                Você ajuda o usuário a ajustar treinos, dá dicas de dieta (sem prescrever cardápio médico), e motiva a não desistir.
                Contexto do Usuário: ${JSON.stringify(context || {})}
            `
            userMessage = prompt
        }

        const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                response_format: isJsonMode ? { type: "json_object" } : undefined
            }),
        })

        if (!openAiResponse.ok) {
            const err = await openAiResponse.text()
            throw new Error(`OpenAI API Error: ${err}`)
        }

        const data = await openAiResponse.json()
        const reply = data.choices[0].message.content

        // 4. Return the response
        return new Response(JSON.stringify({ reply }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
