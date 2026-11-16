import {
  BarChart3, BookOpen, Bot, BriefcaseBusiness, Code2, FileText, GraduationCap,
  Headphones, Mail, Megaphone, MessageSquare, Mic, Newspaper, Search,
  ShoppingBag, Video, type LucideIcon,
} from 'lucide-react';

export interface AgentStep {
  id: string;
  title: string;
  description: string;
  actionType: 'setup' | 'code' | 'prompt' | 'deploy';
  content: string;
  toolName: string;
  toolUrl: string;
}

export interface AgentWorkflow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  outcome: string;
  icon: LucideIcon;
  color: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  prerequisites: string[];
  architecture: { trigger: string; brain: string; action: string };
  steps: AgentStep[];
}

type StepInput = [title: string, description: string, toolName: string, toolUrl: string, actionType: AgentStep['actionType'], content: string];
type WorkflowInput = Omit<AgentWorkflow, 'id' | 'steps'> & { steps: StepInput[] };

function guide(input: WorkflowInput): AgentWorkflow {
  return {
    ...input,
    id: input.slug,
    steps: input.steps.map(([title, description, toolName, toolUrl, actionType, content], index) => ({
      id: `${input.slug}-${index + 1}`, title, description, toolName, toolUrl, actionType, content,
    })),
  };
}

export const agentWorkflows: AgentWorkflow[] = [
  guide({
    slug: 'customer-support-agent', title: 'Support reply assistant', category: 'Support', icon: Headphones, color: 'from-blue-500 to-cyan-500', difficulty: 'Intermediate', estimatedTime: '1–2 hours',
    description: 'Turn incoming support messages into accurate draft replies grounded in your help docs.', outcome: 'A reviewable reply draft with a source link and escalation path.',
    prerequisites: ['A support inbox or ticket queue', 'Current help articles and policies', 'An n8n workspace and an AI model connection'],
    architecture: { trigger: 'New support ticket', brain: 'Retrieve relevant help content, then draft', action: 'Save a draft for human review' },
    steps: [
      ['Connect the inbox', 'Start with a new-message trigger and capture the customer request.', 'n8n', 'https://n8n.io', 'setup', 'Create a workflow with your inbox or ticket trigger. Capture the ticket ID, subject, message body, and reply address. Test it with a sample ticket before adding AI.'],
      ['Add trusted context', 'Search only your current support articles and policies.', 'n8n', 'https://n8n.io', 'setup', 'Store approved help articles in a searchable source. Retrieve the top relevant passages for each message. Pass the article title and URL with each passage so the reviewer can check the answer.'],
      ['Draft with boundaries', 'Give the model the message and retrieved passages.', 'OpenAI', 'https://platform.openai.com', 'prompt', 'Draft a concise, empathetic reply to [customer message] using only [retrieved help passages]. Cite the relevant article URL. If the passages do not answer the question, say what is missing and mark the ticket for a human. Do not promise refunds or account changes.'],
      ['Review and release', 'Save the answer as a draft and test uncertain cases.', 'n8n', 'https://n8n.io', 'deploy', 'Write the output to an internal note or draft, not an automatic public reply. Test a known question, an unknown question, and an urgent complaint. Confirm the draft cites the right policy and escalates when evidence is missing.'],
    ],
  }),
  guide({
    slug: 'research-agent', title: 'Source-backed research brief', category: 'Research', icon: Search, color: 'from-emerald-500 to-teal-500', difficulty: 'Intermediate', estimatedTime: '1–2 hours',
    description: 'Collect credible sources and turn them into a brief that separates evidence from inference.', outcome: 'A concise research brief with source links and open questions.',
    prerequisites: ['A research question and target audience', 'A web search tool', 'A place to save source links'],
    architecture: { trigger: 'Research question', brain: 'Search, compare, and synthesize sources', action: 'Publish a cited brief for review' },
    steps: [
      ['Frame the question', 'Define scope and the decision the research should support.', 'Claude', 'https://claude.ai', 'setup', 'Write the main question, audience, time period, geography, and what would count as a useful answer. Break the question into 3–5 subquestions before searching.'],
      ['Gather sources', 'Prefer primary documents and record metadata.', 'Perplexity', 'https://perplexity.ai', 'setup', 'Find at least two independent sources per major claim. Record the title, publisher, date, URL, and the specific passage used. Open the original pages to verify the search summary.'],
      ['Synthesize carefully', 'Ask for a brief grounded in the collected material.', 'Claude', 'https://claude.ai', 'prompt', 'Using only these sources: [paste excerpts and URLs], write a one-page brief answering [question]. Separate confirmed facts, reasonable inferences, conflicting evidence, and unanswered questions. Attach a URL to each factual claim.'],
      ['Check the brief', 'Verify citations and the most important numbers.', 'Perplexity', 'https://perplexity.ai', 'deploy', 'Open every cited URL and verify that it supports the sentence next to it. Check dates, units, and denominators. Remove unsupported claims and end with what evidence would change the conclusion.'],
    ],
  }),
  guide({
    slug: 'outbound-lead-agent', title: 'Thoughtful outreach drafts', category: 'Sales', icon: Mail, color: 'from-orange-500 to-rose-500', difficulty: 'Intermediate', estimatedTime: '1–2 hours',
    description: 'Research a small set of prospects and prepare personalized outreach for approval.', outcome: 'A reviewed outreach draft and a record of the source used.',
    prerequisites: ['A clear ideal customer profile', 'A small permission-appropriate prospect list', 'An email drafting tool'],
    architecture: { trigger: 'Prospect added to list', brain: 'Summarize public company context', action: 'Create a draft for review' },
    steps: [
      ['Define the audience', 'State who the offer helps and the problem it solves.', 'Google Sheets', 'https://sheets.google.com', 'setup', 'Create columns for company, role, public source URL, relevance, and draft status. Start with a small list you can check manually.'],
      ['Find a real reason to write', 'Use a public source for one specific observation.', 'Perplexity', 'https://perplexity.ai', 'setup', 'Read the company site or a recent public announcement. Save the exact URL and one factual observation. Skip the prospect if you cannot find a genuine connection to your offer.'],
      ['Draft the message', 'Keep the note short and make one clear ask.', 'ChatGPT', 'https://chatgpt.com', 'prompt', 'Write a 90-word outreach draft to [role] at [company]. Use only this verified observation: [observation and URL]. Our offer is [offer] and the relevant benefit is [benefit]. Use a direct tone, one clear question, and no invented familiarity or unsupported claims.'],
      ['Approve before sending', 'Verify details and record the decision.', 'Gmail', 'https://mail.google.com', 'deploy', 'Check the name, role, observation, link, and relevance. Edit the draft in your own voice, then send only if it fits your outreach rules. Record a sent or skipped status in the sheet.'],
    ],
  }),
  guide({
    slug: 'meeting-follow-up', title: 'Meeting to action plan', category: 'Productivity', icon: Mic, color: 'from-violet-500 to-indigo-500', difficulty: 'Beginner', estimatedTime: '30–45 minutes',
    description: 'Turn a meeting transcript into decisions, owners, deadlines, and a follow-up note.', outcome: 'An action register and a clear follow-up email.',
    prerequisites: ['A meeting transcript or notes', 'Permission to process the meeting content'],
    architecture: { trigger: 'Meeting transcript ready', brain: 'Extract decisions and actions', action: 'Review and share follow-up' },
    steps: [
      ['Capture the meeting', 'Collect a transcript or notes with attendee consent.', 'Fathom', 'https://fathom.video', 'setup', 'Record or paste the meeting notes. Keep the meeting date, participants, and agenda with the transcript. Remove sensitive material that does not need to be processed.'],
      ['Extract decisions', 'Separate confirmed decisions from discussion.', 'Claude', 'https://claude.ai', 'prompt', 'From these notes: [notes], list confirmed decisions, action items with owners and due dates, unresolved questions, and risks. Do not infer an owner or deadline if none was stated; write “unassigned” instead.'],
      ['Verify assignments', 'Check the action list against the source.', 'Google Docs', 'https://docs.google.com', 'setup', 'Compare each item with the transcript. Ask owners to confirm ambiguous tasks and fill in missing dates. Remove suggestions that were never agreed to.'],
      ['Send the recap', 'Share only the reviewed version.', 'Gmail', 'https://mail.google.com', 'deploy', 'Write a short recap with decisions first, then a table of actions, owners, and dates. Link to the full notes if appropriate and invite corrections by a specific date.'],
    ],
  }),
  guide({
    slug: 'blog-to-social', title: 'Article to social posts', category: 'Content', icon: Megaphone, color: 'from-pink-500 to-fuchsia-500', difficulty: 'Beginner', estimatedTime: '45–60 minutes',
    description: 'Adapt one approved article into platform-ready posts without losing the original meaning.', outcome: 'A small set of reviewed social posts and a distribution plan.',
    prerequisites: ['An approved article or source text', 'Audience and channel guidelines'],
    architecture: { trigger: 'Article approved', brain: 'Extract ideas and adapt for channels', action: 'Schedule reviewed posts' },
    steps: [
      ['Choose source material', 'Start with an article you are allowed to reuse.', 'Google Docs', 'https://docs.google.com', 'setup', 'Paste the final article, its link, target audience, and any claims that require citations. Identify the three most useful takeaways.'],
      ['Draft channel variants', 'Change format while keeping the same evidence.', 'ChatGPT', 'https://chatgpt.com', 'prompt', 'Turn this article [paste] into two LinkedIn posts, a five-part thread, and three short captions. Keep the core facts intact, cite the source link when useful, vary the opening hook, and avoid claims that are not in the article.'],
      ['Edit for each channel', 'Check length, tone, and source links.', 'Canva', 'https://canva.com', 'setup', 'Review every post for clarity and platform fit. Add a visual only where it helps explain the point. Ensure any image text is readable on mobile.'],
      ['Schedule and measure', 'Publish at a manageable cadence.', 'Buffer', 'https://buffer.com', 'deploy', 'Schedule the approved posts over two weeks. Track clicks, saves, and useful replies. Keep the strongest angle for a later revision.'],
    ],
  }),
  guide({
    slug: 'document-qa', title: 'Ask questions of your docs', category: 'Productivity', icon: FileText, color: 'from-sky-500 to-blue-500', difficulty: 'Beginner', estimatedTime: '30–60 minutes',
    description: 'Create a question-answer workflow grounded in a small collection of documents.', outcome: 'Answers that point back to the relevant document sections.',
    prerequisites: ['A set of current documents', 'Permission to upload or process them'],
    architecture: { trigger: 'User question', brain: 'Retrieve relevant document passages', action: 'Answer with citations or say it is unknown' },
    steps: [
      ['Prepare the source set', 'Remove outdated files and name each document clearly.', 'Google Drive', 'https://drive.google.com', 'setup', 'Gather the authoritative versions of your documents. Add dates and owners. Remove duplicates, drafts, and content that should not be shared.'],
      ['Add the documents', 'Upload files to a document-aware assistant.', 'NotebookLM', 'https://notebooklm.google.com', 'setup', 'Create a notebook for one topic and add the approved files. Keep topics separate so answers are less likely to mix unrelated policies or projects.'],
      ['Ask source-bound questions', 'Request short answers with citations.', 'NotebookLM', 'https://notebooklm.google.com', 'prompt', 'Using only the uploaded sources, answer [question] in 3–5 bullets. Cite the exact source section for each point. If the documents do not contain the answer, say so and identify the missing information.'],
      ['Test and maintain', 'Check known and unknown questions.', 'NotebookLM', 'https://notebooklm.google.com', 'deploy', 'Try two questions with known answers and one question outside the source set. Verify citations, then set a reminder to replace outdated documents when the source owner updates them.'],
    ],
  }),
  guide({
    slug: 'code-review-assistant', title: 'AI-assisted code review', category: 'Development', icon: Code2, color: 'from-slate-600 to-slate-900', difficulty: 'Intermediate', estimatedTime: '45–90 minutes',
    description: 'Use AI to find concrete risks in a pull request and turn findings into useful review comments.', outcome: 'A human-verified review with reproducible findings.',
    prerequisites: ['A pull request diff', 'Repository context and test commands'],
    architecture: { trigger: 'Pull request ready', brain: 'Review diff and surrounding code', action: 'Verify findings and comment' },
    steps: [
      ['Collect context', 'Read the change goal and surrounding code.', 'GitHub', 'https://github.com', 'setup', 'Capture the pull request description, diff, affected files, and existing tests. Note any API contracts or migration requirements.'],
      ['Ask for targeted review', 'Look for bugs with clear failure scenarios.', 'Claude', 'https://claude.ai', 'prompt', 'Review this diff [paste diff] for correctness, security, and regression risk. For each finding, cite the relevant line, explain a reproducible failure scenario, and suggest a minimal fix. Ignore style preferences unless they affect behavior.'],
      ['Reproduce findings', 'Confirm suspected issues locally.', 'GitHub', 'https://github.com', 'code', 'Run the relevant tests and try the reported edge case. Inspect adjacent code before accepting a finding. Discard claims that cannot be supported by the diff or a reproducible scenario.'],
      ['Leave actionable feedback', 'Prioritize verified issues.', 'GitHub', 'https://github.com', 'deploy', 'Comment with the failure scenario, line reference, and suggested change. Separate blocking issues from optional improvements, then recheck the fix when it lands.'],
    ],
  }),
  guide({
    slug: 'release-notes', title: 'Release notes from commits', category: 'Development', icon: Newspaper, color: 'from-cyan-600 to-teal-600', difficulty: 'Beginner', estimatedTime: '30–45 minutes',
    description: 'Convert merged changes into release notes people can understand.', outcome: 'Reviewed release notes grouped by user impact.',
    prerequisites: ['Merged pull requests or commit summaries', 'The release version and date'],
    architecture: { trigger: 'Release candidate ready', brain: 'Group changes by user impact', action: 'Publish reviewed notes' },
    steps: [
      ['Gather changes', 'Collect only work included in this release.', 'GitHub', 'https://github.com', 'setup', 'List merged pull requests since the previous release. Capture titles, descriptions, issue links, and any migration notes. Exclude unshipped work.'],
      ['Draft plain-language notes', 'Translate implementation details into user outcomes.', 'ChatGPT', 'https://chatgpt.com', 'prompt', 'Using these merged changes [paste], draft release notes for [audience]. Group into new, improved, and fixed. Explain the user impact in one sentence per item. Do not claim a feature is available unless the source says it shipped.'],
      ['Check accuracy', 'Confirm naming, availability, and breaking changes.', 'GitHub', 'https://github.com', 'setup', 'Ask feature owners to verify each item. Add upgrade instructions for breaking changes and link to documentation where needed.'],
      ['Publish', 'Post the reviewed notes with a clear version.', 'GitHub', 'https://github.com', 'deploy', 'Publish under the correct version and date. Link to known issues and support channels, then share the release note URL with the team.'],
    ],
  }),
  guide({
    slug: 'seo-content-refresh', title: 'Refresh an existing article', category: 'Marketing', icon: BookOpen, color: 'from-lime-600 to-emerald-600', difficulty: 'Intermediate', estimatedTime: '1–2 hours',
    description: 'Update a useful article using current evidence and clearer structure.', outcome: 'An accurate revised article and a list of changes made.',
    prerequisites: ['An article you own', 'Search performance or reader feedback', 'Access to current sources'],
    architecture: { trigger: 'Article selected for refresh', brain: 'Audit gaps and draft updates', action: 'Fact-check and publish' },
    steps: [
      ['Audit the page', 'Find outdated facts and unanswered reader questions.', 'Google Search Console', 'https://search.google.com/search-console', 'setup', 'Review queries, clicks, and pages that link to the article. Mark dated examples, broken links, thin sections, and questions the article does not answer.'],
      ['Verify new material', 'Collect current primary sources for updates.', 'Perplexity', 'https://perplexity.ai', 'setup', 'Find current documentation, research, or official announcements for each planned factual update. Save URLs and publication dates, then read the original sources.'],
      ['Rewrite selectively', 'Improve the existing answer instead of adding filler.', 'Claude', 'https://claude.ai', 'prompt', 'Revise this article [paste] for [audience]. Address these gaps [list] using only these verified sources [links/excerpts]. Preserve useful original sections, add clear headings, and flag claims that still need checking.'],
      ['Review and update', 'Check claims, links, and the page summary.', 'Google Docs', 'https://docs.google.com', 'deploy', 'Compare the revision with the original, verify every new claim, update the date only if changes are substantial, and publish with a short changelog.'],
    ],
  }),
  guide({
    slug: 'weekly-analytics-report', title: 'Weekly analytics summary', category: 'Data', icon: BarChart3, color: 'from-amber-500 to-orange-500', difficulty: 'Intermediate', estimatedTime: '1–2 hours',
    description: 'Turn a metrics export into a short report that explains what changed and what to check next.', outcome: 'A weekly report with numbers, context, and recommended follow-ups.',
    prerequisites: ['A consistent metrics export', 'Definitions for the key metrics', 'A previous period for comparison'],
    architecture: { trigger: 'Weekly data export', brain: 'Calculate changes and summarize', action: 'Review and share report' },
    steps: [
      ['Prepare the export', 'Confirm dates, units, and missing data.', 'Google Sheets', 'https://sheets.google.com', 'setup', 'Export this week and the comparable prior period. Check time zone, duplicate rows, missing values, and whether metric definitions changed.'],
      ['Calculate changes', 'Use formulas before asking AI for interpretation.', 'Google Sheets', 'https://sheets.google.com', 'code', 'For each metric, calculate current value, prior value, absolute change, and percentage change when the prior value is nonzero. Keep the raw calculations in the sheet.'],
      ['Draft the narrative', 'Explain the numbers without claiming causation.', 'Claude', 'https://claude.ai', 'prompt', 'Summarize this verified table [paste] for [audience]. Lead with three important changes, include exact values and date ranges, distinguish observations from hypotheses, and recommend two checks for the next week.'],
      ['Review and distribute', 'Check every figure against the sheet.', 'Google Docs', 'https://docs.google.com', 'deploy', 'Verify numbers and chart labels, add relevant context from the team, and share the report with a link to the source sheet.'],
    ],
  }),
  guide({
    slug: 'product-feedback-triage', title: 'Product feedback triage', category: 'Productivity', icon: MessageSquare, color: 'from-indigo-500 to-blue-500', difficulty: 'Intermediate', estimatedTime: '1–2 hours',
    description: 'Group feedback by theme and identify issues worth investigating.', outcome: 'A theme summary with examples and a prioritized follow-up list.',
    prerequisites: ['A feedback export with permission to analyze it', 'A product owner to review the results'],
    architecture: { trigger: 'New feedback batch', brain: 'Tag themes and summarize evidence', action: 'Create review queue' },
    steps: [
      ['Collect feedback', 'Merge relevant feedback into one review set.', 'Google Sheets', 'https://sheets.google.com', 'setup', 'Include date, source, product area, text, and an anonymous ID. Remove personal details that are not needed for analysis.'],
      ['Create a theme map', 'Ask AI to group similar requests and complaints.', 'Claude', 'https://claude.ai', 'prompt', 'Group these feedback entries [paste] into clear themes. For each theme, give a one-sentence summary, count, representative anonymous IDs, and any conflicting requests. Do not infer user intent beyond the text.'],
      ['Check the grouping', 'Read examples and correct misclassified entries.', 'Google Sheets', 'https://sheets.google.com', 'setup', 'Review at least three examples per theme, especially high-impact complaints. Split overly broad themes and mark ambiguous entries for manual review.'],
      ['Decide next actions', 'Connect themes to evidence and owners.', 'Google Docs', 'https://docs.google.com', 'deploy', 'Create a short review note with theme, evidence, affected users if known, next research step, and owner. Do not treat frequency alone as priority.'],
    ],
  }),
  guide({
    slug: 'resume-tailoring', title: 'Tailor a resume to a role', category: 'Career', icon: BriefcaseBusiness, color: 'from-rose-500 to-pink-500', difficulty: 'Beginner', estimatedTime: '45–60 minutes',
    description: 'Match real experience to a job description without inventing credentials.', outcome: 'A tailored resume draft and a list of remaining gaps.',
    prerequisites: ['Your current resume', 'The full job description', 'Examples of your actual work'],
    architecture: { trigger: 'Job selected', brain: 'Map requirements to evidence', action: 'Review and export resume' },
    steps: [
      ['Identify requirements', 'Highlight the role’s most important skills.', 'ChatGPT', 'https://chatgpt.com', 'prompt', 'Read this job description [paste]. List the five most important requirements and the evidence an applicant would need for each. Separate required from preferred qualifications.'],
      ['Map your evidence', 'Find truthful examples from your work.', 'Google Docs', 'https://docs.google.com', 'setup', 'For each requirement, write one project, responsibility, or result from your experience. Include numbers only if you can verify them.'],
      ['Rewrite the draft', 'Emphasize relevant experience clearly.', 'Claude', 'https://claude.ai', 'prompt', 'Tailor this resume [paste] to this role [paste job description]. Use only the experience I provided. Rewrite the summary and strongest bullets for relevance and clarity. Flag gaps rather than inventing skills or results.'],
      ['Proofread and export', 'Check every claim and the final formatting.', 'Google Docs', 'https://docs.google.com', 'deploy', 'Verify dates, titles, links, numbers, and spelling. Keep the layout readable and export a PDF. Save a copy of the version used for this application.'],
    ],
  }),
  guide({
    slug: 'lesson-plan', title: 'Build a lesson plan', category: 'Education', icon: GraduationCap, color: 'from-yellow-500 to-amber-500', difficulty: 'Beginner', estimatedTime: '45–60 minutes',
    description: 'Turn a learning objective into a lesson with practice and a way to check understanding.', outcome: 'A timed lesson plan with examples, activities, and assessment.',
    prerequisites: ['A subject and learner level', 'A clear learning objective', 'A session length'],
    architecture: { trigger: 'Learning objective', brain: 'Sequence explanation and practice', action: 'Teach, assess, and revise' },
    steps: [
      ['Set the objective', 'Define what learners should be able to do.', 'Google Docs', 'https://docs.google.com', 'setup', 'Write one observable outcome, the learner’s prior knowledge, the session duration, and any accessibility needs.'],
      ['Draft the lesson', 'Ask for explanation, examples, and active practice.', 'ChatGPT', 'https://chatgpt.com', 'prompt', 'Create a [duration] lesson for [learner level] on [topic]. Objective: [observable outcome]. Include a short introduction, worked example, guided practice, independent task, and exit ticket. Allocate realistic time to each part.'],
      ['Review accuracy', 'Check examples and answer keys.', 'Google Docs', 'https://docs.google.com', 'setup', 'Verify facts, solve every exercise yourself, and adjust language to the learners. Add a simpler path and a stretch task.'],
      ['Teach and adjust', 'Use the exit ticket to guide the next lesson.', 'Google Forms', 'https://forms.google.com', 'deploy', 'Collect short exit-ticket answers, note common misunderstandings, and revise the next session based on what learners actually understood.'],
    ],
  }),
  guide({
    slug: 'product-listing', title: 'Create a product listing', category: 'Commerce', icon: ShoppingBag, color: 'from-green-500 to-emerald-500', difficulty: 'Beginner', estimatedTime: '45–75 minutes',
    description: 'Turn verified product details into clear store copy and a simple image plan.', outcome: 'A product listing with benefits, specifications, and image guidance.',
    prerequisites: ['Accurate specifications and pricing', 'Product photos or permission to create them'],
    architecture: { trigger: 'Product details approved', brain: 'Organize benefits and specifications', action: 'Review and publish listing' },
    steps: [
      ['Gather product facts', 'Separate verified facts from marketing ideas.', 'Google Sheets', 'https://sheets.google.com', 'setup', 'List dimensions, materials, compatibility, care, warranty, and real customer questions. Mark any claim that needs evidence.'],
      ['Draft the listing', 'Write useful copy for a buyer deciding quickly.', 'ChatGPT', 'https://chatgpt.com', 'prompt', 'Write a product title, short description, five benefits, specification table, and FAQ for [product]. Use only these verified facts [paste]. Audience: [buyer]. Do not invent certifications, performance claims, or customer reviews.'],
      ['Prepare images', 'Plan visuals that answer buyer questions.', 'Canva', 'https://canva.com', 'setup', 'Choose a clear hero image, scale or dimensions image, detail close-up, and usage image. Check that visuals match the actual product and meet store requirements.'],
      ['Publish and check', 'Review the live page on desktop and mobile.', 'Shopify', 'https://shopify.com', 'deploy', 'Proofread the title, pricing, variants, links, and alt text. Publish only after a final factual review, then monitor customer questions for missing information.'],
    ],
  }),
  guide({
    slug: 'video-repurpose', title: 'Long video to short clips', category: 'Content', icon: Video, color: 'from-purple-500 to-fuchsia-500', difficulty: 'Beginner', estimatedTime: '1–2 hours',
    description: 'Find self-contained moments in a recording and turn them into useful short clips.', outcome: 'Three captioned clips with titles and source timestamps.',
    prerequisites: ['A recording you may edit and publish', 'A transcript', 'Channel aspect ratios'],
    architecture: { trigger: 'Recording complete', brain: 'Identify standalone moments', action: 'Edit, caption, and publish clips' },
    steps: [
      ['Get a transcript', 'Make the recording searchable by topic.', 'Descript', 'https://descript.com', 'setup', 'Import the recording and correct names, terms, and transcript errors. Note sections with a clear beginning, point, and ending.'],
      ['Choose moments', 'Pick clips that make sense without the full video.', 'Claude', 'https://claude.ai', 'prompt', 'From this timestamped transcript [paste], suggest five 30–60 second segments with one clear takeaway each. Include start and end times, a short title, and why each segment works alone. Do not change the speaker’s meaning.'],
      ['Edit the clips', 'Cut for clarity and add readable captions.', 'Descript', 'https://descript.com', 'setup', 'Create three clips, remove dead air carefully, and add captions. Check that the opening line establishes context and captions match the spoken words.'],
      ['Review and publish', 'Check rights, accuracy, and channel format.', 'Canva', 'https://canva.com', 'deploy', 'Export at the right aspect ratio, review the first three seconds on a phone, and include a link to the full recording when appropriate.'],
    ],
  }),
];
