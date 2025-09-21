export interface ParsedTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  videoUrl?: string;
  fileName: string;
  tags: string[];
  content: string;
}

// Parse README.md content to extract template information
export function parseReadmeContent(readmeContent: string): ParsedTemplate[] {
  const templates: ParsedTemplate[] = [];
  const lines = readmeContent.split('\n');
  let currentCategory = '';
  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect category sections
    if (line.startsWith('## n8n AI Agents')) {
      currentSection = 'AI Agents';
      continue;
    } else if (line.startsWith('## n8n AI Workflows & Automations')) {
      currentSection = 'AI Workflows & Automations';
      continue;
    } else if (line.startsWith('## AI Automation Deal Breakdowns')) {
      currentSection = 'AI Automation Deal Breakdowns';
      continue;
    }

    // Detect subsections (specific agent types)
    if (line.startsWith('### ')) {
      currentCategory = line.replace('### ', '').trim();
      continue;
    }

    // Parse template entries
    const templateMatch = line.match(/\[([^\]]+)\.json\]\(([^)]+)\)\s*-\s*(.+)/);
    if (templateMatch) {
      const [, name, videoUrl, description] = templateMatch;
      const fileName = `${name}.json`;
      
      // Generate tags based on name and description
      const tags = generateTags(name, description, currentCategory);
      
      templates.push({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: description.trim(),
        category: currentSection || 'General',
        videoUrl,
        fileName,
        tags,
        content: '' // Will be populated when actual content is loaded
      });
    }

    // Parse workflow entries (without subsections)
    const workflowMatch = line.match(/^- \[([^\]]+)\.json\]\(([^)]+)\)\s*-\s*(.+)/);
    if (workflowMatch && currentSection === 'n8n AI Workflows & Automations') {
      const [, name, videoUrl, description] = workflowMatch;
      const fileName = `${name}.json`;
      
      const tags = generateTags(name, description, 'Workflow');
      
      templates.push({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: description.trim(),
        category: currentSection,
        videoUrl,
        fileName,
        tags,
        content: '' // Will be populated when actual content is loaded
      });
    }
  }

  return templates;
}

// Generate tags based on template name and description
function generateTags(name: string, description: string, category: string): string[] {
  const tags: string[] = [];
  const nameLower = name.toLowerCase();
  const descLower = description.toLowerCase();

  // Add category as tag
  if (category) {
    tags.push(category.toLowerCase());
  }

  // Common AI/automation tags
  if (nameLower.includes('ai') || descLower.includes('ai')) {
    tags.push('ai');
  }
  if (nameLower.includes('agent') || descLower.includes('agent')) {
    tags.push('agent');
  }
  if (nameLower.includes('automation') || descLower.includes('automation')) {
    tags.push('automation');
  }

  // Specific service tags
  if (nameLower.includes('gmail') || descLower.includes('gmail')) {
    tags.push('gmail', 'email');
  }
  if (nameLower.includes('whatsapp') || descLower.includes('whatsapp')) {
    tags.push('whatsapp', 'chatbot');
  }
  if (nameLower.includes('twitter') || nameLower.includes('x') || descLower.includes('twitter')) {
    tags.push('twitter', 'social media');
  }
  if (nameLower.includes('newsletter') || descLower.includes('newsletter')) {
    tags.push('newsletter', 'content', 'email');
  }
  if (nameLower.includes('scrap') || descLower.includes('scrap')) {
    tags.push('scraping', 'data');
  }
  if (nameLower.includes('video') || descLower.includes('video')) {
    tags.push('video', 'content');
  }
  if (nameLower.includes('image') || descLower.includes('image')) {
    tags.push('image', 'content');
  }
  if (nameLower.includes('marketing') || descLower.includes('marketing')) {
    tags.push('marketing');
  }
  if (nameLower.includes('web') || descLower.includes('web')) {
    tags.push('web', 'development');
  }
  if (nameLower.includes('dental') || descLower.includes('dental')) {
    tags.push('healthcare', 'dental');
  }
  if (nameLower.includes('voice') || descLower.includes('voice')) {
    tags.push('voice', 'audio');
  }
  if (nameLower.includes('chatbot') || descLower.includes('chatbot')) {
    tags.push('chatbot');
  }
  if (nameLower.includes('firecrawl') || descLower.includes('firecrawl')) {
    tags.push('firecrawl');
  }
  if (nameLower.includes('elevenlabs') || descLower.includes('elevenlabs')) {
    tags.push('elevenlabs');
  }
  if (nameLower.includes('openai') || descLower.includes('openai')) {
    tags.push('openai');
  }
  if (nameLower.includes('claude') || descLower.includes('claude')) {
    tags.push('claude');
  }
  if (nameLower.includes('gemini') || descLower.includes('gemini')) {
    tags.push('gemini');
  }

  // Remove duplicates and return
  return [...new Set(tags)];
}

// Get template content by filename
export async function getTemplateContent(fileName: string): Promise<string> {
  try {
    const response = await fetch('/api/n8n-templates');
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    const data = await response.json();
    const template = data.templates.find((t: any) => t.fileName === fileName);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    return template.content;
  } catch (error) {
    console.error('Error loading template content:', error);
    throw error;
  }
}

// Get all templates from the API
export async function getAllTemplates(): Promise<ParsedTemplate[]> {
  try {
    const response = await fetch('/api/n8n-templates');
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    const data = await response.json();
    return data.templates.map((template: any) => ({
      ...template,
      videoUrl: getVideoUrl(template.fileName)
    }));
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
}

// Get video URL based on template filename
function getVideoUrl(fileName: string): string | undefined {
  const videoMap: Record<string, string> = {
    'marketing_team_agent.json': 'https://youtu.be/_HOHQqjsy0U',
    'ai_newsletter_generator.json': 'https://youtu.be/Nv5_LU0q1IY',
    'dental_practice_voice_agent.json': 'https://www.youtube.com/watch?v=vQ5Z8-f-xw4',
    'whatsapp_ai_chatbot_agent.json': 'https://www.youtube.com/watch?v=IpWx1ubSnH4',
    'ai_gmail_agent.json': 'https://www.youtube.com/watch?v=Q1Ytc3VdS5o',
    'web_developer_agent.json': 'https://www.youtube.com/watch?v=ht0zdloIHfA',
    'ai_scraping_pipeline.json': 'https://www.youtube.com/watch?v=2uwV4aUyGIg',
    'twitter_reply_guy_agent.json': 'https://www.youtube.com/watch?v=Q_b5uPndsLY',
    'firecrawl_email_scraper.json': 'https://www.youtube.com/watch?v=zasYpLeMV9g',
    'write_seo_optimized_listicle_article.json': 'https://www.youtube.com/watch?v=uDrkgEuEOBA',
    'ai_news_data_ingestion.json': 'https://www.youtube.com/watch?v=Nv5_LU0q1IY',
    'firecrawl_scrape_url.json': 'https://www.youtube.com/watch?v=Nv5_LU0q1IY',
    'cal_ai_clone_backend.json': 'https://www.youtube.com/watch?v=4c-kYOiksFg',
    'veo_3_viral_bigfoot_vlog_generator.json': 'https://www.youtube.com/watch?v=C65c8itWvf4',
    'short_form_video_script_generator.json': 'https://www.youtube.com/watch?v=7WsmUlbyjMM',
    'twitter_x_scraping.json': 'https://youtu.be/otK0ILpn4GQ',
    'content_repurposing_factory.json': 'https://www.youtube.com/watch?v=u9gwOtjiYnI',
    'reverse_engineer_viral_ai_videos.json': 'https://youtu.be/qNSBLfb82wM',
    'viral_youtube_video_clipper.json': 'https://www.youtube.com/watch?v=Yb-mZmvHh-I',
    'local_podcast_generator.json': 'https://www.youtube.com/watch?v=mXz-gOBg3uo',
    'nano_banana_ad_creative_generator.json': 'https://www.youtube.com/watch?v=TZcn8nOJHH4',
    'nano_banana_facebook_ad_thief.json': 'https://youtu.be/QhDxPK2z5PQ',
    'deal_breakdown_lawyer_lead_gen.json': 'https://www.youtube.com/watch?v=RtPUtfxQZYU'
  };
  
  return videoMap[fileName];
}
