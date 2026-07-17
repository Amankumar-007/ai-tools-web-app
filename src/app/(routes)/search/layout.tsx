import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Search All Best AI Tools and News - Rank & Find Results',
  description: 'Search the web, news, and images with TomatoAi\'s AI-powered search. Find the best AI tools, rank them according to your needs, and get the latest updates instantly.',
  keywords: ['AI search engine', 'AI web search', 'find AI tools', 'rank AI tools', 'AI news search', 'TomatoAi search'],
  path: '/search',
})

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
