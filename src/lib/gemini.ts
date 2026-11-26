// Browser helpers for the text tools. The AI call itself happens on the server (/api/text-tools): no AI key is ever in the browser.
import { authFetch } from '@/lib/auth-fetch';

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

/** Run one text tool. Throws an Error with a message that is safe to show. */
export async function runTextTool<T = unknown>(mode: 'optimize' | 'creative' | 'analyze' | 'article', text: string, contentType?: string): Promise<T> {
  const response = await authFetch('/api/text-tools', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, text, contentType }),
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) throw new Error('Please sign in to use this tool.');
  if (!response.ok) throw new Error(body.error || 'The AI service is unavailable. Please try again.');
  return body.result as T;
}

export async function optimizeTextWithGemini(text: string): Promise<OptimizationResult> {
  const result = await runTextTool<Partial<OptimizationResult>>('optimize', text);
  const analysis = (result.analysis ?? {}) as Partial<OptimizationResult['analysis']>;
  return {
    original: text,
    improved: result.improved || 'Could not improve this text.',
    explanation: result.explanation || 'No explanation provided',
    tip: result.tip || 'Keep practising!',
    analysis: {
      readabilityScore: Number(analysis.readabilityScore) || 70,
      toneImprovement: analysis.toneImprovement || 'General improvements',
      keyChanges: Array.isArray(analysis.keyChanges) ? analysis.keyChanges.map(String) : ['Minor enhancements'],
    },
  };
}

export const generateContent = (prompt: string, type: 'blog' | 'social' | 'email' | 'marketing' = 'blog') => runTextTool<string>('creative', prompt, type);

export const analyzeText = (text: string) => runTextTool<Record<string, unknown>>('analyze', text);
