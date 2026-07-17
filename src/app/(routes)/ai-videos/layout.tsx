import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Check Out Latest AI Video Tutorials - ChatGPT, Midjourney & More',
  description: 'Find the best AI tutorials and rank up your skills. A curated library of AI video tutorials covering ChatGPT, Midjourney, and the best AI tools, from beginner to advanced.',
  keywords: ['AI video tutorials', 'ChatGPT tutorial', 'Midjourney guide', 'learn AI tools', 'find AI courses', 'AI tutorial videos'],
  path: '/ai-videos',
})

export default function AiVideosLayout({ children }: { children: React.ReactNode }) {
  return children
}
