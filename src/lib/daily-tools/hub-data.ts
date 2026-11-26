import { AI_SPECS } from './ai/forms';
import type { HubTool, ToolPeer } from './categories';
import { DAILY_TOOLS, FEATURED_SLUGS, NEW_SLUGS } from './registry';

/** Server-only: turns the full registry into the small objects client components receive as props. */

const fold = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

export function getHubTools(): HubTool[] {
  return DAILY_TOOLS.map((t) => {
    const rank = FEATURED_SLUGS.indexOf(t.slug);
    return {
      slug: t.slug, name: t.name, tagline: t.tagline, category: t.category, kind: t.kind, icon: t.icon, color: t.color,
      isNew: NEW_SLUGS.has(t.slug),
      featuredRank: rank >= 0 ? rank : null,
      search: fold(`${t.name} ${t.tagline} ${t.category} ${t.keywords.join(' ')}`),
    };
  });
}

export function getToolPeers(): ToolPeer[] {
  return DAILY_TOOLS.map((t) => ({ slug: t.slug, name: t.name, handoff: t.kind === 'ai' && Boolean(AI_SPECS[t.slug]?.handoffField) }));
}
