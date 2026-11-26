/**
 * The input form of every AI tool, as data. The browser renders the form from this and the server validates the
 * request against the very same definition, so the two can never disagree and a crafted request cannot smuggle in
 * extra fields, oversized text or an option that does not exist.
 */

export type FieldKind = 'text' | 'textarea' | 'select' | 'number';

export interface FieldDef {
  id: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** Maximum characters (text/textarea). */
  max?: number;
  /** Bounds for number fields. */
  min?: number;
  maxValue?: number;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  help?: string;
  default?: string;
  rows?: number;
}

export interface AiToolSpec {
  slug: string;
  /** The button label. */
  action: string;
  /** Heading of the result card. */
  resultTitle: string;
  /** "output": the user picks an output language. "none": the tool has its own target field (translator). */
  language: 'output' | 'none';
  fields: FieldDef[];
  /** The field that receives text handed over from another tool ("Send to..."). */
  handoffField?: string;
  /** Sample values for the "Try an example" button. */
  example: Record<string, string>;
}

const opts = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }));
const tone = (...labels: string[]) => ({ id: 'tone', label: 'Tone', kind: 'select' as const, options: opts(...labels), default: labels[0] });

export const AI_SPECS: Record<string, AiToolSpec> = {
  'email-writer': {
    slug: 'email-writer', action: 'Write email', resultTitle: 'Your email', language: 'output', handoffField: 'details',
    fields: [
      { id: 'goal', label: 'What should the email achieve?', kind: 'text', required: true, max: 300, placeholder: 'e.g. Ask my manager for 2 days leave next week' },
      { id: 'recipient', label: 'Who is it for? (optional)', kind: 'text', max: 120, placeholder: 'e.g. My manager Rohit, HR, a professor' },
      { id: 'details', label: 'Key points to include (optional)', kind: 'textarea', max: 1500, rows: 3, placeholder: 'Dates, reasons, amounts, anything that must be in the email' },
      tone('Professional', 'Friendly', 'Formal', 'Polite but firm', 'Apologetic', 'Enthusiastic'),
      { id: 'length', label: 'Length', kind: 'select', options: opts('Short', 'Medium', 'Detailed'), default: 'Medium' },
    ],
    example: { goal: 'Ask my manager for 2 days leave next week', recipient: 'My manager', details: 'Family function on Friday and Saturday. I will finish the report before leaving and my teammate can cover urgent items.', tone: 'Professional', length: 'Short' },
  },
  'reply-assistant': {
    slug: 'reply-assistant', action: 'Suggest replies', resultTitle: 'Reply options', language: 'output', handoffField: 'message',
    fields: [
      { id: 'message', label: 'The message you received', kind: 'textarea', required: true, max: 3000, rows: 5, placeholder: 'Paste the message here' },
      { id: 'intent', label: 'What do you want to say? (optional)', kind: 'text', max: 300, placeholder: 'e.g. I cannot come but want to stay friendly' },
      tone('Friendly', 'Professional', 'Polite decline', 'Firm', 'Funny', 'Apologetic'),
      { id: 'channel', label: 'Where will you send it?', kind: 'select', options: opts('WhatsApp', 'Email', 'LinkedIn', 'Instagram DM', 'SMS'), default: 'WhatsApp' },
    ],
    example: { message: 'Hi! We are planning a get-together this Saturday at 7pm at my place. Will you be able to come? 😊', intent: 'I have another commitment but want to stay friendly', tone: 'Polite decline', channel: 'WhatsApp' },
  },
  'rewrite-fix': {
    slug: 'rewrite-fix', action: 'Improve text', resultTitle: 'Improved text', language: 'output', handoffField: 'text',
    fields: [
      { id: 'text', label: 'Your text', kind: 'textarea', required: true, max: 6000, rows: 8, placeholder: 'Paste the text you want to fix or rewrite' },
      { id: 'mode', label: 'What do you want?', kind: 'select', options: opts('Fix grammar only', 'Improve clarity', 'Make it shorter', 'Make it more formal', 'Make it friendlier', 'Make it more persuasive', 'Simplify'), default: 'Fix grammar only' },
    ],
    example: { text: 'me and my team has completed the project before deadline, we was working very hard from last 2 week and the client are happy with result', mode: 'Fix grammar only' },
  },
  translator: {
    slug: 'translator', action: 'Translate', resultTitle: 'Translation', language: 'none', handoffField: 'text',
    fields: [
      { id: 'text', label: 'Text to translate', kind: 'textarea', required: true, max: 6000, rows: 7, placeholder: 'Any language: it is detected automatically' },
      { id: 'to', label: 'Translate into', kind: 'select', options: [{ value: 'en', label: 'English' }, { value: 'hinglish', label: 'Hinglish' }, { value: 'hi', label: 'Hindi' }, { value: 'ta', label: 'Tamil' }, { value: 'te', label: 'Telugu' }, { value: 'bn', label: 'Bengali' }, { value: 'mr', label: 'Marathi' }, { value: 'gu', label: 'Gujarati' }, { value: 'kn', label: 'Kannada' }, { value: 'ml', label: 'Malayalam' }, { value: 'pa', label: 'Punjabi' }, { value: 'ur', label: 'Urdu' }], default: 'hi' },
      { id: 'style', label: 'Style', kind: 'select', options: opts('Natural', 'Formal', 'Casual'), default: 'Natural' },
    ],
    example: { text: 'Thank you for your quick response. I will send the documents by tomorrow evening.', to: 'hi', style: 'Formal' },
  },
  'letter-writer': {
    slug: 'letter-writer', action: 'Write letter', resultTitle: 'Your letter', language: 'output',
    fields: [
      { id: 'type', label: 'Type of letter', kind: 'select', required: true, options: opts('Leave application (office)', 'Leave application (school/college)', 'Bank: account, ATM or card problem', 'Consumer complaint', 'Rent or landlord matter', 'Resignation letter', 'Experience / relieving letter request', 'Fee concession request', 'Complaint to housing society / RWA', 'Recommendation letter request'), default: 'Leave application (office)' },
      { id: 'details', label: 'Your situation', kind: 'textarea', required: true, max: 2000, rows: 5, placeholder: 'Dates, what happened, what you want. Use [placeholders] for private details.' },
      { id: 'to', label: 'Addressed to (optional)', kind: 'text', max: 200, placeholder: 'e.g. The Branch Manager, State Bank of India, Andheri' },
      { id: 'from', label: 'Your name (optional)', kind: 'text', max: 100, placeholder: 'e.g. Priya Sharma' },
    ],
    example: { type: 'Leave application (office)', details: 'I need leave from 12 to 14 December for my sister\'s wedding in Jaipur. I will hand over my pending tasks to Ankit before leaving.', to: 'The HR Manager', from: 'Priya Sharma' },
  },
  'caption-writer': {
    slug: 'caption-writer', action: 'Write captions', resultTitle: 'Captions', language: 'output', handoffField: 'topic',
    fields: [
      { id: 'topic', label: 'What is the post about?', kind: 'textarea', required: true, max: 800, rows: 3, placeholder: 'e.g. Launching our new homemade pickle range in Pune' },
      { id: 'platform', label: 'Platform', kind: 'select', options: opts('Instagram', 'LinkedIn', 'X (Twitter)', 'YouTube Shorts', 'Facebook', 'WhatsApp Status'), default: 'Instagram' },
      tone('Witty', 'Professional', 'Inspirational', 'Casual', 'Bold'),
      { id: 'count', label: 'How many options?', kind: 'select', options: opts('3', '5'), default: '3' },
      { id: 'hashtags', label: 'Hashtags', kind: 'select', options: opts('Include hashtags', 'No hashtags'), default: 'Include hashtags' },
    ],
    example: { topic: 'Launching our new homemade mango pickle range in Pune, no preservatives, made by my mother\'s recipe', platform: 'Instagram', tone: 'Casual', count: '3', hashtags: 'Include hashtags' },
  },
  'meal-planner': {
    slug: 'meal-planner', action: 'Plan my meals', resultTitle: 'Your meal plan', language: 'output',
    fields: [
      { id: 'diet', label: 'Diet', kind: 'select', options: opts('Vegetarian', 'Eggetarian', 'Non-vegetarian', 'Vegan', 'Jain'), default: 'Vegetarian' },
      { id: 'goal', label: 'Goal', kind: 'select', options: opts('Healthy eating', 'Weight loss', 'Muscle gain', 'Maintain weight', 'Diabetes-friendly'), default: 'Healthy eating' },
      { id: 'days', label: 'Days', kind: 'select', options: opts('1', '3', '5', '7'), default: '3' },
      { id: 'calories', label: 'Daily calories (optional)', kind: 'number', min: 1000, maxValue: 5000, placeholder: 'e.g. 1800' },
      { id: 'budget', label: 'Daily food budget', kind: 'select', options: [{ value: 'Tight (about Rs 150 a day)', label: 'Tight (about ₹150 a day)' }, { value: 'Moderate (about Rs 250 a day)', label: 'Moderate (about ₹250 a day)' }, { value: 'Flexible (Rs 400+ a day)', label: 'Flexible (₹400+ a day)' }], default: 'Moderate (about Rs 250 a day)' },
      { id: 'region', label: 'Cuisine', kind: 'select', options: opts('Pan-Indian', 'North Indian', 'South Indian', 'Gujarati', 'Bengali', 'Maharashtrian', 'Punjabi', 'Any'), default: 'Pan-Indian' },
      { id: 'avoid', label: 'Allergies or foods to avoid (optional)', kind: 'text', max: 200, placeholder: 'e.g. peanuts, no onion or garlic' },
    ],
    example: { diet: 'Vegetarian', goal: 'Weight loss', days: '3', calories: '1600', budget: 'Moderate (about Rs 250 a day)', region: 'North Indian', avoid: 'No mushrooms' },
  },
  'workout-planner': {
    slug: 'workout-planner', action: 'Build my plan', resultTitle: 'Your weekly plan', language: 'output',
    fields: [
      { id: 'goal', label: 'Goal', kind: 'select', options: opts('Lose fat', 'Build muscle', 'Get stronger', 'General fitness', 'Improve stamina'), default: 'General fitness' },
      { id: 'level', label: 'Level', kind: 'select', options: opts('Beginner', 'Intermediate', 'Advanced'), default: 'Beginner' },
      { id: 'days', label: 'Days per week', kind: 'select', options: opts('2', '3', '4', '5', '6'), default: '3' },
      { id: 'minutes', label: 'Minutes per session', kind: 'select', options: opts('20', '30', '45', '60'), default: '30' },
      { id: 'equipment', label: 'Equipment', kind: 'select', options: opts('No equipment', 'Dumbbells and bands', 'Home gym', 'Full gym'), default: 'No equipment' },
      { id: 'limits', label: 'Injuries or things to avoid (optional)', kind: 'text', max: 200, placeholder: 'e.g. sore lower back, no jumping' },
    ],
    example: { goal: 'Lose fat', level: 'Beginner', days: '3', minutes: '30', equipment: 'No equipment', limits: 'Mild knee pain, avoid jumping' },
  },
  'trip-planner': {
    slug: 'trip-planner', action: 'Plan my trip', resultTitle: 'Your itinerary', language: 'output',
    fields: [
      { id: 'destination', label: 'Destination', kind: 'text', required: true, max: 120, placeholder: 'e.g. Manali, Goa, Jaipur, Bali' },
      { id: 'days', label: 'Number of days', kind: 'number', required: true, min: 1, maxValue: 14, default: '3', placeholder: '3' },
      { id: 'from', label: 'Starting from (optional)', kind: 'text', max: 100, placeholder: 'e.g. Delhi' },
      { id: 'budget', label: 'Budget style', kind: 'select', options: opts('Backpacker', 'Mid-range', 'Comfortable', 'Luxury'), default: 'Mid-range' },
      { id: 'who', label: 'Who is travelling?', kind: 'select', options: opts('Solo', 'Couple', 'Family with kids', 'Family with elders', 'Friends'), default: 'Friends' },
      { id: 'interests', label: 'Interests (optional)', kind: 'text', max: 200, placeholder: 'e.g. food, trekking, temples, photography' },
      { id: 'month', label: 'When? (optional)', kind: 'text', max: 40, placeholder: 'e.g. December' },
    ],
    example: { destination: 'Manali', days: '4', from: 'Delhi', budget: 'Mid-range', who: 'Friends', interests: 'Snow, cafes, short treks', month: 'December' },
  },
  'study-planner': {
    slug: 'study-planner', action: 'Build my timetable', resultTitle: 'Your study plan', language: 'output',
    fields: [
      { id: 'exam', label: 'Exam', kind: 'text', required: true, max: 120, placeholder: 'e.g. JEE Main, NEET, UPSC Prelims, 12th boards' },
      { id: 'subjects', label: 'Subjects and how strong you feel in each', kind: 'textarea', required: true, max: 800, rows: 4, placeholder: 'e.g. Physics: weak, Chemistry: average, Maths: strong' },
      { id: 'days', label: 'Days left', kind: 'number', required: true, min: 1, maxValue: 365, placeholder: 'e.g. 90' },
      { id: 'hours', label: 'Hours you can study per day', kind: 'number', required: true, min: 1, maxValue: 14, default: '5', placeholder: '5' },
      { id: 'style', label: 'Your rhythm', kind: 'select', options: opts('Balanced', 'Morning person', 'Night owl'), default: 'Balanced' },
    ],
    example: { exam: 'JEE Main', subjects: 'Physics: weak\nChemistry: average\nMaths: strong', days: '90', hours: '6', style: 'Morning person' },
  },
  'content-calendar': {
    slug: 'content-calendar', action: 'Plan my content', resultTitle: 'Your content calendar', language: 'output',
    fields: [
      { id: 'business', label: 'What do you do?', kind: 'text', required: true, max: 200, placeholder: 'e.g. Home bakery in Pune, freelance designer, SaaS for dentists' },
      { id: 'audience', label: 'Who do you want to reach? (optional)', kind: 'text', max: 200, placeholder: 'e.g. working parents, startup founders, college students' },
      { id: 'platform', label: 'Platform', kind: 'select', options: opts('LinkedIn', 'Instagram', 'YouTube', 'X (Twitter)', 'Facebook', 'Mixed (several platforms)'), default: 'LinkedIn' },
      { id: 'duration', label: 'How long?', kind: 'select', options: opts('7 days', '14 days', '30 days'), default: '14 days' },
      { id: 'frequency', label: 'How often will you post?', kind: 'select', options: opts('Every day', '5 days a week', '3 days a week'), default: '3 days a week' },
      { id: 'goal', label: 'Main goal', kind: 'select', options: opts('Grow followers', 'Get leads and enquiries', 'Build authority', 'Sell a product or service', 'Promote an event or launch'), default: 'Get leads and enquiries' },
      tone('Professional', 'Friendly', 'Inspirational', 'Witty', 'Bold'),
      { id: 'themes', label: 'Topics you want covered (optional)', kind: 'text', max: 300, placeholder: 'e.g. behind the scenes, customer stories, tips' },
    ],
    example: { business: 'Home bakery in Pune selling eggless cakes', audience: 'Busy families and office teams ordering for celebrations', platform: 'Instagram', duration: '14 days', frequency: '5 days a week', goal: 'Get leads and enquiries', tone: 'Friendly', themes: 'Behind the scenes, customer stories, festival specials' },
  },
  'linkedin-post-writer': {
    slug: 'linkedin-post-writer', action: 'Write LinkedIn posts', resultTitle: 'Your LinkedIn posts', language: 'output', handoffField: 'topic',
    fields: [
      { id: 'topic', label: 'What do you want to post about?', kind: 'textarea', required: true, max: 1200, rows: 4, placeholder: 'e.g. I got promoted to team lead after 3 years. Here is what I learned about asking for feedback.' },
      { id: 'goal', label: 'Type of post', kind: 'select', options: opts('Personal story', 'Lessons and tips', 'Achievement or milestone', 'Opinion or hot take', 'Job or hiring announcement', 'Product or service', 'Event or webinar', 'Thank you / gratitude'), default: 'Personal story' },
      { id: 'role', label: 'Your role or industry (optional)', kind: 'text', max: 120, placeholder: 'e.g. Software engineer, HR manager, founder' },
      tone('Professional', 'Conversational', 'Inspirational', 'Bold', 'Humble'),
      { id: 'length', label: 'Length', kind: 'select', options: opts('Short (about 600 characters)', 'Medium (about 1,200 characters)', 'Long (about 2,000 characters)'), default: 'Medium (about 1,200 characters)' },
      { id: 'extras', label: 'Finish with', kind: 'select', options: opts('A question and 3 hashtags', 'A question only', '3 hashtags only', 'Nothing extra'), default: 'A question and 3 hashtags' },
    ],
    example: { topic: 'I got promoted to team lead after 3 years. The biggest lesson was to ask for feedback every month, not once a year.', goal: 'Personal story', role: 'Software engineer', tone: 'Conversational', length: 'Medium (about 1,200 characters)', extras: 'A question and 3 hashtags' },
  },
  'cover-letter-writer': {
    slug: 'cover-letter-writer', action: 'Write my cover letter', resultTitle: 'Your cover letter', language: 'output', handoffField: 'background',
    fields: [
      { id: 'role', label: 'Job you are applying for', kind: 'text', required: true, max: 150, placeholder: 'e.g. Digital Marketing Manager' },
      { id: 'company', label: 'Company (optional)', kind: 'text', max: 150, placeholder: 'e.g. Bloom Naturals' },
      { id: 'job', label: 'Job description (optional)', kind: 'textarea', max: 3500, rows: 5, placeholder: 'Paste the responsibilities and requirements. The letter gets much better when you do.' },
      { id: 'background', label: 'Your background', kind: 'textarea', required: true, max: 2500, rows: 6, placeholder: 'Your experience, strongest skills and one or two real achievements. A pasted resume summary works too.' },
      { id: 'level', label: 'You are', kind: 'select', options: opts('Experienced professional', 'Fresher or recent graduate', 'Switching careers'), default: 'Experienced professional' },
      { id: 'name', label: 'Your name (optional)', kind: 'text', max: 100, placeholder: 'e.g. Priya Sharma' },
      tone('Professional', 'Warm and personal', 'Confident', 'Short and direct'),
      { id: 'length', label: 'Length', kind: 'select', options: opts('Short (about 150 words)', 'Standard (about 250 words)', 'Detailed (about 350 words)'), default: 'Standard (about 250 words)' },
    ],
    example: { role: 'Digital Marketing Manager', company: 'Bloom Naturals', job: 'We are looking for a marketer to own SEO and paid campaigns, report on performance and grow organic traffic for our D2C brand.', background: '6 years in digital marketing. Grew organic traffic from 40,000 to 95,000 monthly visits in 14 months and cut cost per lead by 31% while managing a quarterly Google and Meta budget. Comfortable with GA4, Search Console and email automation.', level: 'Experienced professional', name: 'Priya Sharma', tone: 'Professional', length: 'Standard (about 250 words)' },
  },
  'resume-bullet-improver': {
    slug: 'resume-bullet-improver', action: 'Improve my bullets', resultTitle: 'Stronger resume bullets', language: 'output', handoffField: 'duties',
    fields: [
      { id: 'role', label: 'Your job title', kind: 'text', required: true, max: 150, placeholder: 'e.g. Sales Executive' },
      { id: 'duties', label: 'What you did', kind: 'textarea', required: true, max: 3000, rows: 7, placeholder: 'Paste your current resume bullets, or just describe the work in your own words.' },
      { id: 'target', label: 'Job you are applying for (optional)', kind: 'text', max: 150, placeholder: 'e.g. Senior Sales Manager' },
      { id: 'keywords', label: 'Keywords to include (optional)', kind: 'text', max: 200, placeholder: 'e.g. B2B, CRM, lead generation' },
      { id: 'style', label: 'Style', kind: 'select', options: opts('Achievement-focused', 'Short and punchy', 'Detailed and technical'), default: 'Achievement-focused' },
    ],
    example: { role: 'Sales Executive', duties: 'Responsible for handling clients and selling our software. Made calls to leads and did demos. Worked with the team on targets. Prepared monthly reports for my manager.', target: 'Senior Sales Manager', keywords: 'B2B, CRM, lead generation', style: 'Achievement-focused' },
  },
  'linkedin-profile-optimizer': {
    slug: 'linkedin-profile-optimizer', action: 'Improve my profile', resultTitle: 'Your improved profile', language: 'output', handoffField: 'about',
    fields: [
      { id: 'role', label: 'What you do or want to be known for', kind: 'text', required: true, max: 200, placeholder: 'e.g. Digital marketing manager for D2C brands' },
      { id: 'headline', label: 'Your current headline (optional)', kind: 'text', max: 220, placeholder: 'Paste your current headline' },
      { id: 'about', label: 'Your current About section (optional)', kind: 'textarea', max: 2500, rows: 5, placeholder: 'Paste your current About text, or leave empty to get a fresh one' },
      { id: 'goal', label: 'Main goal', kind: 'select', options: opts('Get hired', 'Get clients', 'Be found by recruiters', 'Grow my network', 'Build my personal brand'), default: 'Get hired' },
      { id: 'keywords', label: 'Keywords to include (optional)', kind: 'text', max: 200, placeholder: 'e.g. SEO, performance marketing, Google Ads' },
      tone('Professional', 'Friendly and personal', 'Confident', 'Concise'),
    ],
    example: { role: 'Digital marketing manager for D2C brands', headline: 'Marketing Manager at a startup', about: 'I work in marketing. I have 5 years of experience in digital marketing and I like to learn new things.', goal: 'Get hired', keywords: 'SEO, Meta Ads, Google Ads, analytics', tone: 'Professional' },
  },
};

export const AI_SLUGS = Object.keys(AI_SPECS);

export type Values = Record<string, string>;
export type Validation = { ok: true; values: Values } | { ok: false; error: string };

/** Validates raw input against the spec. Unknown fields are dropped; every value is trimmed, length-capped and checked. */
export function validateValues(spec: AiToolSpec, raw: unknown): Validation {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'Please fill in the form.' };
  const input = raw as Record<string, unknown>;
  const values: Values = {};
  for (const field of spec.fields) {
    const v = input[field.id];
    const text = typeof v === 'string' ? v.trim() : typeof v === 'number' && Number.isFinite(v) ? String(v) : '';
    if (!text) {
      if (field.required) return { ok: false, error: `${field.label.replace(/\s*\(optional\)/, '')} is required.` };
      continue;
    }
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) return { ok: false, error: `${field.label}: contains characters that are not allowed.` };
    if (field.kind === 'select') {
      if (!field.options?.some((o) => o.value === text)) return { ok: false, error: `${field.label}: choose one of the options.` };
    } else if (field.kind === 'number') {
      const n = Number(text);
      if (!/^\d{1,6}$/.test(text) || !Number.isInteger(n) || (field.min !== undefined && n < field.min) || (field.maxValue !== undefined && n > field.maxValue)) {
        return { ok: false, error: `${field.label.replace(/\s*\(optional\)/, '')} must be a whole number between ${field.min ?? 0} and ${field.maxValue ?? 999999}.` };
      }
    } else if (text.length > (field.max ?? 500)) {
      return { ok: false, error: `${field.label.replace(/\s*\(optional\)/, '')} is too long (maximum ${field.max ?? 500} characters).` };
    }
    values[field.id] = text;
  }
  return { ok: true, values };
}

export function defaultValues(spec: AiToolSpec): Values {
  const out: Values = {};
  for (const f of spec.fields) if (f.default !== undefined) out[f.id] = f.default;
  return out;
}
