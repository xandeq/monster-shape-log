
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Free-tier model via OpenRouter (no cost per token)
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
        // ── Mandatory JWT authentication ──────────────────────────────────────
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing required server configuration')
        }

        const authHeader = req.headers.get('Authorization') ?? ''
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

        if (!token) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Verify user identity via JWT (service role required to call auth.getUser)
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // ── Fetch actual subscription from DB — NEVER trust client-supplied tier ─
        const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('plan, status, expires_at')
            .eq('user_id', user.id)
            .maybeSingle()

        const expiresAt = sub?.expires_at ? new Date(sub.expires_at) : null
        const isExpired = expiresAt ? expiresAt < new Date() : false
        const isPro = !isExpired
            && (sub?.plan === 'pro' || sub?.plan === 'elite')
            && sub?.status !== 'expired'
            && sub?.status !== 'cancelled'

        // ── Parse body (user_tier from body is intentionally ignored) ─────────
        const { prompt, context, action, muscleGroups, exerciseName, system } = await req.json()

        // Server-side prompt length guard
        if (prompt && prompt.length > 2000) {
            throw new Error('Prompt exceeds maximum length')
        }

        // ── YouTube video search (all authenticated users) ────────────────────
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

        // ── Workout generation (PRO only — uses GPT-4o for reliable JSON) ──────
        if (action === 'generate_workout') {
            if (!isPro) {
                return new Response(JSON.stringify({ error: 'Pro subscription required for workout generation' }), {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

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
        // user_tier from body is intentionally ignored — isPro is verified from DB above
        const systemPrompt = system ?? `
            Você é o "Treinador Monstro", um personal trainer virtual motivador, direto e técnico.
            Use linguagem brasileira informal. Emojis com moderação. Máximo 4 parágrafos.
            Contexto do Usuário: ${JSON.stringify(context || {})}
        `

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
