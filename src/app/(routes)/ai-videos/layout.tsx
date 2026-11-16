import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Video Library - 1,000 Videos Across 26 Topics',
  description: 'Browse 1,000 AI videos across 26 topics, including ChatGPT, Claude, coding, image generation, video creation, research, and automation. Search and filter by topic and length.',
  keywords: ['AI videos', 'AI video tutorials', 'ChatGPT tutorial', 'AI coding tutorials', 'AI video generation', 'learn AI tools', 'AI courses'],
  path: '/ai-videos',
})

export default function AiVideosLayout({ children }: { children: React.ReactNode }) {
  return children
}
