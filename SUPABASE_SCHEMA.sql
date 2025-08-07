-- =====================================================
-- SUPABASE SCHEMA FOR AI TOOLS SUBSCRIPTION SYSTEM
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'FREE' CHECK (subscription_tier IN ('FREE', 'PRO', 'PREMIUM')),
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table for detailed subscription records
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    stripe_price_id TEXT NOT NULL,
    subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('PRO', 'PREMIUM')),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    tool_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON public.users(stripe_subscription_id);

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON public.subscriptions(subscription_tier);

-- Usage logs indexes
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tool_name ON public.usage_logs(tool_name);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update user subscription data
CREATE OR REPLACE FUNCTION update_user_subscription(
    p_user_id UUID,
    p_subscription_tier TEXT,
    p_subscription_status TEXT,
    p_stripe_customer_id TEXT DEFAULT NULL,
    p_stripe_subscription_id TEXT DEFAULT NULL,
    p_current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET 
        subscription_tier = p_subscription_tier,
        subscription_status = p_subscription_status,
        stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
        stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
        current_period_start = p_current_period_start,
        current_period_end = p_current_period_end,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create subscription record
CREATE OR REPLACE FUNCTION create_subscription_record(
    p_user_id UUID,
    p_stripe_subscription_id TEXT,
    p_stripe_customer_id TEXT,
    p_stripe_price_id TEXT,
    p_subscription_tier TEXT,
    p_status TEXT,
    p_current_period_start TIMESTAMP WITH TIME ZONE,
    p_current_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
    subscription_id UUID;
BEGIN
    INSERT INTO public.subscriptions (
        user_id,
        stripe_subscription_id,
        stripe_customer_id,
        stripe_price_id,
        subscription_tier,
        status,
        current_period_start,
        current_period_end
    ) VALUES (
        p_user_id,
        p_stripe_subscription_id,
        p_stripe_customer_id,
        p_stripe_price_id,
        p_subscription_tier,
        p_status,
        p_current_period_start,
        p_current_period_end
    ) RETURNING id INTO subscription_id;
    
    RETURN subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription record
CREATE OR REPLACE FUNCTION update_subscription_record(
    p_stripe_subscription_id TEXT,
    p_status TEXT,
    p_current_period_start TIMESTAMP WITH TIME ZONE,
    p_current_period_end TIMESTAMP WITH TIME ZONE,
    p_cancel_at_period_end BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.subscriptions 
    SET 
        status = p_status,
        current_period_start = p_current_period_start,
        current_period_end = p_current_period_end,
        cancel_at_period_end = p_cancel_at_period_end,
        updated_at = NOW()
    WHERE stripe_subscription_id = p_stripe_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log usage
CREATE OR REPLACE FUNCTION log_usage(
    p_user_id UUID,
    p_tool_name TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.usage_logs (user_id, tool_name)
    VALUES (p_user_id, p_tool_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current usage for a tool
CREATE OR REPLACE FUNCTION get_user_tool_usage(
    p_user_id UUID,
    p_tool_name TEXT,
    p_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '1 day'
)
RETURNS INTEGER AS $$
DECLARE
    usage_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(usage_count), 0) INTO usage_count
    FROM public.usage_logs
    WHERE user_id = p_user_id 
    AND tool_name = p_tool_name
    AND created_at >= p_period_start;
    
    RETURN usage_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access a tool
CREATE OR REPLACE FUNCTION can_access_tool(
    p_user_id UUID,
    p_tool_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier TEXT;
    user_status TEXT;
    usage_count INTEGER;
    tier_limit INTEGER;
BEGIN
    -- Get user's subscription info
    SELECT subscription_tier, subscription_status 
    INTO user_tier, user_status
    FROM public.users 
    WHERE id = p_user_id;
    
    -- Check if subscription is active
    IF user_status != 'active' AND user_status != 'trialing' THEN
        RETURN FALSE;
    END IF;
    
    -- Set usage limits based on tier
    CASE user_tier
        WHEN 'FREE' THEN tier_limit := 5;
        WHEN 'PRO' THEN tier_limit := -1; -- Unlimited
        WHEN 'PREMIUM' THEN tier_limit := -1; -- Unlimited
        ELSE tier_limit := 0;
    END CASE;
    
    -- If unlimited, allow access
    IF tier_limit = -1 THEN
        RETURN TRUE;
    END IF;
    
    -- Check current usage
    usage_count := get_user_tool_usage(p_user_id, p_tool_name);
    
    RETURN usage_count < tier_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON public.subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Subscriptions table policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Usage logs table policies
CREATE POLICY "Users can view own usage" ON public.usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all usage" ON public.usage_logs
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample user (replace with your actual user ID)
-- INSERT INTO public.users (id, email, subscription_tier, subscription_status)
-- VALUES (
--     'your-user-id-here',
--     'test@example.com',
--     'FREE',
--     'inactive'
-- );

-- =====================================================
-- VIEWS (Optional - for easier querying)
-- =====================================================

-- View for user subscription summary
CREATE OR REPLACE VIEW user_subscription_summary AS
SELECT 
    u.id,
    u.email,
    u.subscription_tier,
    u.subscription_status,
    u.stripe_customer_id,
    u.current_period_start,
    u.current_period_end,
    s.stripe_subscription_id,
    s.stripe_price_id,
    s.cancel_at_period_end
FROM public.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id AND s.status = 'active';

-- View for usage statistics
CREATE OR REPLACE VIEW user_usage_stats AS
SELECT 
    u.id,
    u.email,
    u.subscription_tier,
    ul.tool_name,
    COUNT(ul.id) as usage_count,
    MAX(ul.created_at) as last_used
FROM public.users u
LEFT JOIN public.usage_logs ul ON u.id = ul.user_id
GROUP BY u.id, u.email, u.subscription_tier, ul.tool_name;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.users IS 'Extended user profiles with subscription information';
COMMENT ON TABLE public.subscriptions IS 'Detailed subscription records from Stripe';
COMMENT ON TABLE public.usage_logs IS 'Tool usage tracking for limits and analytics';

COMMENT ON FUNCTION update_user_subscription IS 'Updates user subscription data from webhooks';
COMMENT ON FUNCTION create_subscription_record IS 'Creates a new subscription record';
COMMENT ON FUNCTION update_subscription_record IS 'Updates subscription record from webhooks';
COMMENT ON FUNCTION log_usage IS 'Logs tool usage for a user';
COMMENT ON FUNCTION get_user_tool_usage IS 'Gets user usage count for a specific tool';
COMMENT ON FUNCTION can_access_tool IS 'Checks if user can access a specific tool based on tier and usage';

-- =====================================================
-- SETUP INSTRUCTIONS
-- =====================================================

/*
TO SET UP THIS SCHEMA:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste this entire file
4. Click "Run" to execute

OR run these commands in sequence:

1. Run the TABLES section
2. Run the INDEXES section  
3. Run the FUNCTIONS section
4. Run the TRIGGERS section
5. Run the RLS section
6. Run the VIEWS section (optional)

AFTER SETUP:

1. Update your .env.local with Supabase credentials:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

2. Test the connection in your app

3. The webhook handlers will automatically create/update user records
*/ 