import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'About TomatoAi - Our Mission & AI Tools Directory',
  description: 'Learn about TomatoAi, an AI tools directory built to help you discover, compare, and choose the best AI software for productivity, creativity, and automation.',
  keywords: ['about TomatoAi', 'AI tools directory', 'AI software directory', 'TomatoAi mission', 'best AI tools India'],
  path: '/about',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
