import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = 'AI Tools Web App';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": SITE_URL,
    "X-Title": SITE_NAME,
  },
});

export async function POST(req: Request) {
  const { prompt, size = '1024x1024' } = await req.json();

  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'OpenRouter API key is not configured' },
      { status: 500 }
    );
  }

  if (!prompt) {
    return NextResponse.json(
      { error: 'Prompt is required' },
      { status: 400 }
    );
  }

  try {
    // Parse the size string (e.g., '1024x1024')
    const [width, height] = size.split('x').map(Number);

    // Generate the image using OpenRouter's Gemini 2.5 Flash Image model
    const response = await openai.images.generate({
      model: 'google/gemini-2.5-flash-image',
      prompt: `${prompt}. High quality, 4k, detailed, professional photography.`,
      n: 1,
      size: `${width}x${height}` as any,
      response_format: 'url',
    });

    const imageUrl = response.data?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error('Failed to generate image: No URL returned from API');
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}
