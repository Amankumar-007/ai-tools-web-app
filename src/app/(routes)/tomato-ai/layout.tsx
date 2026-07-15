import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'TomatoAI Chat - Your Personal AI Assistant',
  description: 'Chat with TomatoAI, a helpful and professional AI assistant for answering questions, brainstorming, writing, and getting things done.',
  keywords: ['TomatoAI chat', 'AI chat assistant', 'AI chatbot', 'TomatoAi assistant'],
  path: '/tomato-ai',
})

export default function TomatoAiLayout({ children }: { children: React.ReactNode }) {
  return children
}
