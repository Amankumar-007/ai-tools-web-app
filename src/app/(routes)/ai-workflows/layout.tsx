import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'
import ToolPageAbout from '@/components/ToolPageAbout'
import { TOOL_PAGE_ABOUT } from '@/data/tool-page-about'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Workflows - Automate Tasks with Top AI Tools',
  description: 'Launch pre-built AI workflows that chain several top-ranked AI tools together to automate content creation, research and everyday productivity.',
  keywords: ['rank AI tools', 'find best AI workflows', 'AI automation', 'chained AI tools', 'workflow automation', 'AI task automation'],
  path: '/ai-workflows',
})

export default function AiWorkflowsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolPageAbout content={TOOL_PAGE_ABOUT['/ai-workflows']} />
    </>
  )
}
