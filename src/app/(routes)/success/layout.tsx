import type { Metadata } from 'next'
import { createPageMetadata } from '@/metadata-utils'

export const metadata: Metadata = createPageMetadata({
  title: 'Payment Successful',
  description: 'Your TomatoAi payment was successful.',
  path: '/success',
  noIndex: true,
})

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return children
}
