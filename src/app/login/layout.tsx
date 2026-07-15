import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Log In',
  description: 'Log in to your TomatoAi account.',
  path: '/login',
  noIndex: true,
})

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
