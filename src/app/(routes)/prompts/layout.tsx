import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'
import ToolPageAbout from '@/components/ToolPageAbout'
import { TOOL_PAGE_ABOUT } from '@/data/tool-page-about'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Prompt Library for Writing, Coding, Research & More',
  description: 'Browse 148 ready-to-use AI prompts for writing, coding, research, marketing, design, images, video, and everyday work. Search by task or category and copy any prompt.',
  keywords: ['AI prompt library', 'writing prompts', 'coding prompts', 'research prompts', 'image prompts', 'marketing prompts'],
  path: '/prompts',
})

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolPageAbout content={TOOL_PAGE_ABOUT['/prompts']} forceLight />
    </>
  )
}
