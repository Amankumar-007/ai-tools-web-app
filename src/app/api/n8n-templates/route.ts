import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const templatesDir = path.join(process.cwd(), 'src', 'data', 'n8n-ai-automations');
    
    // Read all JSON files in the directory
    const files = await fs.readdir(templatesDir);
    const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'package.json');
    
    const templates = [];
    
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(templatesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(content);
        
        // Extract basic info from the JSON
        const template = {
          id: file.replace('.json', '').toLowerCase().replace(/_/g, '-'),
          name: jsonData.name || file.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: extractDescription(jsonData),
          category: categorizeTemplate(file, jsonData),
          fileName: file,
          content: content, // Include the full JSON content
          tags: generateTags(file, jsonData.name || '')
        };
        
        templates.push(template);
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }
    
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error reading templates directory:', error);
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
  }
}

function extractDescription(jsonData: any): string {
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
  
  // Fallback descriptions based on filename
  const name = jsonData.name || '';
  if (name.toLowerCase().includes('gmail')) {
    return 'AI-powered Gmail automation agent that processes emails, categorizes messages, drafts responses, and manages email workflows.';
  }
  if (name.toLowerCase().includes('marketing')) {
    return 'AI voice agent to replace your marketing team. Handles daily marketing tasks such as writing newsletters, generating images, and creating content.';
  }
  if (name.toLowerCase().includes('newsletter')) {
    return 'Automates the entire process of generating an AI-focused newsletter with news collection and content creation.';
  }
  if (name.toLowerCase().includes('dental')) {
    return 'AI-powered voice agent for dental practices that handles appointment scheduling and patient management.';
  }
  if (name.toLowerCase().includes('whatsapp')) {
    return 'AI-powered WhatsApp chatbot for hospitality industry with personalized service recommendations.';
  }
  if (name.toLowerCase().includes('web') && name.toLowerCase().includes('develop')) {
    return 'AI-powered web developer agent that can scrape websites, analyze content, and build modern websites automatically.';
  }
  if (name.toLowerCase().includes('scrap')) {
    return 'AI workflow for scraping web content and transforming it into structured data for processing.';
  }
  if (name.toLowerCase().includes('twitter')) {
    return 'AI automation for Twitter/X monitoring and engagement with intelligent reply generation.';
  }
  if (name.toLowerCase().includes('email') && name.toLowerCase().includes('scrap')) {
    return 'Uses Firecrawl to scrape all email addresses from a given website automatically.';
  }
  if (name.toLowerCase().includes('seo')) {
    return 'Uses AI to generate SEO-optimized articles and content for your website or CMS.';
  }
  
  return 'AI automation workflow template for n8n.';
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

function generateTags(filename: string, name: string): string[] {
  const tags: string[] = [];
  const lowerName = name.toLowerCase();
  const lowerFilename = filename.toLowerCase();
  
  // Common tags
  if (lowerName.includes('ai') || lowerFilename.includes('ai')) {
    tags.push('ai');
  }
  if (lowerName.includes('automation') || lowerFilename.includes('automation')) {
    tags.push('automation');
  }
  if (lowerName.includes('agent') || lowerFilename.includes('agent')) {
    tags.push('agent');
  }
  
  // Service-specific tags
  if (lowerName.includes('gmail') || lowerFilename.includes('gmail')) {
    tags.push('gmail', 'email');
  }
  if (lowerName.includes('whatsapp') || lowerFilename.includes('whatsapp')) {
    tags.push('whatsapp', 'chatbot');
  }
  if (lowerName.includes('twitter') || lowerFilename.includes('twitter')) {
    tags.push('twitter', 'social media');
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
  
  return [...new Set(tags)];
}
