import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Signing In',
  description: 'Completing authentication.',
  path: '/auth/callback',
  noIndex: true,
})

export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return children
}
