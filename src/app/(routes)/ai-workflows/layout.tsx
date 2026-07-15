import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Workflows - Automate Tasks with Chained AI Tools',
  description: 'Launch pre-built AI workflows that chain multiple AI tools together to automate content creation, research, and productivity tasks in one click.',
  keywords: ['AI workflows', 'AI automation', 'chained AI tools', 'workflow automation', 'AI task automation'],
  path: '/ai-workflows',
})

export default function AiWorkflowsLayout({ children }: { children: React.ReactNode }) {
  return children
}
