import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Reset Password',
  description: 'Reset your TomatoAi account password.',
  path: '/forgot-password',
  noIndex: true,
})

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
