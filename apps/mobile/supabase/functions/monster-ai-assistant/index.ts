
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Free-tier model via OpenRouter (no cost per token)
// Fallback chain: Llama 4 Maverick → DeepSeek V3 → Qwen3 235B
const FREE_MODEL = 'meta-llama/llama-4-maverick:free'

async function callOpenRouter(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    model: string = FREE_MODEL,
): Promise<string> {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://monsterlog.com.br',
            'X-Title': 'Monster Log Coach',
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.75,
            max_tokens: 800,
        }),
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`OpenRouter Error: ${err}`)
    }

    const data = await res.json()
    return data.choices[0].message.content
}

async function callOpenAI(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    jsonMode = false,
): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            response_format: jsonMode ? { type: 'json_object' } : undefined,
        }),
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`OpenAI Error: ${err}`)
    }

    const data = await res.json()
    return data.choices[0].message.content
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { prompt, context, action, muscleGroups, exerciseName, system, user_tier } = await req.json()

        // ── YouTube video search (no AI needed) ──────────────────────────────
        if (action === 'search_video') {
            const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
            if (!YOUTUBE_API_KEY) throw new Error('Missing YOUTUBE_API_KEY')

            const query = encodeURIComponent(`execução correta ${exerciseName} musculação`)
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`

            const ytResponse = await fetch(url)
            if (!ytResponse.ok) throw new Error(`YouTube API Error: ${await ytResponse.text()}`)

            const ytData = await ytResponse.json()
            if (!ytData.items || ytData.items.length === 0) {
                return new Response(JSON.stringify({ reply: { videos: [] } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            const videos = ytData.items.map((item: any) => ({
                title: item.snippet.title,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            }))

            return new Response(JSON.stringify({ reply: { videos } }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // ── Workout generation (always use GPT-4o — needs reliable JSON) ────
        if (action === 'generate_workout') {
            const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
            if (!openAiApiKey) throw new Error('Missing OPENAI_API_KEY')

            const instructions = muscleGroups.map((m: any) =>
                `${m.count} exercícios de ${m.name} com ${m.sets} séries cada`
            ).join(', e ')

            const systemPrompt = `
                Você é o Treinador Monstro. Crie um treino de musculação PESADO e sério.
                Retorne APENAS um JSON válido (sem markdown, sem explicações extras) com este formato exato:
                {
                    "name": "Nome do Treino",
                    "exercises": [
                        { "name": "Nome do Exercício", "sets": 4, "reps": "8-12", "weight": 0, "muscleGroup": "Músculo Alvo" }
                    ]
                }
                Gere EXATAMENTE: ${instructions}.
                Não invente exercícios extras.
                IMPORTANTE: Responda APENAS com o JSON.
            `

            const reply = await callOpenAI(openAiApiKey, systemPrompt, `Crie um treino: ${instructions}.`, true)
            return new Response(JSON.stringify({ reply }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // ── Coach chat ────────────────────────────────────────────────────────
        // Use the system prompt passed from the app (contains user context + persona)
        const systemPrompt = system ?? `
            Você é o "Treinador Monstro", um personal trainer virtual motivador, direto e técnico.
            Use linguagem brasileira informal. Emojis com moderação. Máximo 4 parágrafos.
            Contexto do Usuário: ${JSON.stringify(context || {})}
        `

        const isPro = user_tier === 'pro'

        if (isPro) {
            // Pro users → GPT-4o (best quality)
            const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
            if (!openAiApiKey) throw new Error('Missing OPENAI_API_KEY')
            const reply = await callOpenAI(openAiApiKey, systemPrompt, prompt)
            return new Response(JSON.stringify({ reply }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        } else {
            // Free users → OpenRouter free model (Llama 4 Maverick)
            const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
            if (!openRouterKey) {
                // Fallback to OpenAI if OpenRouter key not configured
                const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
                if (!openAiApiKey) throw new Error('Missing OPENROUTER_API_KEY and OPENAI_API_KEY')
                const reply = await callOpenAI(openAiApiKey, systemPrompt, prompt)
                return new Response(JSON.stringify({ reply }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
            const reply = await callOpenRouter(openRouterKey, systemPrompt, prompt)
            return new Response(JSON.stringify({ reply }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
