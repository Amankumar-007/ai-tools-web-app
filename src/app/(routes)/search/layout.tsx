import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'AI-Powered Search - Web, News & Image Results',
  description: 'Search the web, news, and images with TomatoAi\'s AI-powered search, built to help you find AI tools and information faster.',
  keywords: ['AI search engine', 'AI web search', 'AI news search', 'TomatoAi search'],
  path: '/search',
})

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
