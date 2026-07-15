import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'n8n AI Automation Templates - Free Workflow Library',
  description: 'Browse free, ready-to-use n8n workflow templates and AI agents to automate your business processes with cutting-edge AI.',
  keywords: ['n8n templates', 'n8n workflows', 'AI automation templates', 'n8n AI agents', 'workflow automation'],
  path: '/n8n-templates',
})

export default function N8nTemplatesLayout({ children }: { children: React.ReactNode }) {
  return children
}
