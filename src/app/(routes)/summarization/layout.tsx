import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Text & Document Summarizer - Free Online Tool',
  description: 'Summarize long documents, articles, and text instantly with AI. Choose general, bullet-point, executive, or academic summary styles for free.',
  keywords: ['AI summarizer', 'text summarization tool', 'document summarizer', 'AI summary generator', 'free text summarizer'],
  path: '/summarization',
})

export default function SummarizationLayout({ children }: { children: React.ReactNode }) {
  return children
}
