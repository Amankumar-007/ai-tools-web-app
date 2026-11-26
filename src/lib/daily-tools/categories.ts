/**
 * Small, client-safe pieces of the Daily Tools catalogue: the kinds, the categories and the slim shapes the browser gets.
 * The full registry (long intro, steps and FAQ text for every tool) is server-only data: importing it into a client
 * component would ship all of that text to every visitor, so client code imports from here instead.
 */

export type ToolKind = 'ai' | 'local' | 'online';
export type ToolCategory = 'Media & Documents' | 'Career & Resume' | 'Creator & Business' | 'Write & Reply' | 'Money' | 'Health & Fitness' | 'Plan & Learn' | 'Everyday Utilities';

export const CATEGORY_ORDER: ToolCategory[] = ['Media & Documents', 'Career & Resume', 'Creator & Business', 'Write & Reply', 'Money', 'Health & Fitness', 'Plan & Learn', 'Everyday Utilities'];

export const CATEGORY_BLURB: Record<ToolCategory, string> = {
  'Media & Documents': 'Convert PDFs, make favicons and QR codes, compress images and save videos, all private and in your browser.',
  'Career & Resume': 'Design a resume, match it to a job post, polish your bullet points and write the cover letter.',
  'Creator & Business': 'Invoices, planners and LinkedIn tools for freelancers, creators and small businesses.',
  'Write & Reply': 'Emails, replies, letters, captions and translation, in your tone and your language.',
  Money: 'Loans, investments, GST, discounts and shared expenses, in rupees.',
  'Health & Fitness': 'Meal plans, workouts and body numbers that use Indian health guidelines.',
  'Plan & Learn': 'Trips and study schedules built around your dates, budget and goals.',
  'Everyday Utilities': 'Dates, units, passwords and text tools you reach for every week.',
};

/** What the hub page needs about one tool. Built on the server from the registry (see hub-data.ts). */
export interface HubTool {
  slug: string;
  name: string;
  tagline: string;
  category: ToolCategory;
  kind: ToolKind;
  icon: string;
  color: string;
  isNew: boolean;
  /** Position in the "Most useful" row, or null when not featured. */
  featuredRank: number | null;
  /** Lower-cased, accent-free text the search box matches against (name, tagline, category, keywords). */
  search: string;
}

/** What an AI tool needs to know about the other tools: for the "Send to…" menu and the hand-over message. */
export interface ToolPeer {
  slug: string;
  name: string;
  /** True when this AI tool can receive text from another tool. */
  handoff: boolean;
}
