import { runTextTool } from '@/lib/gemini';

/** A short markdown article with a title and three tips about `topic`. Runs on the server; throws with a showable message. */
export function generateContentWithGemini(topic: string): Promise<string> {
  return runTextTool<string>('article', topic);
}
