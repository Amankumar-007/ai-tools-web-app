import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'
import ToolPageAbout from '@/components/ToolPageAbout'
import { TOOL_PAGE_ABOUT } from '@/data/tool-page-about'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Image & Thumbnail Search - Find Visuals',
  description: 'Search and discover high-quality images and thumbnails for videos, articles and social posts using the TomatoAi AI-powered visual search tool.',
  keywords: ['AI image search', 'thumbnail search', 'AI thumbnail finder', 'free stock images AI'],
  path: '/search-thumbnail',
})

export default function SearchThumbnailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolPageAbout content={TOOL_PAGE_ABOUT['/search-thumbnail']} />
    </>
  )
}
