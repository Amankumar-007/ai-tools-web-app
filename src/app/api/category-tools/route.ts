import { NextResponse, type NextRequest } from 'next/server';
import { ALL_CATEGORIES } from '@/lib/categories';
import { getToolsForCategory } from '@/lib/categoryTools';
import { getFallbackTools } from '@/services/aiToolsDb';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let category: unknown;
  try {
    ({ category } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (typeof category !== 'string' || !category.trim()) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  const query = category.trim().toLowerCase();
  const catalog = getFallbackTools();
  const matchedCategory = ALL_CATEGORIES.find((item) =>
    item.slug === query || item.name.toLowerCase() === query
  );
  const tools = matchedCategory
    ? getToolsForCategory(matchedCategory.slug, catalog).tools
    : catalog.filter((tool) => `${tool.name} ${tool.category} ${tool.description}`.toLowerCase().includes(query));

  return NextResponse.json({ tools: tools.slice(0, 12), source: 'catalog' });
}
