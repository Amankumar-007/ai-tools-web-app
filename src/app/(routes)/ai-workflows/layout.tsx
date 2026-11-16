import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'
import ToolPageAbout from '@/components/ToolPageAbout'
import { TOOL_PAGE_ABOUT } from '@/data/tool-page-about'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Workflow Guides for Real Work',
  description: 'Explore 15 step-by-step AI workflow guides for research, content, development, support, productivity, and more. See tools, prerequisites, and practical build instructions.',
  keywords: ['AI workflow guides', 'AI automation', 'AI productivity workflows', 'step-by-step AI tutorials', 'AI workflow examples'],
  path: '/ai-workflows',
})

export default function AiWorkflowsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolPageAbout content={TOOL_PAGE_ABOUT['/ai-workflows']} forceLight />
    </>
  )
}
