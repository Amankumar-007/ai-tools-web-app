import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Learning Roadmap Generator - Personalized Study Plans',
  description: 'Generate a personalized, visual learning roadmap for any skill or topic with AI, broken down into clear, actionable steps.',
  keywords: ['AI roadmap generator', 'learning roadmap', 'AI study plan', 'skill roadmap generator'],
  path: '/roadmap',
})

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return children
}
