import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

// Personal developer portfolio page, unrelated to the AI tools directory
// content - kept out of the index/sitemap to avoid diluting topical
// relevance of the main site.
export const metadata: Metadata = createPageMetadata({
  title: 'Portfolio',
  description: 'Developer portfolio.',
  path: '/portfolio',
  noIndex: true,
})

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children
}
