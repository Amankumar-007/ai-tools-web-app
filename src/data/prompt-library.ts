import imagePrompts from '../../public/data/nano-banana.json';

export interface Prompt {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

type PromptEntry = [title: string, description: string, content: string];

// Bracketed text is meant to be replaced by the person using the prompt.
const promptGroups: Record<string, PromptEntry[]> = {
  Writing: [
    ['Write a clear first draft', 'Turn rough notes into a useful article.', 'Write a [length] article for [audience] about [topic]. Use these notes as the source: [notes]. Open with the main takeaway, organize the body with descriptive headings, and end with a practical next step. Use a [tone] voice. Do not invent facts; mark missing details as [VERIFY].'],
    ['Edit for clarity', 'Improve a draft without changing its meaning.', 'Edit the text below for clarity, flow, and concision while preserving its meaning and voice. Keep technical terms that are necessary. Return the revised text first, then a short list of the three most important edits. Text: [paste draft].'],
    ['Write a persuasive email', 'Draft a focused email with a clear ask.', 'Write an email to [recipient] about [purpose]. Context: [background]. The desired action is [specific ask]. Keep it under [word count] words, use a [tone] tone, and give me three subject lines. Do not use exaggerated claims or generic opening phrases.'],
    ['Repurpose one idea', 'Adapt a message for several channels.', 'Turn this idea into a short LinkedIn post, a three-part social thread, and an email intro: [idea or source text]. Keep the same core claim, adapt the voice to each channel, and include one concrete example. Flag any claim that needs a source.'],
  ],
  Coding: [
    ['Debug a failing function', 'Find the cause and propose a small fix.', 'Act as a careful debugging partner. Here is the code: [code]. Expected behavior: [expected]. Actual behavior and error: [actual]. Identify likely causes in order of probability, explain how to verify each one, then provide the smallest safe patch. State any assumptions.'],
    ['Review a pull request', 'Get actionable feedback on a code change.', 'Review this change for correctness, security, performance, and maintainability: [diff]. Focus on concrete issues introduced by the change. For each issue, cite the affected line, explain the failure scenario, and suggest a fix. If you find no issues, say so and list any remaining test gaps.'],
    ['Design an API endpoint', 'Plan request, response, and failure cases.', 'Design an API endpoint for [use case] in [stack]. Include route and method, request and response examples, validation rules, authentication needs, error statuses, and pagination if relevant. Explain the main tradeoffs and provide a minimal implementation outline.'],
    ['Write meaningful tests', 'Cover behavior and edge cases.', 'Write tests for this code in [framework]: [code]. Cover the main behavior, boundary cases, and one realistic failure path. Avoid tests that simply repeat implementation details. Explain any dependency that needs mocking and why.'],
  ],
  Research: [
    ['Build a research plan', 'Define what to investigate before searching.', 'Create a research plan for this question: [question]. Break it into subquestions, identify the best primary source type for each, suggest search terms, and explain how to judge conflicting evidence. End with what would change the conclusion.'],
    ['Summarize a long document', 'Extract decisions, evidence, and open questions.', 'Summarize the document below for [audience]. Start with a five-bullet executive summary, then list key evidence, decisions, numbers with their context, and unanswered questions. Distinguish direct statements from your inferences. Document: [paste text].'],
    ['Compare competing claims', 'Separate evidence from opinion.', 'Compare these claims about [topic]: [claim A] and [claim B]. Use only the sources I provide: [sources]. Make a table of evidence for each claim, identify gaps and possible bias, then give a calibrated conclusion. Do not fill gaps with invented citations.'],
    ['Create interview questions', 'Prepare questions that uncover useful detail.', 'I am interviewing [type of person] to learn about [goal]. Draft 12 open questions, grouped by theme, with one follow-up for each. Avoid leading questions and yes/no questions. Include a short note on what to listen for.'],
  ],
  Marketing: [
    ['Write a landing page', 'Create benefit-led page copy.', 'Write landing page copy for [product] aimed at [audience]. Their problem is [problem] and the product helps by [how]. Include a headline, subheadline, three benefits with proof placeholders, how-it-works section, objection handling, and a clear CTA. Avoid unsupported superlatives.'],
    ['Plan a content calendar', 'Map topics to audience intent.', 'Create a four-week content plan for [brand] targeting [audience] on [channels]. Goal: [goal]. For each post, include topic, audience question, format, hook, CTA, and a simple success metric. Mix educational, proof, and conversion content.'],
    ['Improve ad copy', 'Generate testable ad variations.', 'Create six ad copy variations for [offer] on [platform]. Audience: [audience]. Value proposition: [value]. Constraints: [character limits or policy]. Vary the angle, label each angle, and include a headline, body, and CTA. Do not promise outcomes we cannot verify.'],
    ['Analyze competitors', 'Find positioning opportunities.', 'Compare these competitors: [names and source material]. Evaluate audience, message, pricing model, strengths, and gaps in a table. Then suggest three defensible positioning angles for [our product]. Separate observed facts from hypotheses to test.'],
  ],
  Productivity: [
    ['Plan my week', 'Turn commitments into a realistic schedule.', 'Help me plan this week. Priorities: [list]. Meetings and fixed commitments: [list]. Available work hours: [hours]. Build a day-by-day plan with focused blocks, buffers, and a clear top priority for each day. Flag overload and suggest what to defer.'],
    ['Turn notes into actions', 'Extract owners and deadlines from messy notes.', 'Convert these meeting notes into an action list: [notes]. For each action, include owner, due date if stated, dependencies, and the exact decision it supports. Separate confirmed commitments from suggestions and list unresolved questions.'],
    ['Prioritize a backlog', 'Choose work by impact and effort.', 'Prioritize this backlog for [goal]: [tasks]. Score each item on impact, urgency, confidence, and effort using a simple 1–5 scale. Explain the top five choices, identify quick wins, and name work that should wait. State where information is insufficient.'],
    ['Create a reusable checklist', 'Make a repeatable process easy to follow.', 'Turn this process into a concise checklist for [role]: [process description]. Group steps into preparation, execution, review, and handoff. Add a clear completion criterion for each phase and flag steps that require human approval.'],
  ],
  Business: [
    ['Draft a one-page proposal', 'Present a problem, solution, and next step.', 'Write a one-page proposal for [project] to [stakeholder]. Include the problem, expected outcome, scope, approach, timeline, costs or assumptions, risks, and a decision request. Use plain language and distinguish known facts from estimates.'],
    ['Evaluate a business idea', 'Pressure-test assumptions before building.', 'Evaluate this business idea: [idea]. Target customer: [customer]. List the core assumptions, a simple value proposition, alternatives customers use today, likely acquisition channels, and the cheapest test for each risky assumption. End with a go/no-go decision framework.'],
    ['Write a decision memo', 'Compare options with explicit tradeoffs.', 'Write a decision memo about [decision]. Options: [options]. Constraints: [budget, time, team]. Compare options on cost, benefit, risk, reversibility, and evidence. Recommend one option, explain why, and define what new information would change the recommendation.'],
    ['Prepare a stakeholder update', 'Communicate progress without noise.', 'Draft a concise update for [stakeholders] about [project]. Include completed work, current status against the goal, key metrics with dates, blockers, decisions needed, and next steps with owners. Use a direct, calm tone. Source notes: [notes].'],
  ],
  Learning: [
    ['Explain a hard concept', 'Learn with examples and a quick check.', 'Explain [concept] to someone who knows [background level]. Start with an intuitive analogy, then a precise definition, one worked example, and two common misconceptions. End with three short questions that check understanding.'],
    ['Make a study plan', 'Build a practical learning path.', 'Create a [duration] study plan to learn [skill]. I already know [background] and can spend [hours] per week. Set weekly outcomes, practice exercises, review checkpoints, and one small project. Prioritize practice over passive reading.'],
    ['Quiz me interactively', 'Practice recall one question at a time.', 'Tutor me on [topic]. Ask one question at a time, starting easy and increasing difficulty based on my answers. After each answer, explain what I got right or wrong without giving away later questions. Include a mix of recall, application, and explanation questions.'],
    ['Turn notes into flashcards', 'Create useful recall prompts.', 'Turn these notes into 15 flashcards: [notes]. Put one idea on each card, avoid vague questions, and include concise answers. Add five application questions that require using the ideas in a new scenario. Flag unclear material rather than guessing.'],
  ],
  Career: [
    ['Tailor a resume', 'Match experience to a role honestly.', 'Tailor my resume to this job description without inventing experience. Resume: [resume]. Job description: [job description]. Identify the five most relevant requirements, rewrite my summary and strongest bullets using evidence from the resume, and list gaps I should address in a cover letter.'],
    ['Prepare for an interview', 'Practice role-specific questions.', 'Prepare me for an interview for [role] at [company]. Job description: [description]. Give me 10 likely questions, what each question is testing, and a structure for answering. Include four thoughtful questions to ask the interviewer. Do not fabricate company facts.'],
    ['Write a cover letter', 'Connect experience to a specific job.', 'Draft a cover letter for [role] using my experience: [experience] and this job description: [description]. Focus on two relevant achievements with measurable evidence, explain why the role fits, and close with a clear next step. Keep it under 300 words and avoid clichés.'],
    ['Plan a career switch', 'Identify transferable skills and proof.', 'Help me plan a transition from [current role] to [target role]. My skills and constraints: [details]. Map transferable skills, missing skills, portfolio proof to create, people to speak with, and a 90-day action plan. Distinguish essential steps from optional ones.'],
  ],
  Data: [
    ['Analyze a dataset', 'Turn raw numbers into defensible insights.', 'Analyze this dataset or table: [data]. First describe the columns and check for missing values or obvious anomalies. Then calculate the most useful summary statistics for [business question], identify patterns and caveats, and suggest two follow-up analyses. Do not infer causation from correlation.'],
    ['Design a dashboard', 'Choose metrics that answer decisions.', 'Design a dashboard for [team] to answer [decision questions]. Available data: [sources]. Recommend a small set of metrics, definitions, chart types, filters, and update cadence. Note possible data quality issues and what action each metric should trigger.'],
    ['Write a SQL query', 'Generate a query with clear assumptions.', 'Write a [SQL dialect] query to answer [question]. Schema: [tables and columns]. Include readable CTEs, explain join keys and filters, handle nulls and duplicate rows, and show how to validate the result. Ask for missing schema details if needed.'],
    ['Explain a chart', 'Translate a visualization into plain English.', 'Explain this chart or its underlying data for [audience]: [chart description or data]. State the main takeaway, cite exact values and time periods, note uncertainty or missing context, and suggest a suitable caption. Avoid overclaiming.'],
  ],
  Design: [
    ['Create a design brief', 'Align a visual project before production.', 'Write a design brief for [project]. Audience: [audience]. Goal: [goal]. Include core message, required content, visual direction, accessibility needs, deliverables, constraints, and approval criteria. List any questions that must be answered before design starts.'],
    ['Critique a screen', 'Get practical usability feedback.', 'Critique this screen for [user goal]: [screenshot description or UI details]. Evaluate hierarchy, readability, accessibility, navigation, and likely friction. Prioritize issues by user impact and suggest concrete changes. Separate observations from assumptions.'],
    ['Generate visual directions', 'Explore distinct design concepts.', 'Propose three distinct visual directions for [product or campaign] aimed at [audience]. For each, provide mood, typography, color palette, imagery, layout principles, and why it fits the goal. Keep concepts feasible within [constraints].'],
    ['Write UX microcopy', 'Make interface text clearer and kinder.', 'Write microcopy for this flow: [flow]. Users want to [goal]. Provide button labels, helper text, empty states, success messages, and error messages. Use short, plain language, make the next action clear, and avoid blaming the user.'],
  ],
  Images: [
    ['Product hero photograph', 'Create a polished commerce image.', 'Create a clean product hero photograph of [product] on [surface] against [background]. Use soft directional light from [direction], realistic materials, subtle shadows, and a composition with negative space for copy. Show the product accurately; avoid extra logos, text, or accessories unless specified. Aspect ratio: [ratio].'],
    ['Editorial portrait', 'Control subject, light, and composition.', 'Create an editorial portrait of [subject] in [setting]. Frame as [close-up/half-body], use [lighting] and a [color palette] palette. Capture a natural expression and believable skin texture. Keep hands anatomically plausible and the background simple. Aspect ratio: [ratio].'],
    ['Illustrated explainer', 'Visualize an idea without clutter.', 'Create an illustration explaining [concept] for [audience]. Show [key elements] in a clear visual hierarchy, using [style] and [palette]. Leave room for a headline and avoid generated text inside the image. The central idea should be understandable at thumbnail size.'],
    ['Consistent icon set', 'Generate icons that belong together.', 'Design a set of [number] icons for [topics]. Use one consistent visual system: [stroke weight], [corner radius], [palette], [perspective], and [background]. Keep each silhouette distinct and legible at 24 pixels. Present each icon separately on a clean canvas.'],
  ],
  Video: [
    ['Storyboard a short video', 'Plan shots before generating clips.', 'Create a [duration]-second storyboard for [message] aimed at [audience]. Provide six shots with timing, framing, action, on-screen text, audio, and transition notes. Keep each shot visually achievable and end with one clear CTA.'],
    ['Write a tutorial script', 'Teach one task in a short video.', 'Write a [duration]-minute tutorial script showing how to [task]. Assume the viewer knows [background]. Include an opening promise, numbered steps, visual or screen recording cues, one common mistake, and a short recap. Use spoken language and avoid filler.'],
    ['Plan a product demo', 'Show value through a realistic scenario.', 'Plan a product demo for [product] solving [user problem]. Show the starting situation, three meaningful actions in the product, the resulting outcome, and one honest limitation. Provide voiceover and screen directions in a two-column table. Target length: [duration].'],
    ['Generate a cinematic shot', 'Give a video model clear motion instructions.', 'Generate a [duration]-second video of [subject] in [location]. Camera: [movement and lens]. Action: [one clear action]. Lighting: [lighting]. Mood: [mood]. Keep the subject consistent across frames, use natural motion, and avoid cuts, captions, and extra people unless requested. Aspect ratio: [ratio].'],
  ],
};

const newPrompts: Prompt[] = Object.entries(promptGroups).flatMap(([category, entries]) =>
  entries.map(([title, description, content], index) => ({
    id: `${category.toLowerCase()}-${index + 1}`,
    title,
    category,
    description,
    content,
  }))
);

// Preserve the existing image collection while giving it plain-language prompts.
const existingImages: Prompt[] = imagePrompts.map((prompt) => {
  const attributes = [...prompt.content.matchAll(/'([^']+)':\s*'([^']*)'/g)]
    .map(([, key, value]) => `${key}: ${value}`);
  return {
    id: `image-archive-${prompt.id}`,
    title: prompt.title,
    category: 'Images',
    description: prompt.description,
    content: `Create an image with the following direction: ${attributes.length ? attributes.join('; ') : prompt.content}. Use a coherent composition, accurate details, and lighting that supports the mood. Avoid unwanted text or watermarks.`,
  };
});

export const PROMPTS: Prompt[] = [...newPrompts, ...existingImages];
export const PROMPT_CATEGORIES = ['All', ...Object.keys(promptGroups)];
