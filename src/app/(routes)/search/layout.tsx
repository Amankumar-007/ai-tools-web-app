import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Search - Find AI Tools, News & Images',
  description: 'Search the web, news and images with TomatoAi AI-powered search. Find the best AI tools for your work and get the latest updates instantly.',
  keywords: ['AI search engine', 'AI web search', 'find AI tools', 'rank AI tools', 'AI news search', 'TomatoAi search'],
  path: '/search',
  // Internal search-results pages are query-dependent and have no standalone
  // content, so Google's own guidance is to keep them out of the index.
  noIndex: true,
})

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
