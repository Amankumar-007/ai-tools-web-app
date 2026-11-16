// Fetch public YouTube search metadata. Run with: node scripts/fetch-ai-videos.cjs
// The output contains links and metadata only; it does not download videos.
const fs = require('node:fs');
const path = require('node:path');

const TARGET = 1000;
const OUT = path.join(__dirname, '..', 'public', 'data', 'ai-videos.json');
const SAMPLE = process.argv.includes('--sample');

const topics = [
  ['ChatGPT', ['ChatGPT tutorial for beginners', 'ChatGPT advanced workflows guide', 'ChatGPT prompts practical tutorial']],
  ['Claude', ['Claude AI tutorial for beginners', 'Claude coding and projects tutorial', 'Claude AI practical workflows']],
  ['Gemini', ['Google Gemini tutorial for beginners', 'Gemini AI productivity tutorial', 'Google AI Studio Gemini tutorial']],
  ['Perplexity', ['Perplexity AI tutorial research', 'Perplexity AI search guide', 'Perplexity deep research tutorial']],
  ['AI Coding', ['AI coding tools tutorial', 'build app with AI coding agent tutorial', 'AI coding assistant workflow']],
  ['Cursor', ['Cursor AI tutorial beginners', 'Cursor agent mode coding tutorial', 'Cursor AI build app walkthrough']],
  ['GitHub Copilot', ['GitHub Copilot tutorial beginners', 'GitHub Copilot agent coding guide', 'Copilot VS Code practical tutorial']],
  ['AI Agents', ['AI agents tutorial beginners', 'build AI agent step by step', 'AI agent tools practical guide']],
  ['n8n Automation', ['n8n AI workflow tutorial', 'n8n AI agent beginner guide', 'n8n automation real examples']],
  ['Image Generation', ['AI image generation tutorial', 'AI image prompting guide', 'best AI image workflows tutorial']],
  ['Midjourney', ['Midjourney tutorial beginners', 'Midjourney image prompting guide', 'Midjourney advanced workflows']],
  ['Stable Diffusion', ['Stable Diffusion tutorial beginners', 'ComfyUI workflow tutorial', 'Stable Diffusion image generation guide']],
  ['AI Video', ['AI video generation tutorial', 'text to video AI workflow', 'image to video AI tutorial']],
  ['Runway', ['Runway AI video tutorial', 'Runway video generation guide', 'Runway AI editing workflow']],
  ['Voice & Audio', ['AI voice generation tutorial', 'ElevenLabs tutorial beginners', 'AI audio editing workflow']],
  ['AI Music', ['Suno AI tutorial beginners', 'AI music generation guide', 'Udio AI music tutorial']],
  ['Design', ['AI design tools tutorial', 'Canva AI tutorial practical', 'Figma AI design workflow']],
  ['Presentations', ['AI presentation maker tutorial', 'Gamma AI presentation guide', 'AI pitch deck workflow']],
  ['Productivity', ['AI productivity workflow tutorial', 'Notion AI tutorial practical', 'AI personal assistant workflow']],
  ['Research', ['AI research tools tutorial', 'NotebookLM tutorial research', 'AI literature review workflow']],
  ['Data Analysis', ['AI data analysis tutorial', 'ChatGPT data analysis practical guide', 'AI spreadsheet analysis workflow']],
  ['Marketing', ['AI marketing workflow tutorial', 'AI content marketing practical guide', 'AI social media workflow']],
  ['SEO', ['AI SEO tutorial practical', 'AI keyword research workflow', 'AI content SEO guide']],
  ['Education', ['AI teaching tools tutorial', 'AI study workflow students', 'AI tutor practical guide']],
  ['Business', ['AI business workflow tutorial', 'AI small business automation', 'AI customer support workflow tutorial']],
  ['AI Writing', ['AI writing assistant tutorial', 'write better with AI step by step', 'AI copywriting practical workflow']],
  ['AI Search', ['AI search tools tutorial', 'AI search engine comparison guide', 'AI web search research workflow']],
  ['App Building', ['build an app with AI tutorial', 'AI app builder beginner walkthrough', 'no code AI app building guide']],
  ['Translation', ['AI translation tools tutorial', 'translate documents with AI workflow', 'AI multilingual content guide']],
  ['AI Ethics', ['AI ethics practical guide', 'responsible AI workflow tutorial', 'AI bias evaluation tutorial']],
];

const relevance = {
  ChatGPT: /chatgpt/i,
  Claude: /claude/i,
  Gemini: /gemini|google ai studio/i,
  Perplexity: /perplexity/i,
  'AI Coding': /\b(code|coding|programming|developer|software|app builder|build an app|build a website|web development)\b/i,
  Cursor: /\bcursor\b/i,
  'GitHub Copilot': /github copilot|copilot.*(code|vs code|vscode|github)/i,
  'AI Agents': /\bagents?\b|agentic/i,
  'n8n Automation': /\bn8n\b/i,
  'Image Generation': /image|photo|illustrat|\bart\b|midjourney|ideogram|firefly|flux|comfyui/i,
  Midjourney: /midjourney/i,
  'Stable Diffusion': /stable diffusion|comfyui|automatic1111/i,
  'AI Video': /video|filmmaking|text.to.video|image.to.video|\bveo\b|\bkling\b|runway|\bsora\b/i,
  Runway: /runway (ai|ml|gen)|runwayml/i,
  'Voice & Audio': /voice|audio|speech|elevenlabs|podcast|sound/i,
  'AI Music': /suno|udio|music|song/i,
  Design: /design|figma|canva|graphic|ux|ui\/ux/i,
  Presentations: /presentation|slides|\bppt\b|gamma|pitch deck/i,
  Productivity: /productivity|notion|assistant|workflow|automation/i,
  Research: /research|notebooklm|paper|literature|perplexity/i,
  'Data Analysis': /data|analytics|spreadsheet|excel|sheets|dashboard|\bsql\b/i,
  Marketing: /marketing|ads|social media|content|copywriting|lead generation/i,
  SEO: /\bseo\b|\bgeo\b|keyword|search engine optimization/i,
  Education: /study|student|learn|teaching|school|education|tutor/i,
  Business: /business|startup|entrepreneur|sales|customer support/i,
  'AI Writing': /writing|writer|copywriting|jasper|rytr|blog|article/i,
  'AI Search': /search|perplexity|research/i,
  'App Building': /\bapp\b|website|builder|no.code/i,
  Translation: /translat|multilingual|language/i,
  'AI Ethics': /ethic|responsib|bias|fairness|safety/i,
};

function isRelevant(video) {
  return (relevance[video.category] || /\bai\b/i).test(video.title);
}

function getText(value) {
  if (!value) return '';
  return value.simpleText || value.runs?.map((run) => run.text).join('') || '';
}

function durationSeconds(text) {
  if (!/^\d{1,2}(:\d{2}){1,2}$/.test(text)) return 0;
  return text.split(':').reduce((seconds, part) => seconds * 60 + Number(part), 0);
}

function extractInitialData(html) {
  const marker = 'var ytInitialData = ';
  const start = html.indexOf(marker);
  if (start < 0) throw new Error('YouTube did not return search data');
  const jsonStart = start + marker.length;
  const end = html.indexOf(';</script>', jsonStart);
  if (end < 0) throw new Error('Could not find the end of search data');
  return JSON.parse(html.slice(jsonStart, end));
}

function collectVideos(value, output = []) {
  if (!value || typeof value !== 'object') return output;
  if (value.videoRenderer) output.push(value.videoRenderer);
  for (const child of Object.values(value)) if (child && typeof child === 'object') collectVideos(child, output);
  return output;
}

async function fetchQuery(category, query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TomatoToolVideoCatalog/1.0)', 'Accept-Language': 'en-US,en;q=0.9' },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const renderers = collectVideos(extractInitialData(await response.text()));
      return renderers.map((item) => {
        const videoId = item.videoId;
        const title = getText(item.title).trim();
        const author = getText(item.ownerText || item.longBylineText || item.shortBylineText).trim();
        const duration = getText(item.lengthText || item.thumbnailOverlays?.find((overlay) => overlay.thumbnailOverlayTimeStatusRenderer)?.thumbnailOverlayTimeStatusRenderer?.text);
        const seconds = durationSeconds(duration);
        if (!/^[\w-]{11}$/.test(videoId || '') || !title || !author || seconds < 120) return null;
        return { videoId, title, author, category, duration, thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, published: getText(item.publishedTimeText) };
      }).filter((video) => video && isRelevant(video));
    } catch (error) {
      if (attempt === 2) { console.error(`${category}: ${query}: ${error.message}`); return []; }
      await new Promise((resolve) => setTimeout(resolve, 900 * (attempt + 1)));
    }
  }
  return [];
}

async function main() {
  const jobs = topics.flatMap(([category, queries]) => [...queries, `${category} AI full course 2026`].map((query) => [category, query]));
  const topUp = process.argv.includes('--top-up');
  const audit = process.argv.includes('--audit');
  const extraJobs = topics.flatMap(([category, queries]) => [
    [category, `${queries[0]} 2026`],
    [category, `${category} step by step guide 2025`],
    [category, `${category} real examples tutorial`],
  ]);
  const selectedJobs = SAMPLE ? jobs.slice(0, 2) : topUp ? extraJobs : jobs;
  const videos = (topUp || audit) && fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')).filter(isRelevant).map((video) => ({ ...video, thumbnail: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg` })) : [];
  const seen = new Set(videos.map((video) => video.videoId));
  if (audit) { console.log(`${videos.length} relevant videos of ${JSON.parse(fs.readFileSync(OUT, 'utf8')).length}`); return; }
  for (let i = 0; i < selectedJobs.length; i += 4) {
    const batch = selectedJobs.slice(i, i + 4);
    const results = await Promise.all(batch.map(([category, query]) => fetchQuery(category, query)));
    for (const result of results) for (const video of result) {
      if (seen.has(video.videoId)) continue;
      seen.add(video.videoId);
      videos.push(video);
    }
    console.log(`${Math.min(i + 4, selectedJobs.length)}/${selectedJobs.length} searches, ${videos.length} unique videos`);
    if (videos.length >= TARGET) break;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  if (SAMPLE) { console.log(videos.slice(0, 3)); return; }
  if (videos.length < 100) throw new Error(`Only ${videos.length} videos fetched; keeping the existing catalog`);
  const selected = videos.slice(0, TARGET);
  fs.writeFileSync(OUT, `${JSON.stringify(selected, null, 2)}\n`);
  console.log(`Saved ${selected.length} verified video IDs to ${OUT}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
