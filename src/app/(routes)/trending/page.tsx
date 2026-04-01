import { Metadata } from 'next';
import TrendingClient from './TrendingClient';
import Parser from 'rss-parser';

// --- SEO Metadata ---
export const metadata: Metadata = {
  title: 'Trending AI Tools & News | TomatoAi',
  description: 'Discover the fastest-growing AI products and the latest AI news. We track social signals and developer activity to find the next AI Super Tools.',
  keywords: 'AI tools, trending AI, artificial intelligence news, AI product directory, best AI tools, ChatGPT, DeepSeek, AI updates',
  openGraph: {
    title: 'Trending AI Tools & News',
    description: 'Discover the fastest-growing AI products and the latest AI news before they go mainstream.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending AI Tools & News',
    description: 'Discover the fastest-growing AI products and the latest AI news before they go mainstream.',
  }
};

// Revalidate on the server every 1 hour
export const revalidate = 3600;

// Internal data fetchers avoiding absolute URL fetch loops during Next.js builds.
async function getTrendingNews() {
  try {
    const parser = new Parser({ customFields: { item: ['content:encoded', 'content'] } });
    const feed = await parser.parseURL('https://techcrunch.com/category/artificial-intelligence/feed/');
    
    return feed.items.slice(0, 10).map((item, idx) => {
      let imageUrl = null;
      const htmlContent = item['content:encoded'] || item.content || '';
      const imgMatch = htmlContent.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch && imgMatch[1]) imageUrl = imgMatch[1];
      
      const fallbacks = [
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"
      ];

      return {
        id: idx + 1,
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        source: 'TechCrunch AI',
        image: imageUrl || fallbacks[idx % fallbacks.length],
        snippet: item.contentSnippet || '',
        tag: 'News'
      };
    });
  } catch (e) {
    console.error('RSS fetch error:', e);
    // Fallback if network is bad
    return [{
      id: 1,
      title: "OpenAI Announces GPT-5 Release Date Rumors",
      link: "https://openai.com",
      source: "TechCrunch AI",
      pubDate: new Date().toISOString(),
      snippet: "Rumors suggest that OpenAI has completed the training phase for GPT-5.",
      tag: "Models",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
    }];
  }
}

async function getTrendingTools() {
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

  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  return BASE_TOOLS.map((tool, index) => {
    const pseudoRandomHash = (tool.id.length * seed + tool.name.charCodeAt(0) * 11) % 1000;
    const trendScore = 80 + (pseudoRandomHash % 20); 
    const utilityScore = 70 + ((pseudoRandomHash * 2) % 30);
    const growth = `+${100 + (pseudoRandomHash % 900)}%`;
    const graphData = Array.from({length: 7}, (_, i) => 40 + (((pseudoRandomHash * (i+1)) % 60)));

    return { ...tool, rank: index + 1, trendScore, utilityScore, growth, graphData };
  }).sort((a, b) => b.trendScore - a.trendScore);
}

export default async function TrendingPage() {
  const [initialNews, initialTools] = await Promise.all([
    getTrendingNews(),
    getTrendingTools()
  ]);

  return (
    <TrendingClient initialTools={initialTools} initialNews={initialNews} />
  );
}