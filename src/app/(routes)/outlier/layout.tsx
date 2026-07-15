import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Outlier AI - Transform Content with Gemini Flash',
  description: 'Outlier AI transforms your content with cutting-edge AI powered by Google\'s Gemini Flash - fast, accurate, and free to try.',
  keywords: ['Outlier AI', 'Gemini Flash tool', 'AI content transformation', 'Google Gemini AI tool'],
  path: '/outlier',
})

export default function OutlierLayout({ children }: { children: React.ReactNode }) {
  return children
}
