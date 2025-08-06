// lib/gemini.ts

export interface OptimizationResult {
  original: string;
  improved: string;
  explanation: string;
  tip: string;
  analysis: {
    readabilityScore: number;
    toneImprovement: string;
    keyChanges: string[];
  };
}

export interface AIToolConfig {
  temperature?: number;
  maxTokens?: number;
  model?: 'gemini-2.0-flash' | 'gemini-pro';
}

class GeminiAPI {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Gemini API key is required. Please set NEXT_PUBLIC_GEMINI_API_KEY');
    }
  }

  private async makeRequest(prompt: string, config: AIToolConfig = {}) {
    const { model = 'gemini-2.0-flash', temperature = 0.7, maxTokens = 1000 } = config;
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async optimizeText(userInput: string, config?: AIToolConfig): Promise<OptimizationResult> {
    const prompt = `
You are an elite content optimization AI. Analyze and transform the given text.

Return your response in this EXACT JSON format (no markdown, no code blocks):
{
  "improved": "The enhanced version of the text",
  "explanation": "Brief explanation of key improvements made",
  "tip": "One actionable tip for future content creation",
  "analysis": {
    "readabilityScore": 85,
    "toneImprovement": "Made more engaging and professional",
    "keyChanges": ["Added stronger verbs", "Improved flow", "Enhanced clarity"]
  }
}

Input text to optimize: "${userInput}"

Focus on:
- Clarity and readability
- Engaging tone
- Professional polish
- Concise expression
- Active voice
- Emotional resonance
`;

    try {
      const response = await this.makeRequest(prompt, config);
      if (!response) throw new Error('No response from AI');

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid response format');

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        original: userInput,
        improved: result.improved || 'Could not improve text',
        explanation: result.explanation || 'No explanation provided',
        tip: result.tip || 'Keep practicing!',
        analysis: {
          readabilityScore: result.analysis?.readabilityScore || 70,
          toneImprovement: result.analysis?.toneImprovement || 'General improvements',
          keyChanges: result.analysis?.keyChanges || ['Minor enhancements']
        }
      };
    } catch (error) {
      console.error('Text optimization failed:', error);
      return {
        original: userInput,
        improved: 'Sorry, I couldn\'t optimize this text. Please try again.',
        explanation: 'An error occurred during processing',
        tip: 'Try with shorter text or check your internet connection',
        analysis: {
          readabilityScore: 0,
          toneImprovement: 'Unable to analyze',
          keyChanges: ['Error occurred']
        }
      };
    }
  }

  async generateCreativeContent(prompt: string, contentType: 'blog' | 'social' | 'email' | 'marketing' = 'blog') {
    const systemPrompt = `
Generate ${contentType} content based on the user's request.

Content type: ${contentType.toUpperCase()}

Guidelines for ${contentType}:
${contentType === 'blog' ? '- Long-form, informative, SEO-friendly' : ''}
${contentType === 'social' ? '- Short, engaging, hashtag-friendly' : ''}
${contentType === 'email' ? '- Professional, clear call-to-action' : ''}
${contentType === 'marketing' ? '- Persuasive, benefit-focused, compelling' : ''}

User request: "${prompt}"

Provide creative, high-quality content that matches the requested type.
`;

    return await this.makeRequest(systemPrompt);
  }

  async analyzeContent(text: string) {
    const prompt = `
Analyze this content and provide insights in JSON format:

{
  "sentiment": "positive/negative/neutral",
  "readabilityLevel": "beginner/intermediate/advanced",
  "wordCount": number,
  "estimatedReadingTime": "X minutes",
  "keyTopics": ["topic1", "topic2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}

Content to analyze: "${text}"
`;

    try {
      const response = await this.makeRequest(prompt);
      if (!response) return null;

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Content analysis failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const geminiAPI = new GeminiAPI();

// Export main functions
export const optimizeTextWithGemini = (text: string, config?: AIToolConfig) => 
  geminiAPI.optimizeText(text, config);

export const generateContent = (prompt: string, type?: 'blog' | 'social' | 'email' | 'marketing') => 
  geminiAPI.generateCreativeContent(prompt, type);

export const analyzeText = (text: string) => 
  geminiAPI.analyzeContent(text);