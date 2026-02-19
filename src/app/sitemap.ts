import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tomatoai.in'
  
  // Define all your routes here
  const routes = [
    '',
    '/ai-tools',
    '/categories',
    '/login',
    '/signup',
    '/about',
    '/contact',
    '/blog',
    '/privacy',
    '/terms',
    '/ai-image-generator',
    '/ai-writing-tools',
    '/ai-video-editors',
    '/ai-code-assistants',
    '/ai-marketing-tools',
    '/ai-productivity-tools',
    '/ai-automation-tools',
    '/ai-design-tools',
    '/ai-research-tools',
    '/ai-chatbots',
    '/ai-translation-tools',
    '/ai-audio-tools',
    '/ai-data-analysis',
  ]

  // Generate static pages
  const staticPages = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Generate dynamic AI tool pages (example - adjust based on your actual data)
  const aiToolCategories = [
    'writing',
    'image-generation',
    'video-editing',
    'coding',
    'marketing',
    'productivity',
    'automation',
    'design',
    'research',
    'chatbot',
    'translation',
    'audio',
    'data-analysis',
  ]

  const dynamicPages = aiToolCategories.flatMap((category) => [
    {
      url: `${baseUrl}/ai-tools/${category}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ai-tools/${category}/free`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ai-tools/${category}/premium`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ])

  // Blog posts (example - adjust based on your actual blog structure)
  const blogPosts = [
    {
      url: `${baseUrl}/blog/best-ai-tools-2025`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/chatgpt-alternatives`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/ai-productivity-tips`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/ai-automation-guide`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/ai-writing-comparison`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  return [...staticPages, ...dynamicPages, ...blogPosts]
}
