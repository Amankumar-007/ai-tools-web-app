import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readJsonLimited } from '@/lib/security/body';

export const runtime = 'nodejs';

type AITool = {
  title: string;
  description: string;
  category: string;
  url: string;
  rating: number;
  type: 'free' | 'premium' | 'paid';
};

const MAX_QUERY = 200;
const MAX_TOOLS = 500;

const searchTools = (query: string, tools: AITool[]): AITool[] => {
  const queryLower = query.toLowerCase();
  return tools.filter(
    (tool) =>
      tool.title.toLowerCase().includes(queryLower) ||
      tool.description.toLowerCase().includes(queryLower) ||
      tool.category.toLowerCase().includes(queryLower)
  );
};

/** Public route: everything from the client is size-checked and type-checked before use. */
export async function POST(req: NextRequest) {
  const read = await readJsonLimited<{ query?: unknown; tools?: unknown }>(req, 64 * 1024);
  if (!read.ok) return NextResponse.json({ error: read.error }, { status: read.status });

  const body = read.data && typeof read.data === 'object' ? read.data : {};
  const query = typeof body.query === 'string' ? body.query.trim().slice(0, MAX_QUERY) : '';
  if (!query) return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  if (!Array.isArray(body.tools) || body.tools.length > MAX_TOOLS) {
    return NextResponse.json({ error: 'A list of up to 500 tools is required' }, { status: 400 });
  }

  const str = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : '');
  const tools: AITool[] = body.tools
    .filter((tool): tool is Record<string, unknown> => Boolean(tool) && typeof tool === 'object')
    .map((tool) => ({
      title: str(tool.title, 200),
      description: str(tool.description, 1000),
      category: str(tool.category, 100),
      url: str(tool.url, 500),
      rating: typeof tool.rating === 'number' ? tool.rating : 0,
      type: tool.type === 'premium' || tool.type === 'paid' ? tool.type : 'free',
    }));

  return NextResponse.json({ results: searchTools(query, tools) });
}
