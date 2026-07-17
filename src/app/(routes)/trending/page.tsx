import type { Metadata } from 'next'
import TrendingClient from './TrendingClient'
import JsonLd, { itemListStructuredData, breadcrumbListStructuredData } from '@/components/JsonLd'
import { createPageMetadata } from '@/metadata-utils'
import { getTrendingNews, getTrendingTools, getGithubTrendingRepos } from '@/lib/trending'

export const metadata: Metadata = createPageMetadata({
  title: 'Check Out Latest Trending Github Repo and News and Tools',
  description: 'Check out the latest trending GitHub repos, AI news, tools and more. We track real developer activity and Hacker News discussion signal to find the next AI super tools. Updated daily.',
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
          { name: 'Home', url: 'https://tomatoai.in' },
          { name: 'Trending', url: 'https://tomatoai.in/trending' },
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
