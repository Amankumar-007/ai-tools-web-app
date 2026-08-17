import type { Metadata } from 'next'
import { createPageMetadata, SITE_URL } from '@/metadata-utils'
import JsonLd, { itemListStructuredData } from '@/components/JsonLd'
import { getAllTools } from '@/lib/tools'

export const metadata: Metadata = createPageMetadata({
  title: 'Find the Best AI Tool for Your Work',
  description: 'Search a curated directory of the best AI tools, organised by category, pricing and capability. Compare features and find the right one fast.',
  keywords: [
    'find best ai tool',
    'AI tools directory',
    'artificial intelligence software',
    'best AI tools',
    'AI productivity tools',
    'AI writing tools',
    'AI image generators',
    'AI video editors',
    'AI code assistants',
    'AI marketing tools',
    'AI automation tools',
    'machine learning tools',
    'AI software reviews',
    'ChatGPT alternatives',
    'AI assistants',
  ],
  path: '/ai-tools',
})

export default function AiToolsLayout({ children }: { children: React.ReactNode }) {
  // Kept small: this layout also wraps /ai-tools/[slug] and /ai-tools/analyze,
  // so a large embedded list here would repeat on every tool detail page.
  const tools = getAllTools().slice(0, 20)

  return (
    <>
      <JsonLd
        data={itemListStructuredData(
          tools.map((tool) => ({
            name: tool.name,
            url: `${SITE_URL}/ai-tools/${tool.slug}`,
            description: tool.description,
          }))
        )}
      />
      {children}
    </>
  )
}
