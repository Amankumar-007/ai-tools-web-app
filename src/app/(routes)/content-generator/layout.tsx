import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Content Generator - Write Articles, Copy & Posts Instantly',
  description: 'Generate high-quality articles, marketing copy, and social media posts instantly with TomatoAi\'s free AI content generator.',
  keywords: ['AI content generator', 'AI writer', 'AI copywriting', 'content generation AI', 'AI article writer'],
  path: '/content-generator',
})

export default function ContentGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
