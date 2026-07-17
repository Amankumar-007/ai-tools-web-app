import { getAllTools } from '@/lib/tools';
import AIToolsDirectoryClient, { type Tool } from './AIToolsDirectoryClient';

const getLogoUrl = (url: string) => {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=example.com&sz=128`;
  }
};

// Server-rendered so the directory (the site's core content) is present in
// the initial HTML for crawlers/answer engines, instead of an empty shell
// that only fills in after a client-side fetch of ai-tools.json.
export default function AIToolsDirectory() {
  const tools: Tool[] = getAllTools().map((item, index) => ({
    id: index,
    slug: item.slug,
    name: item.name,
    category: item.category,
    description: item.description,
    website: item.website,
    logo: getLogoUrl(item.website),
    pricing: item.pricing as Tool['pricing'],
    rating: 4.5,
    speed: 'Fast',
    founded: '2020',
    pros: ['High quality output', 'User friendly'],
    cons: ['Learning curve required'],
    bestFor: 'General Purpose',
    apiAvailable: true,
  }));

  return <AIToolsDirectoryClient initialTools={tools} />;
}
