import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Find Best AI Content Generator - Write Articles & Copy',
  description: 'Find the best AI tool for content creation. Generate high-quality articles, marketing copy, and social media posts instantly with TomatoAi\'s AI content generator.',
  keywords: ['find best AI tool', 'AI content generator', 'AI writer', 'AI copywriting', 'content generation AI', 'AI article writer'],
  path: '/content-generator',
})

export default function ContentGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
