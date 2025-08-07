// lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Client-side Stripe - only load if publishable key exists
export const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// Server-side Stripe - only create if secret key exists
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null;

// AI Tools configuration
export const AI_TOOLS = [
  {
    name: 'ChatGPT',
    description: 'Advanced AI conversation and text generation',
    url: 'https://chat.openai.com',
    icon: '🤖'
  },
  {
    name: 'Claude',
    description: 'Anthropic\'s AI assistant for complex tasks',
    url: 'https://claude.ai',
    icon: '🧠'
  },
  {
    name: 'Midjourney',
    description: 'AI-powered image generation and art creation',
    url: 'https://midjourney.com',
    icon: '🎨'
  },
  {
    name: 'Jasper',
    description: 'AI writing assistant for content creation',
    url: 'https://jasper.ai',
    icon: '✍️'
  },
  {
    name: 'Copy.ai',
    description: 'AI copywriting and marketing content',
    url: 'https://copy.ai',
    icon: '📝'
  },
  {
    name: 'Grammarly',
    description: 'AI-powered writing and grammar checking',
    url: 'https://grammarly.com',
    icon: '📚'
  },
  {
    name: 'Notion AI',
    description: 'AI-powered note-taking and organization',
    url: 'https://notion.so',
    icon: '📋'
  },
  {
    name: 'Canva AI',
    description: 'AI-powered design and visual content creation',
    url: 'https://canva.com',
    icon: '🎭'
  },
  {
    name: 'Runway ML',
    description: 'AI video editing and generation',
    url: 'https://runwayml.com',
    icon: '🎬'
  },
  {
    name: 'DALL-E',
    description: 'OpenAI\'s image generation AI',
    url: 'https://openai.com/dall-e-2',
    icon: '🖼️'
  },
  {
    name: 'Stable Diffusion',
    description: 'Open-source AI image generation',
    url: 'https://stability.ai',
    icon: '🎭'
  },
  {
    name: 'GitHub Copilot',
    description: 'AI-powered code completion and assistance',
    url: 'https://github.com/features/copilot',
    icon: '💻'
  }
];