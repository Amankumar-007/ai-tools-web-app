import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'
import ToolPageAbout from '@/components/ToolPageAbout'
import { TOOL_PAGE_ABOUT } from '@/data/tool-page-about'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Prompts Library - ChatGPT & Midjourney',
  description: 'Explore a curated library of ready-to-use AI prompts for ChatGPT, Midjourney, and other top AI tools to get better results, faster.',
  keywords: ['AI prompts', 'ChatGPT prompts', 'Midjourney prompts', 'prompt library', 'best AI prompts'],
  path: '/prompts',
})

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolPageAbout content={TOOL_PAGE_ABOUT['/prompts']} />
    </>
  )
}
