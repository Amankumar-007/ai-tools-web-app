import { ALL_CATEGORIES, type CategoryInfo, getCategoryBySlug } from './categories';
import type { Tool } from '@/app/(routes)/ai-tools/AIToolsDirectoryClient';

// Editorial order for the directory. Slugs must exist in public/data/ai-tools.json.
// A category stays empty when there is no relevant real tool in the catalog.
export const CATEGORY_TOOL_SLUGS: Record<string, string[]> = {
  '3d-model': ['tripo-ai', 'scenario-ai'],
  'ai-agents': ['openai-codex', 'manus', 'cursor', 'n8n', 'zapier'],
  'ai-characters': ['character-ai', 'replika', 'waifu-labs'],
  'ai-chat-assistant': ['chatgpt', 'claude', 'gemini', 'grok', 'perplexity', 'poe-by-quora'],
  'ai-detection': ['copyleaks', 'brandwell-ai-detector'],
  'ai-simulation': ['nvidia-isaac-sim'],
  'ai-useful': ['chatgpt', 'claude', 'gemini-notebook', 'perplexity', 'notion-ai'],
  'aixploria-selection': ['chatgpt', 'claude', 'cursor', 'midjourney', 'elevenlabs'],
  amazing: ['chatgpt-images', 'google-flow', 'claude-design', 'tripo-ai'],
  art: ['midjourney', 'chatgpt-images', 'adobe-firefly', 'leonardo-ai'],
  'assistant-code': ['openai-codex', 'cursor', 'github-copilot', 'replit', 'amazon-codewhisperer'],
  'assistive-technology': ['speechify', 'naturalreader', 'letterly'],
  'audio-editing': ['descript', 'krisp', 'podcastle', 'riverside-fm'],
  automation: ['n8n', 'zapier', 'make-integromat', 'ifttt'],
  avatars: ['heygen', 'synthesia', 'd-id', 'vidnoz-ai'],
  business: ['chatgpt', 'claude', 'notion-ai', 'hubspot-ai', 'gamma'],
  chatbots: ['chatgpt', 'character-ai', 'poe-by-quora', 'chatplayground-ai'],
  'customer-support': ['help-scout-ai', 'hubspot-ai', 'thoughtly'],
  'data-analytics': ['datarobot', 'h2o-ai', 'obviously-ai', 'coda-ai'],
  'dating-relationships': ['replika', 'character-ai'],
  'developer-tools': ['google-ai-studio', 'openai-playground', 'openai-codex', 'openrouter', 'hugging-face'],
  'e-commerce': ['ppspy', 'adcreative-ai', 'joggai'],
  'e-mail': ['snoooz', 'mailchimp', 'constant-contact'],
  'education-studies': ['gemini-notebook', 'learnworlds-ai', 'heights-platform-ai', 'det-practice'],
  'extensions-chatgpt': ['harpa-ai', 'merlin-ai'],
  'face-swap-deepfake': ['d-id', 'vidnoz-ai'],
  fashion: ['the-new-black-ai'],
  'files-spreadsheets': ['coda-ai', 'chatpdf', 'humata', 'gemini-notebook'],
  finance: ['quickbooks-ai', 'xero-ai'],
  'future-tools': ['chatgpt-images', 'gemini-notebook', 'claude-science', 'google-flow', 'claude-design', 'openai-codex'],
  games: ['scenario-ai', 'character-ai'],
  'github-projects': ['openai-codex', 'github-copilot', 'hugging-face', 'codet5'],
  healthcare: ['claude-science', 'viseur-ai'],
  'image-editing': ['chatgpt-images', 'adobe-firefly', 'remove-bg', 'cleanup-pictures', 'upscale-media'],
  'image-generators': ['chatgpt-images', 'midjourney', 'ideogram', 'krea', 'recraft', 'adobe-firefly', 'leonardo-ai', 'stable-diffusion'],
  'latest-ai': ['chatgpt-images', 'gemini-notebook', 'claude-science', 'google-flow', 'claude-design', 'openai-codex'],
  'legal-assistants': ['harvey-ai'],
  'life-assistants': ['pi-ai', 'replika', 'todoist'],
  'llm-models': ['hugging-face', 'openrouter', 'google-ai-studio', 'openai-playground'],
  'logo-creation': ['logoai', 'looka', 'canva-ai'],
  marketing: ['adcreative-ai', 'jasper-ai', 'hubspot-ai', 'mailchimp', 'semrush'],
  memory: ['gemini-notebook', 'notion-ai', 'coda-ai'],
  music: ['suno-ai', 'udio', 'aiva', 'boomy', 'soundverse'],
  'no-code-low-code': ['lovable-dev', 'figma-make', 'bubble-ai', 'super-so'],
  presentation: ['gamma', 'beautiful-ai', 'napkin-ai', 'claude-design', 'gemini-notebook'],
  productivity: ['notion-ai', 'fathom', 'clickup', 'todoist', 'coda-ai', 'gemini-notebook'],
  programmation: ['openai-codex', 'cursor', 'github-copilot', 'tabnine'],
  'prompts-aids': ['openai-playground', 'google-ai-studio', 'poe-by-quora'],
  'real-estate-architect': ['planner-5d-ai'],
  'research-science': ['claude-science', 'gemini-notebook', 'elicit', 'consensus', 'scispace'],
  'robots-and-devices': ['nvidia-isaac-sim'],
  'sales-conversion': ['salesforce-einstein', 'hubspot-ai', 'thoughtly'],
  'search-engine': ['perplexity', 'you-com', 'phind', 'bing-ai'],
  seo: ['surfer-seo', 'semrush', 'ahrefs', 'marketmuse', 'frase'],
  'social-networks': ['postwise', 'typefully', 'vista-social', 'hootsuite-insights'],
  'storytelling-generator': ['chatgpt', 'claude', 'jasper-ai'],
  summarizer: ['gemini-notebook', 'chatpdf', 'humata', 'quillbot'],
  supertools: ['chatgpt', 'claude', 'gemini', 'perplexity', 'google-flow'],
  'text-generators': ['chatgpt', 'claude', 'jasper-ai', 'copy-ai', 'writesonic'],
  'text-to-speech': ['elevenlabs', 'speechify', 'murf-ai', 'naturalreader'],
  'text-to-video': ['google-flow', 'kling-ai', 'runway-ml', 'luma-dream-machine', 'pika-labs'],
  'this-does-not-exist': ['this-x-does-not-exist'],
  transcriber: ['otter-ai', 'fireflies-ai', 'deepgram', 'assemblyai'],
  translation: ['gemini', 'chatgpt', 'elevenlabs'],
  travel: ['mindtrip'],
  'video-editing': ['descript', 'google-flow', 'opusclip', 'veed-ai-video', 'clipchamp'],
  'video-generators': ['google-flow', 'kling-ai', 'runway-ml', 'synthesia', 'heygen', 'luma-dream-machine'],
  'voice-cloning': ['elevenlabs', 'resemble-ai', 'murf-ai', 'speechify'],
  'websites-design': ['figma-make', 'lovable-dev', 'bubble-ai', 'uizard', 'divi-ai'],
  'writing-web-seo': ['jasper-ai', 'surfer-seo', 'frase', 'writesonic', 'marketmuse'],
};

export function getToolsForCategory(categorySlug: string, allTools: Tool[] = []): { category: CategoryInfo; tools: Tool[] } {
  const category = getCategoryBySlug(categorySlug) || ALL_CATEGORIES[0];
  const bySlug = new Map(allTools.map((tool) => [tool.slug, tool]));
  const picks = CATEGORY_TOOL_SLUGS[categorySlug] || [];
  const curated = picks.flatMap((slug) => {
    const tool = bySlug.get(slug);
    return tool ? [tool] : [];
  });
  const seen = new Set(curated.map((tool) => tool.slug));
  const editorialOnly = new Set(['latest-ai', 'future-tools', 'aixploria-selection', 'amazing', 'supertools']);
  const related = editorialOnly.has(categorySlug) ? [] : allTools.filter((tool) => {
    if (seen.has(tool.slug)) return false;
    const label = tool.category.toLowerCase();
    return label === category.name.toLowerCase() || category.keywords.some((keyword) =>
      keyword.length >= 5 && label.includes(keyword.toLowerCase())
    );
  });
  return { category, tools: [...curated, ...related] };
}
