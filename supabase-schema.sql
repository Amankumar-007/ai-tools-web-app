-- =========================================================
-- Tomato AI Tools Database Schema for Supabase
-- =========================================================

-- 1. Create the ai_tools table
CREATE TABLE IF NOT EXISTS public.ai_tools (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  website TEXT NOT NULL,
  logo TEXT,
  pricing TEXT DEFAULT 'Freemium',
  rating NUMERIC(3, 2) DEFAULT 4.8,
  speed TEXT DEFAULT 'Fast',
  founded TEXT DEFAULT '2023',
  pros TEXT[] DEFAULT ARRAY['High quality results', 'Fast processing'],
  cons TEXT[] DEFAULT ARRAY['Free plan limitations'],
  best_for TEXT,
  api_available BOOLEAN DEFAULT true,
  upvotes INTEGER DEFAULT 100,
  trend_score INTEGER DEFAULT 5000,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for fast lookup by category, slug, and search
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON public.ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_slug ON public.ai_tools(slug);
CREATE INDEX IF NOT EXISTS idx_ai_tools_upvotes ON public.ai_tools(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tools_pricing ON public.ai_tools(pricing);

-- 3. Row Level Security (RLS) policies
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all AI tools
CREATE POLICY "Allow public read-only access to ai_tools"
  ON public.ai_tools
  FOR SELECT
  USING (true);

-- Allow authenticated / service role insert and update
CREATE POLICY "Allow full access for authenticated users"
  ON public.ai_tools
  FOR ALL
  USING (true)
  WITH CHECK (true);
