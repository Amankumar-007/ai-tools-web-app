import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'About TomatoAi | How It Works',
  description: 'Learn how TomatoAi brings together an AI tools directory, an AI assistant, browser-based utilities, reusable prompts and n8n workflow templates.',
  keywords: ['about TomatoAi', 'AI tools directory', 'online tools', 'AI assistant', 'n8n templates'],
  path: '/about',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
