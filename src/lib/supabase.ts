import { createClient } from '@supabase/supabase-js';
import { effectivePlan, type PlanMetadata } from '@/lib/billing/plans';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a Supabase client for browser-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface for User data with subscription details
export interface User {
  id: string;
  email: string;
  subscription_tier: 'FREE' | 'PRO' | 'PREMIUM';
  subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  subscription_end_date?: string;
}

// Authentication helper functions
export const signUp = async (email: string, password: string, redirectTo?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;
    
    return {
      id: user.id,
      email: user.email!,
      // From app_metadata, which only the server (payment flow) can write. user_metadata is editable by the user.
      subscription_tier: effectivePlan(user.app_metadata as PlanMetadata).toUpperCase() as 'FREE' | 'PRO' | 'PREMIUM',
      subscription_status: (user.user_metadata?.subscription_status || 'active') as 'active' | 'canceled' | 'past_due' | 'unpaid',
      subscription_end_date: user.app_metadata?.plan_period_end ? new Date(Number(user.app_metadata.plan_period_end) * 1000).toISOString() : undefined,
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};
