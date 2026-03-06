/**
 * SubscriptionContext — manages the user's current plan
 * Reads from Supabase `subscriptions` table; falls back to 'free' if absent.
 * Purchase flow: opens a hosted Stripe checkout URL, then re-checks on return.
 */
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { useAuth } from './AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Plan = 'free' | 'pro' | 'elite';

export interface Subscription {
  plan: Plan;
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  expiresAt: Date | null;
}

interface SubscriptionContextType {
  subscription: Subscription;
  isPro: boolean;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  openCheckout: (plan: 'pro' | 'elite', billing?: 'monthly' | 'annual') => Promise<void>;
  restorePurchase: () => Promise<void>;
  /** Dev-only: toggle pro for testing */
  devSetPro: (value: boolean) => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const FREE_SUBSCRIPTION: Subscription = { plan: 'free', status: 'active', expiresAt: null };

const DEV_KEY = '@monster_dev_pro';

// ─── Context ─────────────────────────────────────────────────────────────────

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>(FREE_SUBSCRIPTION);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!session?.user) {
      setSubscription(FREE_SUBSCRIPTION);
      setLoading(false);
      return;
    }

    // Dev override (for testing UI without real payment)
    const devPro = await AsyncStorage.getItem(DEV_KEY);
    if (devPro === 'true') {
      setSubscription({ plan: 'pro', status: 'active', expiresAt: null });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status, expires_at')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error || !data) {
        setSubscription(FREE_SUBSCRIPTION);
      } else {
        const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
        const isExpired = expiresAt ? expiresAt < new Date() : false;
        setSubscription({
          plan: isExpired ? 'free' : (data.plan as Plan),
          status: isExpired ? 'expired' : data.status,
          expiresAt,
        });
      }
    } catch {
      setSubscription(FREE_SUBSCRIPTION);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Re-check when app returns from background (user may have completed payment)
  useEffect(() => {
    const handler = () => checkSubscription();
    const sub = Linking.addEventListener('url', handler);
    return () => sub.remove();
  }, [checkSubscription]);

  const openCheckout = useCallback(async (_plan: 'pro' | 'elite', billing: 'monthly' | 'annual' = 'monthly') => {
    if (!session?.user) return;

    // Use supabase.functions.invoke so the user's JWT is sent automatically.
    // The server verifies identity from the JWT — user_id/email in body are not trusted.
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { billing },
    });

    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    if (data?.url) {
      await Linking.openURL(data.url);
    }
  }, [session]);

  const restorePurchase = useCallback(async () => {
    await checkSubscription();
  }, [checkSubscription]);

  const devSetPro = useCallback((value: boolean) => {
    AsyncStorage.setItem(DEV_KEY, value ? 'true' : 'false').then(() => checkSubscription());
  }, [checkSubscription]);

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      isPro: subscription.plan !== 'free',
      loading,
      checkSubscription,
      openCheckout,
      restorePurchase,
      devSetPro,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
