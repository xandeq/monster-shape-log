import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    let result = 0
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    return result === 0
}

// Verify Stripe webhook signature using Web Crypto API
async function verifyStripeSignature(
    payload: string,
    signature: string,
    secret: string,
): Promise<boolean> {
    const parts = signature.split(',').reduce((acc: Record<string, string>, part) => {
        const [key, value] = part.split('=')
        acc[key] = value
        return acc
    }, {})

    const timestamp = parts['t']
    const sig = parts['v1']
    if (!timestamp || !sig) return false

    // Check timestamp is within 5 minutes to prevent replay attacks
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - parseInt(timestamp)) > 300) return false

    const signedPayload = `${timestamp}.${payload}`
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    )
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
    const expectedSig = Array.from(new Uint8Array(mac))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

    // Use constant-time comparison to prevent timing attacks
    return timingSafeEqual(expectedSig, sig)
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        // STRIPE_WEBHOOK_SECRET is mandatory — reject requests if not configured
        if (!STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
        }

        const body = await req.text()

        // Verify webhook signature — always required
        const signature = req.headers.get('stripe-signature')
        if (!signature) throw new Error('Missing stripe-signature header')
        const valid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET)
        if (!valid) throw new Error('Invalid webhook signature')

        const event = JSON.parse(body)
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const userId = session.client_reference_id || session.metadata?.user_id
                if (!userId) break

                const subscriptionId = session.subscription

                // Fetch subscription details from Stripe
                const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
                const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
                    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
                })
                const sub = await subRes.json()

                const status = sub.status === 'trialing' ? 'trialing' : 'active'
                const expiresAt = new Date(sub.current_period_end * 1000).toISOString()

                await supabase.from('subscriptions').upsert({
                    user_id: userId,
                    plan: 'pro',
                    status,
                    stripe_subscription_id: subscriptionId,
                    stripe_customer_id: sub.customer,
                    expires_at: expiresAt,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' })

                break
            }

            case 'customer.subscription.updated': {
                const sub = event.data.object
                const userId = sub.metadata?.user_id
                if (!userId) break

                const status = sub.cancel_at_period_end ? 'cancelled' : sub.status === 'trialing' ? 'trialing' : 'active'
                const expiresAt = new Date(sub.current_period_end * 1000).toISOString()

                await supabase.from('subscriptions').upsert({
                    user_id: userId,
                    plan: sub.status === 'active' || sub.status === 'trialing' ? 'pro' : 'free',
                    status,
                    stripe_subscription_id: sub.id,
                    stripe_customer_id: sub.customer,
                    expires_at: expiresAt,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' })

                break
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object
                const userId = sub.metadata?.user_id
                if (!userId) break

                await supabase.from('subscriptions').upsert({
                    user_id: userId,
                    plan: 'free',
                    status: 'expired',
                    stripe_subscription_id: sub.id,
                    stripe_customer_id: sub.customer,
                    expires_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' })

                break
            }

            case 'invoice.payment_succeeded': {
                // Renewal payment — extend subscription
                const invoice = event.data.object
                const subscriptionId = invoice.subscription
                if (!subscriptionId) break

                const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
                const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
                    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
                })
                const sub = await subRes.json()
                const userId = sub.metadata?.user_id
                if (!userId) break

                await supabase.from('subscriptions').upsert({
                    user_id: userId,
                    plan: 'pro',
                    status: 'active',
                    stripe_subscription_id: sub.id,
                    stripe_customer_id: sub.customer,
                    expires_at: new Date(sub.current_period_end * 1000).toISOString(),
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' })

                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object
                const subscriptionId = invoice.subscription
                if (!subscriptionId) break

                const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
                const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
                    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
                })
                const sub = await subRes.json()
                const userId = sub.metadata?.user_id
                if (!userId) break

                // Keep plan but mark as payment failed
                await supabase.from('subscriptions').upsert({
                    user_id: userId,
                    plan: 'pro',
                    status: 'cancelled',
                    stripe_subscription_id: sub.id,
                    stripe_customer_id: sub.customer,
                    expires_at: new Date(sub.current_period_end * 1000).toISOString(),
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' })

                break
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('Webhook error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
