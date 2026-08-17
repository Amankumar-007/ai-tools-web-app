import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'
import ToolPageAbout from '@/components/ToolPageAbout'
import { TOOL_PAGE_ABOUT } from '@/data/tool-page-about'

export const metadata: Metadata = createPageMetadata({
  title: 'n8n Automation Templates - Free Workflow Library',
  description: 'Browse free, ready-to-use n8n workflow templates and AI agents covering email, CRM, documents and social media. Copy, import and automate in minutes.',
  keywords: ['n8n templates', 'n8n workflows', 'AI automation templates', 'n8n AI agents', 'workflow automation'],
  path: '/n8n-templates',
})

export default function N8nTemplatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolPageAbout content={TOOL_PAGE_ABOUT['/n8n-templates']} />
    </>
  )
}
