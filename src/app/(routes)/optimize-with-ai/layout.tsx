import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'
import ToolPageAbout from '@/components/ToolPageAbout'
import { TOOL_PAGE_ABOUT } from '@/data/tool-page-about'

export const metadata: Metadata = createPageMetadata({
  title: 'Optimize Content with AI - Free Text Improver',
  description: 'Instantly improve and optimize your writing with AI, powered by Google Gemini. Clearer, sharper, more effective content in seconds.',
  keywords: ['optimize text with AI', 'AI text improver', 'AI writing optimizer', 'Gemini text optimization'],
  path: '/optimize-with-ai',
})

export default function OptimizeWithAiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolPageAbout content={TOOL_PAGE_ABOUT['/optimize-with-ai']} />
    </>
  )
}
