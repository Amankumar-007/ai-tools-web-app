import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Video Tutorials - ChatGPT, Midjourney & More',
  description: 'A curated library of AI video tutorials covering ChatGPT, Midjourney and the best AI tools, from complete beginner to advanced workflows.',
  keywords: ['AI video tutorials', 'ChatGPT tutorial', 'Midjourney guide', 'learn AI tools', 'find AI courses', 'AI tutorial videos'],
  path: '/ai-videos',
})

export default function AiVideosLayout({ children }: { children: React.ReactNode }) {
  return children
}
