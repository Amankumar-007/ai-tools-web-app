import { MetadataRoute } from 'next'
import { getAllTools } from '@/lib/tools'
import { agentWorkflows } from '@/app/data/agent-workflows'

const baseUrl = 'https://tomatoai.in'

// Fixed build-time date for evergreen static pages - only bumped when the
// underlying page content meaningfully changes, unlike the old `new Date()`
// (which falsely claimed every page changed on every request).
const SITE_BUILD_DATE = '2026-07-13'

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  { path: '/ai-tools', priority: 0.9, changeFrequency: 'daily' },
  { path: '/trending', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/pricing', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/prompts', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/prompt-generator', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/content-generator', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/summarization', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/resume-analyzer', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/search-thumbnail', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/search', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/roadmap', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/outlier', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/optimize-with-ai', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/ai-videos', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/ai-workflows', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/n8n-templates', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/tomato-ai', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/docs', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/trending/repos', priority: 0.7, changeFrequency: 'hourly' },
  { path: '/ai-tools/analyze', priority: 0.4, changeFrequency: 'monthly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: route.path === '/trending' ? new Date().toISOString() : SITE_BUILD_DATE,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const toolPages = getAllTools().map((tool) => ({
    url: `${baseUrl}/ai-tools/${tool.slug}`,
    lastModified: SITE_BUILD_DATE,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const workflowPages = agentWorkflows.map((workflow) => ({
    url: `${baseUrl}/ai-workflows/${workflow.slug}`,
    lastModified: SITE_BUILD_DATE,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...toolPages, ...workflowPages]
}
