import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Sign Up',
  description: 'Create a free TomatoAi account.',
  path: '/register',
  noIndex: true,
})

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
