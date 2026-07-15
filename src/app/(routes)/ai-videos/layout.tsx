import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Video Tutorials - Learn ChatGPT, Midjourney & More',
  description: 'A curated library of AI video tutorials and courses covering ChatGPT, Midjourney, and the best AI tools, from beginner basics to advanced techniques.',
  keywords: ['AI video tutorials', 'ChatGPT tutorial', 'Midjourney guide', 'learn AI tools', 'AI courses', 'AI tutorial videos'],
  path: '/ai-videos',
})

export default function AiVideosLayout({ children }: { children: React.ReactNode }) {
  return children
}
