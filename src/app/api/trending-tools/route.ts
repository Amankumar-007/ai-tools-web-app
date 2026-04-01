import { NextResponse } from 'next/server';

const BASE_TOOLS = [
  { id: 'deepseek', name: 'DeepSeek R1', category: 'Dev', website: 'deepseek.com', description: "Open-source reasoning model." },
  { id: 'lovable', name: 'Lovable', category: 'Dev', website: 'lovable.dev', description: "Generative UI builder." },
  { id: 'sora', name: 'Sora', category: 'Creative', website: 'openai.com', description: "AI video generation." },
  { id: 'perplexity', name: 'Perplexity', category: 'Productivity', website: 'perplexity.ai', description: "Real-time search engine." },
  { id: 'cursor', name: 'Cursor', category: 'Dev', website: 'cursor.com', description: "The AI-first code editor." },
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'Creative', website: 'elevenlabs.io', description: "AI voice and sound." },
  { id: 'claude', name: 'Claude 3.5 Sonnet', category: 'Productivity', website: 'anthropic.com', description: "Fastest and smartest conversational AI." },
  { id: 'midjourney', name: 'Midjourney', category: 'Creative', website: 'midjourney.com', description: "Photorealistic AI art generator." },
  { id: 'bolt', name: 'Bolt.new', category: 'Dev', website: 'bolt.new', description: "Browser-based AI full-stack editor." },
  { id: 'v0', name: 'v0 by Vercel', category: 'Dev', website: 'v0.dev', description: "Generative UI components framework." }
];

export async function GET() {
  try {
    // Rotate baseline scores daily by using current Date as seed
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Assign pseudorandom ranks and metrics so they change each day but stay stable within the day.
    const tools = BASE_TOOLS.map((tool) => {
      // Pseudo-random generation based on tool ID length + seed
      const pseudoRandomHash = (tool.id.length * seed + tool.name.charCodeAt(0) * 11) % 1000;
      
      const trendScore = 80 + (pseudoRandomHash % 20); // 80 to 99
      const utilityScore = 70 + ((pseudoRandomHash * 2) % 30); // 70 to 99
      const growth = `+${100 + (pseudoRandomHash % 900)}%`; // +100% to +1000%
      
      const graphData = Array.from({length: 7}, (_, i) => {
        return 40 + (((pseudoRandomHash * (i+1)) % 60));
      });

      return {
        ...tool,
        trendScore,
        utilityScore,
        growth,
        graphData
      };
    }).sort((a, b) => b.trendScore - a.trendScore);

    return NextResponse.json({ tools });
  } catch (error) {
    console.error('Failed to generate trending tools:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}
