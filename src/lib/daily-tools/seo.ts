import { SITE_URL } from '@/metadata-utils';
import type { DailyTool } from './registry';

/**
 * Everything the Daily Tools pages say about themselves to search engines and answer engines (Google, Bing, ChatGPT,
 * Perplexity, Gemini, Claude...): titles, the "at a glance" facts, structured data, and the text of /llms.txt.
 * One place, so a page, its schema, the sitemap and llms.txt can never disagree.
 *
 * TOOLS_UPDATED is shown on every tool page and used as the sitemap's last-modified date. Bump it whenever a tool's
 * behaviour or copy really changes; do not bump it for nothing (a false freshness signal is worse than none).
 */

export const TOOLS_UPDATED = '2026-11-25';
export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;

export const toolUrl = (slug: string) => `${SITE_URL}/tools/${slug}`;
/** The share card of a tool (see app/og/tools/[slug]/route.tsx): a stable address, made at build time. */
export const toolImageUrl = (slug: string) => `${SITE_URL}/og/tools/${slug}`;
export const hubImageUrl = `${SITE_URL}/og/tools`;

export function formatUpdated(iso: string = TOOLS_UPDATED): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Page title (the site name is added after it). Short, with the real promise of the tool: free, and where it runs. */
export function toolTitle(tool: DailyTool): string {
  const promise = tool.kind === 'ai' ? 'Free AI Tool' : tool.kind === 'online' ? 'Free, No Sign-in' : 'Free, No Upload';
  return `${tool.name}: ${promise}`;
}

const LANGUAGES = 'English, Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi and Urdu';

export interface Fact { label: string; value: string }

/** The short, quotable facts about a tool. Each one is true for that kind of tool by construction. */
export function keyFacts(tool: DailyTool): Fact[] {
  const privacy = tool.kind === 'local'
    ? 'Everything runs in your browser. Your files and text are never uploaded.'
    : tool.kind === 'online'
      ? 'Only the post link is sent to our server. The video downloads straight from the platform to your device.'
      : 'Your text is sent to an AI service to write the answer. Nothing is posted anywhere.';
  return [
    { label: 'Price', value: tool.kind === 'ai' ? 'Free to try with a free account (daily allowance)' : 'Free, with no limits' },
    { label: 'Sign-in', value: tool.kind === 'ai' ? 'Free account required' : 'Not required' },
    { label: 'Your data', value: privacy },
    { label: 'Works on', value: 'Any modern browser (Chrome, Edge, Safari, Firefox), on phone or computer' },
    { label: 'Languages', value: tool.kind === 'ai' ? LANGUAGES : 'English' },
    { label: 'Category', value: tool.category },
    { label: 'Last updated', value: formatUpdated() },
  ];
}

const APP_CATEGORY = (tool: DailyTool) =>
  tool.category === 'Money' ? 'FinanceApplication'
    : tool.category === 'Health & Fitness' ? 'HealthApplication'
      : tool.category === 'Creator & Business' || tool.category === 'Career & Resume' ? 'BusinessApplication'
        : tool.category === 'Media & Documents' ? 'MultimediaApplication'
          : 'UtilitiesApplication';

/**
 * One linked graph per tool page: the page, the web application it offers, how to use it, and the breadcrumb.
 * (The FAQ is emitted next to the visible FAQ by ToolPageAbout, so it appears exactly once.)
 * Nothing here is invented: no ratings, no review counts, no prices other than free.
 */
export function toolGraph(tool: DailyTool) {
  const url = toolUrl(tool.slug);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: `${toolTitle(tool)} | TomatoAi`,
        description: tool.description,
        inLanguage: 'en-IN',
        isPartOf: { '@id': SITE_ID },
        about: { '@id': `${url}#app` },
        mainEntity: { '@id': `${url}#app` },
        primaryImageOfPage: { '@type': 'ImageObject', url: toolImageUrl(tool.slug), width: 1200, height: 630 },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        dateModified: TOOLS_UPDATED,
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
      },
      {
        '@type': 'WebApplication',
        '@id': `${url}#app`,
        name: tool.name,
        description: tool.description,
        url,
        applicationCategory: APP_CATEGORY(tool),
        applicationSubCategory: tool.category,
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript. Works in current Chrome, Edge, Safari and Firefox.',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', availability: 'https://schema.org/InStock', url },
        featureList: tool.edge,
        keywords: tool.keywords.join(', '),
        inLanguage: tool.kind === 'ai' ? ['en', 'hi'] : 'en',
        countriesSupported: 'IN',
        audience: { '@type': 'Audience', audienceType: 'Anyone who needs this done quickly, built with people in India in mind', geographicArea: { '@type': 'Country', name: 'India' } },
        publisher: { '@id': ORG_ID },
        dateModified: TOOLS_UPDATED,
      },
      {
        '@type': 'HowTo',
        '@id': `${url}#howto`,
        name: `How to use the ${tool.name}`,
        description: tool.tagline,
        step: tool.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Daily Tools', item: `${SITE_URL}/tools` },
          { '@type': 'ListItem', position: 3, name: tool.name, item: url },
        ],
      },
    ],
  };
}

// ── the hub page ─────────────────────────────────────────────────────

export const HUB_FAQS: Array<{ question: string; answer: string }> = [
  { question: 'Are these tools really free?', answer: 'Yes. Every tool is free to use. The tools that run in your browser have no limits at all. The AI tools are free with an account and use a daily allowance.' },
  { question: 'Are my files uploaded when I use the PDF, image, QR or invoice tools?', answer: 'No. Those tools work inside your browser, so contracts, photos and bank details stay on your device and are never sent to our servers.' },
  { question: 'Do I need to sign in?', answer: 'Not for the tools that run in your browser or the video downloaders. Only the AI tools (writing, planning and resume helpers) need a free account so the daily allowance can be counted fairly.' },
  { question: 'Do the tools work on a phone?', answer: 'Yes. Every tool is built to work on phones and computers in current versions of Chrome, Edge, Safari and Firefox.' },
  { question: 'Can the AI tools write in Hindi or Hinglish?', answer: 'Yes. Every AI tool can answer in English, Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi or Urdu.' },
  { question: 'Can I download videos from LinkedIn and X (Twitter)?', answer: 'Yes, from public posts that contain a video, if you made the video or have permission to save it. The tools never sign in, so private posts cannot be fetched.' },
];

export function hubGraph(tools: DailyTool[]) {
  const url = `${SITE_URL}/tools`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#webpage`,
        url,
        name: `${tools.length} Free Online Tools | TomatoAi`,
        description: 'Free tools that run in your browser: PDF to Word and Excel, favicon and QR code makers, image compressor, GST invoice with UPI QR, resume builder, video downloaders, planners, AI writers and calculators.',
        inLanguage: 'en-IN',
        isPartOf: { '@id': SITE_ID },
        mainEntity: { '@id': `${url}#list` },
        dateModified: TOOLS_UPDATED,
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#list`,
        numberOfItems: tools.length,
        itemListElement: tools.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: toolUrl(t.slug), description: t.tagline })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Daily Tools', item: url },
        ],
      },
    ],
  };
}

// ── llms.txt (a plain-text map of the site for AI assistants) ────────

const stripMd = (s: string) => s.replace(/\s+/g, ' ').trim();

export function llmsIndex(tools: DailyTool[], categories: Array<{ category: string; blurb: string; tools: DailyTool[] }>): string {
  const lines: string[] = [
    '# TomatoAi India',
    '',
    '> TomatoAi is an AI tools directory and a set of free everyday tools, built with people in India in mind. Most Daily Tools run in your browser (files are never uploaded) and need no sign-in: PDFs, images, QR codes, GST invoices, resumes, planners and calculators. The video downloaders need no sign-in either and download straight from the platform. The AI tools (writing, planning and resume helpers) need a free account and can answer in English, Hindi, Hinglish and nine other Indian languages.',
    '',
    `Last updated: ${TOOLS_UPDATED}. All Daily Tools are free to use. Facts below are written to be quoted: each tool page also has a short "At a glance" list and FAQs.`,
    '',
    `## Daily Tools (${tools.length} free tools)`,
    '',
    `- [All Daily Tools](${SITE_URL}/tools): the full list, searchable by name or task`,
  ];
  for (const c of categories) {
    if (c.tools.length === 0) continue;
    lines.push('', `### ${c.category}`, `${c.blurb}`, '');
    for (const t of c.tools) lines.push(`- [${t.name}](${toolUrl(t.slug)}): ${stripMd(t.description)}`);
  }
  lines.push(
    '',
    '## Other sections',
    '',
    `- [AI Tools Directory](${SITE_URL}/ai-tools): reviews, features and pricing of AI tools`,
    `- [Trending](${SITE_URL}/trending): trending AI tools and repositories`,
    `- [Prompts](${SITE_URL}/prompts): a library of ready-to-use prompts`,
    `- [Resume Analyzer](${SITE_URL}/resume-analyzer): check a resume against a job`,
    `- [Pricing](${SITE_URL}/pricing): plans for the AI chat and AI tools`,
    '',
    '## Optional',
    '',
    `- [Full text of every Daily Tool page](${SITE_URL}/llms-full.txt): descriptions, steps, facts and FAQs in one file`,
    '',
  );
  return lines.join('\n');
}

export function llmsFull(categories: Array<{ category: string; tools: DailyTool[] }>): string {
  const out: string[] = ['# TomatoAi Daily Tools: full text', '', `Source: ${SITE_URL}/tools. Last updated ${TOOLS_UPDATED}. Every tool below is free.`, ''];
  for (const c of categories) {
    for (const t of c.tools) {
      out.push(`## ${t.name}`, '', `URL: ${toolUrl(t.slug)}`, `Category: ${c.category}`, `Answer: ${stripMd(t.description)}`, '');
      for (const p of t.intro) out.push(stripMd(p), '');
      out.push('Key facts:');
      for (const f of keyFacts(t)) out.push(`- ${f.label}: ${f.value}`);
      out.push('', 'What makes it different:');
      for (const e of t.edge) out.push(`- ${e}`);
      out.push('', 'How to use it:');
      t.steps.forEach((s, i) => out.push(`${i + 1}. ${s.title}: ${stripMd(s.text)}`));
      out.push('', 'Frequently asked questions:');
      for (const f of t.faqs) out.push(`Q: ${f.question}`, `A: ${stripMd(f.answer)}`, '');
      out.push('---', '');
    }
  }
  return out.join('\n');
}
