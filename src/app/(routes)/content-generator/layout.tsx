import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'
import ToolPageAbout from '@/components/ToolPageAbout'
import { TOOL_PAGE_ABOUT } from '@/data/tool-page-about'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Content Generator - Write Articles & Copy',
  description: 'Generate high-quality articles, marketing copy and social media posts in seconds with the TomatoAi AI content generator. Free to try.',
  keywords: ['find best AI tool', 'AI content generator', 'AI writer', 'AI copywriting', 'content generation AI', 'AI article writer'],
  path: '/content-generator',
})

export default function ContentGeneratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolPageAbout content={TOOL_PAGE_ABOUT['/content-generator']} />
    </>
  )
}
