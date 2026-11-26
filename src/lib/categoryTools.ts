import { ALL_CATEGORIES, type CategoryInfo, getCategoryBySlug } from './categories';
import type { Tool } from '@/app/(routes)/ai-tools/AIToolsDirectoryClient';

// Editorial order for the directory. Slugs must exist in public/data/ai-tools.json.
// A category stays empty when there is no relevant real tool in the catalog.
export const CATEGORY_TOOL_SLUGS: Record<string, string[]> = {
  '3d-model': ['tripo-ai', 'scenario-ai', 'spline-design', 'meshy-ai', 'hyper3d-rodin', 'hunyuan3d', 'world-labs-marble'],
  'ai-agents': ['openai-codex', 'manus', 'cursor', 'n8n', 'zapier', 'perplexity-comet', 'chatgpt-atlas', 'microsoft-copilot-studio', 'llamaindex', 'langchain', 'claude-code', 'kiro', 'google-antigravity', 'jetbrains-air', 'devin-ai', 'factory-ai', 'genspark', 'lindy-ai', 'relevance-ai', 'crewai', 'dify-ai', 'flowise', 'langflow', 'gumloop', 'browserbase', 'browser-use', 'taskade'],
  'ai-characters': ['character-ai', 'replika', 'waifu-labs'],
  'ai-chat-assistant': ['chatgpt', 'claude', 'gemini', 'grok', 'perplexity', 'poe-by-quora', 'deepseek', 'mistral-le-chat', 'meta-ai', 'qwen-chat', 'kimi-ai', 'z-ai-glm'],
  'ai-detection': ['copyleaks', 'brandwell-ai-detector', 'gptzero', 'originality-ai', 'winston-ai'],
  'ai-simulation': ['nvidia-isaac-sim'],
  'ai-useful': ['chatgpt', 'claude', 'gemini-notebook', 'perplexity', 'notion-ai'],
  'aixploria-selection': ['chatgpt', 'claude', 'cursor', 'midjourney', 'elevenlabs'],
  amazing: ['chatgpt-images', 'google-flow', 'claude-design', 'tripo-ai'],
  art: ['midjourney', 'chatgpt-images', 'adobe-firefly', 'leonardo-ai', 'flux-black-forest-labs', 'nano-banana-2', 'dreamina', 'playground-ai', 'lexica-art', 'ludo-ai', 'layer-ai'],
  'assistant-code': ['openai-codex', 'cursor', 'github-copilot', 'replit', 'amazon-codewhisperer', 'claude-code', 'kiro', 'google-antigravity', 'gemini-cli', 'jetbrains-air', 'opencode', 'cline', 'aider', 'zed-editor', 'trae-ai', 'devin-ai', 'factory-ai', 'bolt-new', 'v0-dev', 'qodo', 'coderabbit'],
  'assistive-technology': ['speechify', 'naturalreader', 'letterly', 'be-my-eyes'],
  'audio-editing': ['descript', 'krisp', 'podcastle', 'riverside-fm', 'stable-audio', 'kits-ai', 'moises-ai', 'lalal-ai', 'adobe-podcast', 'auphonic', 'cleanvoice-ai'],
  automation: ['n8n', 'zapier', 'make-integromat', 'ifttt', 'lindy-ai', 'relevance-ai', 'gumloop', 'activepieces', 'pipedream', 'taskade', 'clay-com'],
  avatars: ['heygen', 'synthesia', 'd-id', 'vidnoz-ai', 'captions-app'],
  business: ['chatgpt', 'claude', 'notion-ai', 'hubspot-ai', 'gamma', 'microsoft-copilot-studio', 'cohere', 'relevance-ai', 'layer-ai', 'glean', 'writer-ai', 'pitch-com', 'thoughtspot', 'gong', 'typeface-ai', 'rogo-ai'],
  chatbots: ['chatgpt', 'character-ai', 'poe-by-quora', 'chatplayground-ai', 'deepseek', 'mistral-le-chat', 'meta-ai', 'qwen-chat', 'kimi-ai', 'intercom-fin', 'sierra-ai', 'decagon', 'zendesk-ai', 'tidio', 'chatbase', 'voiceflow'],
  'customer-support': ['help-scout-ai', 'hubspot-ai', 'thoughtly', 'intercom-fin', 'sierra-ai', 'decagon', 'zendesk-ai', 'tidio', 'chatbase', 'voiceflow'],
  'data-analytics': ['datarobot', 'h2o-ai', 'obviously-ai', 'coda-ai', 'pinecone', 'roboflow', 'better-analyst', 'rows-com', 'julius-ai', 'hex', 'powerdrill-ai', 'thoughtspot'],
  'dating-relationships': ['replika', 'character-ai'],
  'developer-tools': ['google-ai-studio', 'openai-playground', 'openai-codex', 'openrouter', 'hugging-face', 'ollama', 'lm-studio', 'together-ai', 'groq', 'fireworks-ai', 'replicate', 'cohere', 'modal-labs', 'pinecone', 'llamaindex', 'langchain', 'roboflow', 'vercel-ai-sdk', 'claude-code', 'kiro', 'google-antigravity', 'gemini-cli', 'jetbrains-air', 'zed-editor', 'qodo', 'coderabbit', 'crewai', 'dify-ai', 'pipedream', 'browserbase', 'browser-use', 'flux-black-forest-labs', 'cartesia', 'speechmatics', 'inworld-ai', 'exa-ai', 'tavily'],
  'e-commerce': ['ppspy', 'adcreative-ai', 'joggai', 'photoroom', 'pixelcut', 'hypotenuse-ai', 'tidio', 'klaviyo-ai', 'botika-ai', 'fashn-ai'],
  'e-mail': ['snoooz', 'mailchimp', 'constant-contact', 'superhuman-mail', 'shortwave', 'fyxer-ai', 'klaviyo-ai'],
  'education-studies': ['gemini-notebook', 'learnworlds-ai', 'heights-platform-ai', 'det-practice', 'notegpt', 'mindgrasp-ai', 'gptzero', 'winston-ai', 'khanmigo', 'magicschool-ai', 'brisk-teaching', 'studyfetch', 'speak-ai'],
  'extensions-chatgpt': ['harpa-ai', 'merlin-ai'],
  'face-swap-deepfake': ['d-id', 'vidnoz-ai'],
  fashion: ['the-new-black-ai', 'botika-ai', 'fashn-ai'],
  'files-spreadsheets': ['coda-ai', 'chatpdf', 'humata', 'gemini-notebook', 'better-analyst', 'rows-com', 'julius-ai', 'powerdrill-ai'],
  finance: ['quickbooks-ai', 'xero-ai', 'alphasense', 'rogo-ai', 'cleo-ai'],
  'future-tools': ['chatgpt-images', 'gemini-notebook', 'claude-science', 'google-flow', 'claude-design', 'openai-codex'],
  games: ['scenario-ai', 'character-ai', 'meshy-ai', 'hyper3d-rodin', 'hunyuan3d', 'world-labs-marble', 'ludo-ai'],
  'github-projects': ['openai-codex', 'github-copilot', 'hugging-face', 'codet5', 'ollama', 'llamaindex', 'langchain', 'vercel-ai-sdk', 'gemini-cli', 'opencode', 'cline', 'aider', 'coderabbit', 'crewai', 'dify-ai', 'flowise', 'langflow', 'activepieces', 'browser-use', 'hunyuan3d'],
  healthcare: ['claude-science', 'viseur-ai', 'openevidence', 'abridge', 'nabla', 'ada-health'],
  'image-editing': ['chatgpt-images', 'adobe-firefly', 'remove-bg', 'cleanup-pictures', 'upscale-media', 'nano-banana-2', 'clipdrop', 'photoroom', 'pixelcut', 'topaz-labs', 'magnific-ai', 'remini'],
  'image-generators': ['chatgpt-images', 'midjourney', 'ideogram', 'krea', 'recraft', 'adobe-firefly', 'leonardo-ai', 'stable-diffusion', 'flux-black-forest-labs', 'nano-banana-2', 'dreamina', 'playground-ai', 'lexica-art', 'clipdrop', 'magnific-ai', 'layer-ai'],
  'latest-ai': ['chatgpt-images', 'gemini-notebook', 'claude-science', 'google-flow', 'claude-design', 'openai-codex', 'chatgpt-atlas', 'google-antigravity', 'jetbrains-air', 'nano-banana-2', 'google-veo', 'google-flow-music', 'world-labs-marble'],
  'legal-assistants': ['harvey-ai', 'legora', 'spellbook-legal'],
  'life-assistants': ['pi-ai', 'replika', 'todoist', 'motion-app', 'reclaim-ai', 'ada-health', 'cleo-ai', 'layla-ai'],
  'llm-models': ['hugging-face', 'openrouter', 'google-ai-studio', 'openai-playground', 'deepseek', 'mistral-le-chat', 'qwen-chat', 'kimi-ai', 'z-ai-glm', 'ollama', 'lm-studio', 'together-ai', 'groq', 'fireworks-ai', 'replicate', 'cohere'],
  'logo-creation': ['logoai', 'looka', 'canva-ai', 'playground-ai', 'brandmark-io', 'namelix'],
  marketing: ['adcreative-ai', 'jasper-ai', 'hubspot-ai', 'mailchimp', 'semrush', 'namelix', 'anyword', 'clay-com', 'apollo-io', 'profound-ai', 'predis-ai', 'buffer', 'klaviyo-ai', 'typeface-ai'],
  memory: ['gemini-notebook', 'notion-ai', 'coda-ai', 'recall-ai', 'readwise-reader', 'mem-ai'],
  music: ['suno-ai', 'udio', 'aiva', 'boomy', 'soundverse', 'google-flow-music', 'mureka', 'stable-audio', 'kits-ai', 'moises-ai', 'lalal-ai'],
  'no-code-low-code': ['lovable-dev', 'figma-make', 'bubble-ai', 'super-so', 'microsoft-copilot-studio', 'bolt-new', 'v0-dev', 'base44', 'dify-ai', 'flowise', 'langflow', 'gumloop', 'activepieces', 'framer-ai', 'voiceflow'],
  presentation: ['gamma', 'beautiful-ai', 'napkin-ai', 'claude-design', 'gemini-notebook', 'pitch-com', 'prezi-ai', 'slidesai'],
  productivity: ['notion-ai', 'fathom', 'clickup', 'todoist', 'coda-ai', 'gemini-notebook', 'perplexity-comet', 'chatgpt-atlas', 'dia-browser', 'genspark', 'lindy-ai', 'wispr-flow', 'notta', 'readwise-reader', 'granola', 'tldv', 'read-ai', 'mem-ai', 'taskade', 'motion-app', 'reclaim-ai', 'superhuman-mail', 'shortwave', 'fyxer-ai', 'glean'],
  programmation: ['openai-codex', 'cursor', 'github-copilot', 'tabnine', 'claude-code', 'kiro', 'google-antigravity', 'gemini-cli', 'jetbrains-air', 'opencode', 'cline', 'aider', 'zed-editor', 'trae-ai', 'devin-ai', 'factory-ai'],
  'prompts-aids': ['openai-playground', 'google-ai-studio', 'poe-by-quora', 'lexica-art'],
  'real-estate-architect': ['planner-5d-ai', 'interior-ai', 'roomgpt', 'maket-ai'],
  'research-science': ['claude-science', 'gemini-notebook', 'elicit', 'consensus', 'scispace', 'felo-ai', 'undermind-ai', 'semantic-scholar', 'openevidence', 'glasp', 'alphasense'],
  'robots-and-devices': ['nvidia-isaac-sim'],
  'sales-conversion': ['salesforce-einstein', 'hubspot-ai', 'thoughtly', 'tldv', 'clay-com', 'apollo-io', 'gong'],
  'search-engine': ['perplexity', 'you-com', 'phind', 'bing-ai', 'perplexity-comet', 'dia-browser', 'genspark', 'exa-ai', 'tavily', 'kagi', 'felo-ai', 'glean'],
  seo: ['surfer-seo', 'semrush', 'ahrefs', 'marketmuse', 'frase', 'originality-ai', 'clearscope', 'profound-ai'],
  'social-networks': ['postwise', 'typefully', 'vista-social', 'hootsuite-insights', 'captions-app', 'vizard-ai', 'capcut', 'lumen5', 'predis-ai', 'buffer'],
  'storytelling-generator': ['chatgpt', 'claude', 'jasper-ai', 'sudowrite', 'novelai'],
  summarizer: ['gemini-notebook', 'chatpdf', 'humata', 'quillbot', 'glasp', 'notegpt', 'recall-ai', 'readwise-reader', 'mindgrasp-ai', 'studyfetch'],
  supertools: ['chatgpt', 'claude', 'gemini', 'perplexity', 'google-flow'],
  'text-generators': ['chatgpt', 'claude', 'jasper-ai', 'copy-ai', 'writesonic', 'writer-ai', 'sudowrite', 'novelai', 'wordtune', 'prowritingaid', 'anyword', 'hypotenuse-ai'],
  'text-to-speech': ['elevenlabs', 'speechify', 'murf-ai', 'naturalreader', 'fliki', 'cartesia', 'fish-audio', 'wellsaid-labs', 'inworld-ai'],
  'text-to-video': ['google-flow', 'kling-ai', 'runway-ml', 'luma-dream-machine', 'pika-labs', 'google-veo', 'hailuo-ai', 'wan-video', 'higgsfield-ai', 'ltx-studio', 'pixverse', 'vidu', 'moonvalley', 'pictory', 'fliki', 'lumen5'],
  'this-does-not-exist': ['this-x-does-not-exist'],
  transcriber: ['otter-ai', 'fireflies-ai', 'deepgram', 'assemblyai', 'auphonic', 'wispr-flow', 'notta', 'sonix-ai', 'happy-scribe', 'speechmatics', 'granola', 'tldv', 'read-ai'],
  translation: ['gemini', 'chatgpt', 'elevenlabs', 'rask-ai', 'sonix-ai', 'happy-scribe', 'languagetool', 'deepl'],
  travel: ['mindtrip', 'layla-ai'],
  'video-editing': ['descript', 'google-flow', 'opusclip', 'veed-ai-video', 'clipchamp', 'topaz-labs', 'ltx-studio', 'captions-app', 'vizard-ai', 'capcut', 'filmora', 'pictory', 'fliki', 'lumen5', 'rask-ai'],
  'video-generators': ['google-flow', 'kling-ai', 'runway-ml', 'synthesia', 'heygen', 'luma-dream-machine', 'dreamina', 'google-veo', 'hailuo-ai', 'wan-video', 'higgsfield-ai', 'ltx-studio', 'pixverse', 'vidu', 'moonvalley'],
  'voice-cloning': ['elevenlabs', 'resemble-ai', 'murf-ai', 'speechify', 'kits-ai', 'cartesia', 'fish-audio'],
  'websites-design': ['figma-make', 'lovable-dev', 'bubble-ai', 'uizard', 'divi-ai', 'bolt-new', 'v0-dev', 'base44', 'framer-ai', 'spline-design'],
  'writing-web-seo': ['jasper-ai', 'surfer-seo', 'frase', 'writesonic', 'marketmuse', 'wordtune', 'languagetool', 'prowritingaid', 'anyword', 'hypotenuse-ai', 'clearscope'],
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
