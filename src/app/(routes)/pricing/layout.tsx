import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Pricing - TomatoAi Plans & Subscriptions',
  description: 'Compare TomatoAi pricing plans and find the right subscription for AI tool discovery, content generation, and productivity features.',
  keywords: ['TomatoAi pricing', 'AI tools subscription', 'AI directory plans', 'TomatoAi cost'],
  path: '/pricing',
})

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
