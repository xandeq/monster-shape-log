import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICE_IDS: Record<string, string> = {
    'pro_monthly': 'price_1T7mEwCA1CPHCF6PUokZtK9j',
    'pro_annual': 'price_1T7mEwCA1CPHCF6PZnig2gf0',
}

Deno.serve(async (req) => {
    // Handle GET redirects from Stripe success/cancel (no auth needed — browser redirect)
    if (req.method === 'GET') {
        const url = new URL(req.url)
        const status = url.searchParams.get('status')
        const html = status === 'success'
            ? '<html><body style="background:#050510;color:#00FF88;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column"><h1>✅ Assinatura confirmada!</h1><p>Volte para o Monster Log</p></body></html>'
            : '<html><body style="background:#050510;color:#FF0066;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column"><h1>❌ Checkout cancelado</h1><p>Volte para o Monster Log</p></body></html>'
        return new Response(html, { headers: { 'Content-Type': 'text/html' } })
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // ── Mandatory JWT authentication ──────────────────────────────────────
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing required server configuration')
        }
        if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY')

        const authHeader = req.headers.get('Authorization') ?? ''
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

        if (!token) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Verify JWT and extract user identity — do NOT trust user_id from body
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Use identity from verified JWT — ignore any user_id/email in request body
        const userId = user.id
        const email = user.email

        if (!email) {
            throw new Error('User account has no email address')
        }

        const { billing } = await req.json()

        const priceKey = billing === 'annual' ? 'pro_annual' : 'pro_monthly'
        const priceId = PRICE_IDS[priceKey]
        if (!priceId) throw new Error(`Invalid billing period: ${billing}`)

        // Create Stripe Checkout Session
        const params = new URLSearchParams()
        params.append('mode', 'subscription')
        params.append('payment_method_types[]', 'card')
        params.append('line_items[0][price]', priceId)
        params.append('line_items[0][quantity]', '1')
        params.append('customer_email', email)
        params.append('client_reference_id', userId)
        params.append('metadata[user_id]', userId)
        params.append('metadata[plan]', 'pro')
        params.append('metadata[billing]', billing ?? 'monthly')
        params.append('subscription_data[trial_period_days]', '7')
        params.append('subscription_data[metadata][user_id]', userId)
        params.append('success_url', 'https://gdbmpzqhwokzdrdenupg.supabase.co/functions/v1/stripe-checkout?status=success')
        params.append('cancel_url', 'https://gdbmpzqhwokzdrdenupg.supabase.co/functions/v1/stripe-checkout?status=cancel')

        const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        })

        if (!stripeRes.ok) {
            const err = await stripeRes.text()
            throw new Error(`Stripe Error: ${err}`)
        }

        const session = await stripeRes.json()

        return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
