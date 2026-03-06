import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICE_IDS: Record<string, string> = {
    'pro_monthly': 'price_1T7mEwCA1CPHCF6PUokZtK9j',
    'pro_annual': 'price_1T7mEwCA1CPHCF6PZnig2gf0',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
        if (!STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY')

        const { plan, billing, user_id, email } = await req.json()

        if (!user_id || !email) {
            throw new Error('user_id and email are required')
        }

        const priceKey = billing === 'annual' ? 'pro_annual' : 'pro_monthly'
        const priceId = PRICE_IDS[priceKey]
        if (!priceId) throw new Error(`Invalid plan/billing: ${plan}/${billing}`)

        // Create Stripe Checkout Session via REST API (no SDK needed in Deno)
        const params = new URLSearchParams()
        params.append('mode', 'subscription')
        params.append('payment_method_types[]', 'card')
        params.append('line_items[0][price]', priceId)
        params.append('line_items[0][quantity]', '1')
        params.append('customer_email', email)
        params.append('client_reference_id', user_id)
        params.append('metadata[user_id]', user_id)
        params.append('metadata[plan]', 'pro')
        params.append('metadata[billing]', billing)
        params.append('subscription_data[trial_period_days]', '7')
        params.append('subscription_data[metadata][user_id]', user_id)
        // Success/cancel URLs — Stripe requires these but we redirect back to app
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
        // Handle GET redirects from Stripe success/cancel
        if (req.method === 'GET') {
            const url = new URL(req.url)
            const status = url.searchParams.get('status')
            const html = status === 'success'
                ? '<html><body style="background:#050510;color:#00FF88;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column"><h1>✅ Assinatura confirmada!</h1><p>Volte para o Monster Log</p></body></html>'
                : '<html><body style="background:#050510;color:#FF0066;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column"><h1>❌ Checkout cancelado</h1><p>Volte para o Monster Log</p></body></html>'
            return new Response(html, {
                headers: { 'Content-Type': 'text/html' },
            })
        }

        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
