import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'
import JsonLd, { itemListStructuredData } from '@/components/JsonLd'
import { getAllTools } from '@/lib/tools'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Tools Directory - Best Artificial Intelligence Software',
  description: 'Explore a comprehensive directory of AI tools for productivity, creativity, automation, and more. Compare features, read reviews, and find the perfect AI assistant for your needs.',
  keywords: [
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
            url: `https://tomatoai.in/ai-tools/${tool.slug}`,
            description: tool.description,
          }))
        )}
      />
      {children}
    </>
  )
}
