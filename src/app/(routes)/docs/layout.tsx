import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Documentation - How TomatoAi Works',
  description: 'Learn how TomatoAi works: core features, supported AI models, security and data handling, and how to get the most out of the AI tools directory and assistant.',
  keywords: ['TomatoAi docs', 'TomatoAi documentation', 'how TomatoAi works', 'AI tools directory guide'],
  path: '/docs',
})

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children
}
