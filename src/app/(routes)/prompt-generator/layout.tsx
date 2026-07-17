import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Find Best AI Prompt Generator - Craft Better Prompts Instantly',
  description: 'Find the best AI prompt generator tool. Generate optimized, high-quality prompts for ChatGPT, Midjourney, and other AI models with TomatoAi\'s AI prompt generator.',
  keywords: ['find best AI tool', 'AI prompt generator', 'prompt engineering tool', 'ChatGPT prompt generator', 'Midjourney prompt generator'],
  path: '/prompt-generator',
})

export default function PromptGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
