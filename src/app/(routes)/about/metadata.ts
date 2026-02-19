import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About tomatoTool - AI Tools Directory Mission & Team | tomatoTool',
  description: 'Learn about tomatoTool, your trusted AI tools directory. Discover our mission to help users find the best artificial intelligence software and tools for every need.',
  keywords: [
    'about tomatoTool',
    'AI tools directory mission',
    'tomatoTool team',
    'AI software platform',
    'artificial intelligence tools',
    'tomatoTool story',
    'AI discovery platform',
    'technology company',
    'AI innovation',
    'digital tools directory'
  ],
  openGraph: {
    title: 'About tomatoTool - AI Tools Directory Mission & Team | tomatoTool',
    description: 'Learn about tomatoTool, your trusted AI tools directory. Discover our mission to help users find the best artificial intelligence software.',
    url: 'https://tomatoai.in/about',
    images: [
      {
        url: '/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'About tomatoTool - AI Tools Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About tomatoTool - AI Tools Directory Mission & Team | tomatoTool',
    description: 'Learn about tomatoTool, your trusted AI tools directory. Discover our mission to help users find the best AI software.',
    images: ['/twitter-about.jpg'],
  },
  alternates: {
    canonical: '/about',
  },
}
