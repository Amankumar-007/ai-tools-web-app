import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Rank Best AI Workflows - Automate Tasks with Top AI Tools',
  description: 'Find and rank the best AI tools and workflows for your work. Launch pre-built AI workflows that chain multiple top-ranked AI tools together to automate content creation and productivity.',
  keywords: ['rank AI tools', 'find best AI workflows', 'AI automation', 'chained AI tools', 'workflow automation', 'AI task automation'],
  path: '/ai-workflows',
})

export default function AiWorkflowsLayout({ children }: { children: React.ReactNode }) {
  return children
}
