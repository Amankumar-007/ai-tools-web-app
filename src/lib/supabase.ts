import { createClient } from '@supabase/supabase-js';

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
  stripe_customer_id?: string;
  subscription_end_date?: string;
}

// Authentication helper functions
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
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
      subscription_tier: (user.user_metadata?.subscription_tier || 'FREE') as 'FREE' | 'PRO' | 'PREMIUM',
      subscription_status: (user.user_metadata?.subscription_status || 'active') as 'active' | 'canceled' | 'past_due' | 'unpaid',
      stripe_customer_id: user.user_metadata?.stripe_customer_id,
      subscription_end_date: user.user_metadata?.subscription_end_date,
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

// Subscription management functions
export const updateUserSubscription = async (userId: string, subscriptionData: {
  subscription_tier: string;
  subscription_status: string;
  stripe_customer_id?: string;
  subscription_end_date?: string;
}) => {
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { ...subscriptionData }
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

export const createSubscriptionRecord = async (subscriptionData: {
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  price_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating subscription record:', error);
    throw error;
  }
};
