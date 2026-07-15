import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'AI Prompt Generator - Craft Better Prompts Instantly',
  description: 'Generate optimized, high-quality prompts for ChatGPT, Midjourney, and other AI models with TomatoAi\'s free AI prompt generator.',
  keywords: ['AI prompt generator', 'prompt engineering tool', 'ChatGPT prompt generator', 'Midjourney prompt generator'],
  path: '/prompt-generator',
})

export default function PromptGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
