
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

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
        const { prompt, context } = await req.json()

        // 2. Validate User Session (Optional but recommended)
        // Here we can use the Authorization header to verify the user
        const authHeader = req.headers.get('Authorization')!
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Get user from token
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 3. Call OpenAI API
        const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openAiApiKey) {
            throw new Error('Missing OPENAI_API_KEY environment variable')
        }

        const systemPrompt = `
      Você é o "Treinador Monstro", um assistente de musculação motivador, experiente e direto.
      Seu estilo é "bodybuilder raiz" (usa gírias como "shape", "esmagar", "frango", "monstro", "fibra"), mas sempre com embasamento técnico correto.
      Você ajuda o usuário a ajustar treinos, dá dicas de dieta (sem prescrever cardápio médico), e motiva a não desistir.
      Contexto do Usuário: ${JSON.stringify(context || {})}
    `

        const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Or 'gpt-3.5-turbo' for lower cost
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
            }),
        })

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
