import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

type CustomFeed = {title: string};
type CustomItem = {link: string, title: string, pubDate: string, contentSnippet: string, content: string, 'content:encoded': string};

const parser = new Parser<CustomFeed, CustomItem>({
  customFields: {
    item: ['content:encoded', 'content'],
  }
});

// Cache the route for 1 hour to prevent hitting the RSS feed too frequently
export const revalidate = 3600; 

export async function GET() {
  try {
    const feed = await parser.parseURL('https://techcrunch.com/category/artificial-intelligence/feed/');

    const items = feed.items.slice(0, 10).map((item, idx) => {
      // Try to extract an image from the content
      let imageUrl = null;
      const htmlContent = item['content:encoded'] || item.content || '';
      
      const imgMatch = htmlContent.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch && imgMatch[1]) {
        imageUrl = imgMatch[1];
      }

      // Default Unsplash fallbacks if no image found in RSS content
      const fallbacks = [
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"
      ];

      return {
        id: idx + 1,
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        source: 'TechCrunch AI',
        image: imageUrl || fallbacks[idx % fallbacks.length],
        snippet: item.contentSnippet,
        tag: 'News'
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('RSS Error:', error);
    return NextResponse.json({ error: 'Failed to fetch AI news' }, { status: 500 });
  }
}
