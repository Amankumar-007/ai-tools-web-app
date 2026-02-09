import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: NextRequest) {
  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  try {
    const templatesDir = path.join(process.cwd(), 'public', 'data', 'n8n-templates');
    
    // Read all directories in the n8n-templates folder
    const categories = await fs.readdir(templatesDir, { withFileTypes: true });
    const categoryDirs = categories.filter(dirent => dirent.isDirectory());
    
    const templates = [];
    
    for (const categoryDir of categoryDirs) {
      const categoryPath = path.join(templatesDir, categoryDir.name);
      const files = await fs.readdir(categoryPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of jsonFiles) {
        try {
          const filePath = path.join(categoryPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const jsonData = JSON.parse(content);
          
          // Extract basic info from the JSON
          const template = {
            id: file.replace('.json', '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: jsonData.name || file.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: extractDescription(jsonData, file),
            category: mapDirectoryNameToCategory(categoryDir.name),
            fileName: file,
            content: content, // Include the full JSON content
            tags: generateTags(file, jsonData.name || '', categoryDir.name)
          };
          
          templates.push(template);
        } catch (error) {
          console.error(`Error reading file ${file} in category ${categoryDir.name}:`, error);
        }
      }
    }
    
    return new NextResponse(JSON.stringify({ templates }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  } catch (error) {
    console.error('Error reading templates directory:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to load templates' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  }
}

function extractDescription(jsonData: any, fileName: string): string {
  // Try to extract description from the workflow data
  if (jsonData.nodes && jsonData.nodes.length > 0) {
    // Look for description in nodes or other metadata
    const descriptionNode = jsonData.nodes.find((node: any) => 
      node.parameters && node.parameters.description
    );
    if (descriptionNode) {
      return descriptionNode.parameters.description;
    }
  }
  
  // Fallback descriptions based on filename and directory
  const name = jsonData.name || fileName;
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('gmail') || lowerName.includes('email')) {
    return 'AI-powered email automation that processes messages, categorizes content, drafts responses, and manages email workflows.';
  }
  if (lowerName.includes('marketing') || lowerName.includes('newsletter')) {
    return 'AI automation for marketing tasks including content creation, newsletter generation, and campaign management.';
  }
  if (lowerName.includes('dental')) {
    return 'AI-powered voice agent for dental practices that handles appointment scheduling and patient management.';
  }
  if (lowerName.includes('whatsapp')) {
    return 'AI-powered WhatsApp chatbot for customer service with personalized responses and automation.';
  }
  if (lowerName.includes('web') && lowerName.includes('develop')) {
    return 'AI-powered web development agent that can scrape websites, analyze content, and build modern web applications.';
  }
  if (lowerName.includes('scrap')) {
    return 'AI workflow for scraping web content and transforming it into structured data for analysis and processing.';
  }
  if (lowerName.includes('twitter') || lowerName.includes('social')) {
    return 'AI automation for social media monitoring, content generation, and intelligent engagement.';
  }
  if (lowerName.includes('seo')) {
    return 'AI-powered SEO optimization tool that generates optimized content and improves search rankings.';
  }
  if (lowerName.includes('video')) {
    return 'AI automation for video content creation, editing, and optimization across multiple platforms.';
  }
  if (lowerName.includes('image')) {
    return 'AI-powered image processing and generation workflow for creating and optimizing visual content.';
  }
  if (lowerName.includes('voice') || lowerName.includes('audio')) {
    return 'AI voice automation for speech-to-text, text-to-speech, and voice assistant workflows.';
  }
  if (lowerName.includes('chatbot')) {
    return 'AI chatbot automation for customer service, lead generation, and interactive conversations.';
  }
  
  return 'AI automation workflow template for n8n.';
}

function mapDirectoryNameToCategory(directoryName: string): string {
  const categoryMap: Record<string, string> = {
    'AI_Research_RAG_and_Data_Analysis': 'AI Research & Data Analysis',
    'Airtable': 'Database & Storage',
    'Database_and_Storage': 'Database & Storage',
    'Discord': 'Social Media',
    'Forms_and_Surveys': 'Forms & Surveys',
    'Gmail_and_Email_Automation': 'Email Automation',
    'Google_Drive_and_Google_Sheets': 'Google Workspace',
    'HR_and_Recruitment': 'HR & Recruitment',
    'Instagram_Twitter_Social_Media': 'Social Media',
    'Notion': 'Productivity',
    'OpenAI_and_LLMs': 'AI & LLMs',
    'Other': 'Other',
    'Other_Integrations_and_Use_Cases': 'Other',
    'PDF_and_Document_Processing': 'Document Processing',
    'Slack': 'Communication',
    'Telegram': 'Social Media',
    'WhatsApp': 'Social Media',
    'WordPress': 'CMS',
    'devops': 'DevOps'
  };
  
  return categoryMap[directoryName] || directoryName.replace(/_/g, ' ');
}

function categorizeTemplate(filename: string, jsonData: any): string {
  const name = (jsonData.name || filename).toLowerCase();
  
  if (name.includes('agent')) {
    return 'AI Agents';
  }
  if (name.includes('marketing') || name.includes('newsletter') || name.includes('content')) {
    return 'Content Creation';
  }
  if (name.includes('scrap')) {
    return 'Web Scraping';
  }
  if (name.includes('email') || name.includes('gmail')) {
    return 'Email Automation';
  }
  if (name.includes('twitter') || name.includes('social')) {
    return 'Social Media';
  }
  if (name.includes('video')) {
    return 'Video Production';
  }
  
  return 'Business Automation';
}

function generateTags(filename: string, name: string, category: string): string[] {
  const tags: string[] = [];
  const lowerName = name.toLowerCase();
  const lowerFilename = filename.toLowerCase();
  const lowerCategory = category.toLowerCase();
  
  // Add category as a tag
  tags.push(lowerCategory.replace(/[^a-z0-9]/g, '-'));
  
  // Common tags
  if (lowerName.includes('ai') || lowerFilename.includes('ai') || lowerCategory.includes('ai')) {
    tags.push('ai');
  }
  if (lowerName.includes('automation') || lowerFilename.includes('automation')) {
    tags.push('automation');
  }
  if (lowerName.includes('agent') || lowerFilename.includes('agent')) {
    tags.push('agent');
  }
  
  // Service-specific tags
  if (lowerName.includes('gmail') || lowerFilename.includes('gmail') || lowerCategory.includes('gmail')) {
    tags.push('gmail', 'email');
  }
  if (lowerName.includes('whatsapp') || lowerFilename.includes('whatsapp') || lowerCategory.includes('whatsapp')) {
    tags.push('whatsapp', 'chatbot');
  }
  if (lowerName.includes('twitter') || lowerFilename.includes('twitter') || lowerCategory.includes('twitter')) {
    tags.push('twitter', 'social-media');
  }
  if (lowerName.includes('newsletter') || lowerFilename.includes('newsletter')) {
    tags.push('newsletter', 'content', 'email');
  }
  if (lowerName.includes('scrap') || lowerFilename.includes('scrap')) {
    tags.push('scraping', 'data');
  }
  if (lowerName.includes('marketing') || lowerFilename.includes('marketing')) {
    tags.push('marketing');
  }
  if (lowerName.includes('web') || lowerFilename.includes('web')) {
    tags.push('web', 'development');
  }
  if (lowerName.includes('dental') || lowerFilename.includes('dental')) {
    tags.push('healthcare', 'dental');
  }
  if (lowerName.includes('video') || lowerFilename.includes('video')) {
    tags.push('video', 'content');
  }
  if (lowerName.includes('seo') || lowerFilename.includes('seo')) {
    tags.push('seo', 'content');
  }
  if (lowerName.includes('openai') || lowerFilename.includes('openai') || lowerCategory.includes('openai')) {
    tags.push('openai');
  }
  if (lowerName.includes('llm') || lowerFilename.includes('llm') || lowerCategory.includes('llm')) {
    tags.push('llm');
  }
  if (lowerName.includes('discord') || lowerCategory.includes('discord')) {
    tags.push('discord');
  }
  if (lowerName.includes('slack') || lowerCategory.includes('slack')) {
    tags.push('slack');
  }
  if (lowerName.includes('telegram') || lowerCategory.includes('telegram')) {
    tags.push('telegram');
  }
  if (lowerName.includes('notion') || lowerCategory.includes('notion')) {
    tags.push('notion');
  }
  if (lowerName.includes('airtable') || lowerCategory.includes('airtable')) {
    tags.push('airtable');
  }
  if (lowerName.includes('wordpress') || lowerCategory.includes('wordpress')) {
    tags.push('wordpress');
  }
  if (lowerName.includes('pdf') || lowerCategory.includes('pdf')) {
    tags.push('pdf');
  }
  if (lowerName.includes('hr') || lowerCategory.includes('hr')) {
    tags.push('hr');
  }
  
  return [...new Set(tags)];
}
