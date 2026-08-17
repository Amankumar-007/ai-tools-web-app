import type { Metadata } from 'next'
import TrendingClient from './TrendingClient'
import JsonLd, { itemListStructuredData, breadcrumbListStructuredData } from '@/components/JsonLd'
import { createPageMetadata, SITE_URL } from '@/metadata-utils'
import { getTrendingNews, getTrendingTools, getGithubTrendingRepos } from '@/lib/trending'

export const metadata: Metadata = createPageMetadata({
  title: 'Trending GitHub Repos, AI News & Tools',
  description: 'The latest trending GitHub repos, AI news and tools. We track real developer activity and Hacker News signal to surface what matters. Updated daily.',
  keywords: ['trending github repo', 'AI news', 'trending tools', 'artificial intelligence news', 'AI product directory', 'best AI tools', 'ChatGPT', 'DeepSeek', 'AI updates'],
  path: '/trending',
})

// Hourly ISR ceiling; a daily Vercel Cron job (see /api/cron/refresh-trending)
// also force-revalidates this page once a day regardless of traffic.
export const revalidate = 3600

export default async function TrendingPage() {
  const [initialNews, initialTools, allRepos] = await Promise.all([
    getTrendingNews(),
    getTrendingTools(),
    getGithubTrendingRepos(30),
  ])
  const lastUpdated = new Date().toISOString()

  return (
    <>
      <JsonLd
        data={itemListStructuredData(
          initialTools.map((tool) => ({
            name: tool.name,
            url: `https://${tool.website}`,
            description: tool.description,
          }))
        )}
      />
      <JsonLd
        data={breadcrumbListStructuredData([
          { name: 'Home', url: SITE_URL },
          { name: 'Trending', url: `${SITE_URL}/trending` },
        ])}
      />
      <TrendingClient
        initialTools={initialTools}
        initialNews={initialNews}
        initialRepos={allRepos.slice(0, 6)}
        totalRepoCount={allRepos.length}
        lastUpdated={lastUpdated}
      />
    </>
  )
}
