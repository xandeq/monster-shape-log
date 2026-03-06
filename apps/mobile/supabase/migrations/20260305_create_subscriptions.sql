-- Create subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan text NOT NULL DEFAULT 'free',
    status text NOT NULL DEFAULT 'active',
    stripe_subscription_id text,
    stripe_customer_id text,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own subscription' AND tablename = 'subscriptions'
    ) THEN
        CREATE POLICY "Users can read own subscription"
            ON subscriptions FOR SELECT
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Service role has full access (for webhook updates)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access' AND tablename = 'subscriptions'
    ) THEN
        CREATE POLICY "Service role full access"
            ON subscriptions FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END $$;
