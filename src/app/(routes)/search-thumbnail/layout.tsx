import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Image & Thumbnail Search - Find the Perfect Visual',
  description: 'Search and discover high-quality images and thumbnails for your content using TomatoAi\'s AI-powered visual search tool.',
  keywords: ['AI image search', 'thumbnail search', 'AI thumbnail finder', 'free stock images AI'],
  path: '/search-thumbnail',
})

export default function SearchThumbnailLayout({ children }: { children: React.ReactNode }) {
  return children
}
