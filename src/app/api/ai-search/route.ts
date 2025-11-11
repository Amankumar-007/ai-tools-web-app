import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

type AITool = {
  title: string;
  description: string;
  category: string;
  url: string;
  rating: number;
  type: 'free' | 'premium' | 'paid';
};

const searchTools = async (query: string, tools: AITool[]): Promise<AITool[]> => {
  // In a real implementation, you would use an AI model to understand the query
  // For now, we'll do a simple case-insensitive search
  const queryLower = query.toLowerCase();
  
  return tools.filter(tool => 
    tool.title.toLowerCase().includes(queryLower) ||
    tool.description.toLowerCase().includes(queryLower) ||
    tool.category.toLowerCase().includes(queryLower)
  );
};

export async function POST(req: NextRequest) {
  try {
    const { query, tools } = await req.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const results = await searchTools(query, tools);
    return NextResponse.json({ results });
    
  } catch (error) {
    console.error('AI Search error:', error);
    return NextResponse.json(
      { error: 'Failed to process search' },
      { status: 500 }
    );
  }
}
