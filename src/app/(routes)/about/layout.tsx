import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'About TomatoAi - Premium AI Tools Directory, n8n Templates & Workflows',
  description: 'Learn about TomatoAi, the ultimate artificial intelligence directory helping developers, creators, and professionals discover, compare, and integrate top AI tools, custom prompts, and n8n workflows into their daily stacks.',
  keywords: [
    'about TomatoAi',
    'AI tools directory',
    'AI software platform',
    'TomatoAi mission',
    'best AI tools list 2026',
    'AI directory India',
    'free AI models platform',
    'n8n templates library',
    'artificial intelligence tools search',
    'automate workflows with AI',
    'AI prompt engineering resources'
  ],
  path: '/about',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
