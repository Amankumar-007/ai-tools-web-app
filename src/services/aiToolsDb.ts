import { supabase } from '@/lib/supabase';
import { Tool } from '@/app/(routes)/ai-tools/AIToolsDirectoryClient';
import { getAllTools } from '@/lib/tools';
import { getBestLogoUrl, getLogoFallbackChain } from '@/lib/logoHelper';

// Explicit column list for fast queries (avoids fetching unused columns)
const TOOL_COLUMNS = 'id,slug,name,category,description,website,logo,pricing,rating,speed,founded,pros,cons,best_for,api_available,upvotes,trend_score,is_featured,is_verified,created_at';

export interface DbAiTool {
  id?: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  website: string;
  logo?: string;
  pricing: string;
  rating?: number;
  speed?: string;
  founded?: string;
  pros?: string[];
  cons?: string[];
  best_for?: string;
  api_available?: boolean;
  upvotes?: number;
  trend_score?: number;
  is_featured?: boolean;
  is_verified?: boolean;
  created_at?: string;
}

// Map Database row to Client Tool interface
export function mapDbToolToClient(dbTool: any, index: number): Tool {
  return {
    id: dbTool.id || index + 1,
    slug: dbTool.slug || dbTool.name.toLowerCase().replace(/\s+/g, '-'),
    name: dbTool.name,
    category: dbTool.category,
    description: dbTool.description || '',
    website: dbTool.website || '#',
    logo: dbTool.logo || getBestLogoUrl(dbTool.website || ''),
    pricing: (dbTool.pricing as Tool['pricing']) || 'Freemium',
    rating: dbTool.rating || 4.7,
    speed: (dbTool.speed as Tool['speed']) || 'Fast',
    founded: dbTool.founded || '2023',
    pros: Array.isArray(dbTool.pros) ? dbTool.pros : ['High performance', 'Intuitive interface'],
    cons: Array.isArray(dbTool.cons) ? dbTool.cons : ['Free tier usage limit'],
    bestFor: dbTool.best_for || dbTool.category,
    apiAvailable: dbTool.api_available ?? true,
    upvotes: dbTool.upvotes || 250,
    trendScore: dbTool.trend_score || 9500,
    isFeatured: !!dbTool.is_featured,
    isVerified: dbTool.is_verified ?? true,
  };
}

// Fetch ALL AI tools from Supabase with fallback to local JSON
export async function getAiToolsFromDb(): Promise<Tool[]> {
  try {
    // Race Supabase against a 2s timeout — never blocks the page
    const supabaseQuery = supabase
      .from('ai_tools')
      .select(TOOL_COLUMNS)
      .order('is_featured', { ascending: false })
      .order('upvotes', { ascending: false });

    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 2000)
    );

    const result = await Promise.race([supabaseQuery, timeout]);

    // If timeout won or Supabase returned error/empty data
    if (!result || 'data' in result === false) return getFallbackTools();
    const { data, error } = result as { data: any[] | null; error: any };

    if (error || !data || data.length === 0) {
      return getFallbackTools();
    }

    return data.map((t, idx) => mapDbToolToClient(t, idx));
  } catch (err) {
    console.warn('Supabase ai_tools fetch failed, using fallback dataset:', err);
    return getFallbackTools();
  }
}


// Fetch ONLY featured tools (fast — used for SSR first paint)
export async function getAiToolsFeatured(): Promise<Tool[]> {
  try {
    const { data, error } = await supabase
      .from('ai_tools')
      .select(TOOL_COLUMNS)
      .eq('is_featured', true)
      .order('upvotes', { ascending: false })
      .limit(4);

    if (error || !data || data.length === 0) {
      const fallback = getFallbackTools();
      return fallback.filter((t) => t.isFeatured).slice(0, 4);
    }

    return data.map((t, idx) => mapDbToolToClient(t, idx));
  } catch {
    const fallback = getFallbackTools();
    return fallback.filter((t) => t.isFeatured).slice(0, 4);
  }
}

// Paginated fetch for client-side lazy loading
export async function getAiToolsPaginated(
  page: number = 0,
  pageSize: number = 100
): Promise<{ tools: Tool[]; hasMore: boolean; total: number }> {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('ai_tools')
      .select(TOOL_COLUMNS, { count: 'exact' })
      .order('is_featured', { ascending: false })
      .order('upvotes', { ascending: false })
      .range(from, to);

    if (error || !data) {
      const fallback = getFallbackTools();
      return { tools: fallback.slice(from, to + 1), hasMore: to < fallback.length, total: fallback.length };
    }

    const total = count || 0;
    return {
      tools: data.map((t, idx) => mapDbToolToClient(t, from + idx)),
      hasMore: to < total - 1,
      total,
    };
  } catch {
    const fallback = getFallbackTools();
    return { tools: fallback, hasMore: false, total: fallback.length };
  }
}

// Update just the logo field for a single tool (saves resolved logo to DB)
export async function updateToolLogo(slug: string, logoUrl: string): Promise<void> {
  try {
    await supabase
      .from('ai_tools')
      .update({ logo: logoUrl })
      .eq('slug', slug);
  } catch {
    // silently fail — logo update is non-critical
  }
}

// Fallback dataset mapped from public JSON
export function getFallbackTools(): Tool[] {
  const localTools = getAllTools();
  return localTools.map((t, idx) => ({
    id: t.id || idx + 1,
    slug: t.slug,
    name: t.name,
    category: t.category,
    description: t.description,
    website: t.website,
    logo: getBestLogoUrl(t.website),
    pricing: (t.pricing as Tool['pricing']) || 'Freemium',
    rating: 0,
    speed: 'Fast' as const,
    founded: '',
    pros: [],
    cons: [],
    bestFor: t.category,
    apiAvailable: true,
    sourceDate: t.sourceDate,
    upvotes: 0,
    trendScore: 0,
    isFeatured: idx < 4,
    isVerified: Boolean(t.source),
  }));
}

// Insert or update tool in Supabase
export async function upsertToolToDb(tool: Partial<Tool>): Promise<{ data: any; error: any }> {
  try {
    const dbPayload = {
      slug: tool.slug || tool.name?.toLowerCase().replace(/\s+/g, '-'),
      name: tool.name,
      category: tool.category,
      description: tool.description,
      website: tool.website,
      logo: tool.logo || getBestLogoUrl(tool.website || ''),
      pricing: tool.pricing || 'Freemium',
      rating: tool.rating || 4.8,
      speed: tool.speed || 'Fast',
      founded: tool.founded || '2024',
      pros: tool.pros || ['Easy to use', 'High accuracy'],
      cons: tool.cons || ['API requires separate key'],
      best_for: tool.bestFor || tool.category,
      api_available: tool.apiAvailable ?? true,
      upvotes: tool.upvotes || 150,
      trend_score: tool.trendScore || 7000,
      is_featured: !!tool.isFeatured,
      is_verified: tool.isVerified ?? true,
    };

    const { data, error } = await supabase
      .from('ai_tools')
      .upsert(dbPayload, { onConflict: 'slug' })
      .select()
      .single();

    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

// Delete tool from Supabase
export async function deleteToolFromDb(slugOrId: string | number): Promise<{ success: boolean; error: any }> {
  try {
    let query = supabase.from('ai_tools').delete();
    if (typeof slugOrId === 'number') {
      query = query.eq('id', slugOrId);
    } else {
      query = query.eq('slug', slugOrId);
    }

    const { error } = await query;
    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err };
  }
}

// Sync all tools from local JSON to Supabase (with logo resolution)
export async function syncAllLocalToolsToSupabase(): Promise<{ count: number; error: any }> {
  try {
    const tools = getFallbackTools();
    const records = tools.map((t) => ({
      slug: t.slug,
      name: t.name,
      category: t.category,
      description: t.description,
      website: t.website,
      logo: t.logo || getBestLogoUrl(t.website),
      pricing: t.pricing,
      rating: t.rating,
      speed: t.speed,
      founded: t.founded,
      pros: t.pros,
      cons: t.cons,
      best_for: t.bestFor,
      api_available: t.apiAvailable,
      upvotes: t.upvotes,
      trend_score: t.trendScore,
      is_featured: t.isFeatured,
      is_verified: t.isVerified,
    }));

    const { data, error } = await supabase
      .from('ai_tools')
      .upsert(records, { onConflict: 'slug' });

    if (error) throw error;
    return { count: records.length, error: null };
  } catch (err) {
    return { count: 0, error: err };
  }
}

