import type { DailyTool } from './registry';

/** Resume and job-application tools. Same shape as every other tool; the registry merges them in. */

const PRIVATE = ['Never uploaded', 'No sign-in, no limits'];
const AI_EDGE = ['12 languages incl. Hinglish', 'One-click refine', 'History stays on your device'];

export const CAREER_TOOLS: Array<Omit<DailyTool, 'color'>> = [
  {
    slug: 'resume-builder', name: 'Resume Builder', tagline: 'Design a resume in 6 looks, with a live preview. PDF and Word.', category: 'Career & Resume', kind: 'local', icon: 'FileUser',
    description: 'Build a professional resume in minutes: six designs, your choice of colour and font, live A4 preview, one-click PDF and Word download. Free, no sign-up, nothing uploaded.',
    keywords: ['resume builder', 'free resume maker', 'resume maker India', 'CV maker', 'resume templates', 'resume PDF download', 'fresher resume format', 'ATS friendly resume'],
    edge: [...PRIVATE, '6 designs, any colour', 'Real text PDF, clickable links', 'Word download too'],
    intro: [
      'Fill in your details once and see your resume update live as an A4 page. Pick one of six designs (Classic, Modern, Banner, Sidebar, Minimal or Executive), choose a colour and a font, and download it as a PDF or an editable Word file. There is no watermark, no sign-up and no payment.',
      'The PDF is made of real, selectable text, not a picture, so job portals and recruiters can read it, and your email, phone and LinkedIn links are clickable. Your resume is made inside your browser and saved only on your device: nothing is uploaded. Freshers can show education first; the page suggests fixes such as adding numbers to your bullet points.',
    ],
    steps: [
      { title: 'Choose a design and colour', text: 'Click a look, pick a colour, and choose compact, normal or roomy spacing.' },
      { title: 'Fill in your details', text: 'Add your jobs, education, skills and a short summary. Write one achievement per line.' },
      { title: 'Download', text: 'Get a PDF to send, or a Word file to keep editing. The preview is exactly what you download.' },
    ],
    faqs: [
      { question: 'Will job portals and ATS software read this resume?', answer: 'The PDF contains real text in a normal reading order, which is what most systems need. Single-column designs (Classic, Modern, Banner, Minimal, Executive) are the safest. The two-column Sidebar design is read less reliably by some portals, so use a single-column one for online applications.' },
      { question: 'Is it really free? Is there a watermark?', answer: 'Yes, it is free, with no watermark and no account. Your resume never leaves your device.' },
      { question: 'Can I write in Hindi or another Indian language?', answer: 'The PDF designs use standard fonts that draw English and other Western letters only, and the page warns you if a character cannot be drawn. The Word download keeps every script, so use it for Hindi, Tamil and others.' },
      { question: 'Is my resume saved?', answer: 'It is saved in this browser on this device only, so you can come back to it. Clearing your browser data removes it. Download a copy of anything important.' },
      { question: 'How long should my resume be?', answer: 'One page is best for up to about 10 years of experience, and two pages at most for senior roles. The page tells you if you run over and offers a compact spacing option.' },
    ],
  },
  {
    slug: 'resume-keyword-matcher', name: 'Resume Keyword Matcher', tagline: 'See which words from a job post your resume is missing.', category: 'Career & Resume', kind: 'local', icon: 'ScanSearch',
    description: 'Paste a job description and your resume to see which important keywords you already have and which are missing. Instant, private, no sign-up.',
    keywords: ['resume keyword checker', 'resume job description match', 'ATS keyword scanner', 'resume keywords for job', 'tailor resume to job', 'resume match score'],
    edge: [...PRIVATE, 'Weighted by how often the job repeats a word', 'Copy the missing words'],
    intro: [
      'Recruiters and job portals often start by looking for the words in the job post. Paste the job description and your resume text and this tool lists the important words and phrases from the job (skills, tools, requirements) and shows which ones your resume already contains and which are missing.',
      'It handles word forms (manage, managed, managing) and phrases like "google analytics". It is a simple word check, not a score from any real hiring system, so use it to tailor honestly: add a missing word only if it is true for you. Everything runs in your browser and nothing is uploaded.',
    ],
    steps: [
      { title: 'Paste the job description', text: 'Copy the whole post, including responsibilities and requirements.' },
      { title: 'Paste your resume', text: 'Paste its text, or load the one you made in the Resume Builder.' },
      { title: 'Read the result', text: 'Add the missing words that are true for you, using the job\'s own wording, then check again.' },
    ],
    faqs: [
      { question: 'Is the percentage my ATS score?', answer: 'No. No tool can know the exact software an employer uses. The percentage is only the share of the job post\'s important words (weighted by repetition) that your resume contains, a useful guide for tailoring.' },
      { question: 'Should I copy every missing keyword into my resume?', answer: 'No. Add only the words that describe skills and experience you really have, in natural sentences. Listing tools you cannot use will fail in the interview.' },
      { question: 'Is my resume uploaded?', answer: 'No. The comparison runs entirely in your browser.' },
    ],
  },
  {
    slug: 'cover-letter-writer', name: 'Cover Letter Writer', tagline: 'A tailored cover letter from your background and the job post.', category: 'Career & Resume', kind: 'ai', icon: 'MailCheck',
    description: 'Write a tailored cover letter in seconds from your background and the job description. Fresher, experienced or career-switch, in English, Hindi or Hinglish. Free to try.',
    keywords: ['cover letter generator', 'AI cover letter writer', 'cover letter for fresher', 'cover letter format India', 'job application letter', 'cover letter for job'],
    edge: [...AI_EDGE, 'Matches the job description', 'Email subject line included'],
    intro: [
      'Tell the writer the job you want, paste the job description if you have it, and describe your background in a few lines. It drafts a complete cover letter with a greeting, an opening that names the role, a short match between your strengths and what the job needs, and a closing, plus an email subject line.',
      'It is built to use only the facts you give: anything missing, such as the hiring manager\'s name, appears as a [placeholder] to fill in, and it will not invent employers, numbers or achievements. Choose a fresher, experienced or career-switch angle, the tone and the length.',
    ],
    steps: [
      { title: 'Say which job it is for', text: 'The job title, the company, and (best) the pasted job description.' },
      { title: 'Describe your background', text: 'Your experience, strongest skills and one or two real achievements.' },
      { title: 'Refine and send', text: 'Make it shorter or more formal in one click, replace the [placeholders], and read it once before sending.' },
    ],
    faqs: [
      { question: 'Will it invent experience I do not have?', answer: 'It is instructed not to. It uses only what you wrote and leaves [placeholders] for missing details. Always read the letter and remove anything that is not true.' },
      { question: 'Can I write the letter in Hindi or Hinglish?', answer: 'Yes. Pick the language under the form. Most employers expect English, so check what the company uses.' },
      { question: 'Does it work for freshers?', answer: 'Yes. Choose "Fresher or recent graduate" and it leads with education, projects and internships instead of work history.' },
    ],
  },
  {
    slug: 'resume-bullet-improver', name: 'Resume Bullet Improver', tagline: 'Turn weak duties into strong, result-focused bullet points.', category: 'Career & Resume', kind: 'ai', icon: 'ListChecks',
    description: 'Rewrite your resume bullet points with strong action verbs and results. Paste what you did and get 6 to 8 stronger bullets, plus the numbers worth adding. Free to try.',
    keywords: ['resume bullet points generator', 'improve resume bullets', 'resume action verbs', 'resume achievements examples', 'rewrite resume points', 'resume phrases'],
    edge: [...AI_EDGE, 'Never invents numbers', 'Tells you which numbers to add'],
    intro: [
      'Most resume bullets say what you were responsible for. Recruiters want what you achieved. Paste your current bullets (or just describe the work) with your job title and, if you have it, the job you are applying for, and get six to eight rewritten bullets that start with strong verbs and focus on results.',
      'It will not make up figures. Where a number would help, you get a clear placeholder such as [X%] and a short list of questions to find the real number in your own records. Choose an achievement-focused, short or detailed style, and add keywords you want worked in where they are true.',
    ],
    steps: [
      { title: 'Add your job title and what you did', text: 'Paste your current bullets or describe the work in your own words.' },
      { title: 'Optionally add the target job and keywords', text: 'This tilts the wording toward the role you want.' },
      { title: 'Fill in the real numbers', text: 'Replace each placeholder with a true figure, then paste the bullets into the Resume Builder.' },
    ],
    faqs: [
      { question: 'Does it add numbers and achievements for me?', answer: 'No. Inventing results would put false claims on your resume. It leaves placeholders and asks you the questions that help you find the real figures.' },
      { question: 'Can I use these bullets directly?', answer: 'Use them as a strong draft. Check every line is accurate for you, fill the placeholders, and keep each bullet to one or two lines.' },
      { question: 'Does it work for any field?', answer: 'Yes: sales, teaching, engineering, operations, design, healthcare and more. The more detail you give about the work, the better the result.' },
    ],
  },
];
