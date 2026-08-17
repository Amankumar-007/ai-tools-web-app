import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'
import ToolPageAbout from '@/components/ToolPageAbout'
import { TOOL_PAGE_ABOUT } from '@/data/tool-page-about'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Learning Roadmap Generator - Study Plans',
  description: 'Generate a personalized, visual learning roadmap for any skill or topic with AI, broken down into clear, actionable steps.',
  keywords: ['AI roadmap generator', 'learning roadmap', 'AI study plan', 'skill roadmap generator'],
  path: '/roadmap',
})

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolPageAbout content={TOOL_PAGE_ABOUT['/roadmap']} />
    </>
  )
}
