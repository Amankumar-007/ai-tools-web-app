import type { ToolAboutContent } from '@/components/ToolPageAbout'

// Supporting copy for the single-purpose tool pages. Each of these pages is an
// input box and a button — enough to use, but far too little indexable text to
// rank for anything, which is what the "low word count" audit finding was
// pointing at. Keyed by route path.
export const TOOL_PAGE_ABOUT: Record<string, ToolAboutContent> = {
  '/prompts': {
    heading: 'About the TomatoAi prompt library',
    intro: [
      'The prompt library is a curated collection of prompts that have been tested against the models people actually use day to day — ChatGPT, Claude, Gemini and Midjourney among them. Each entry is written to be pasted in as-is, with the placeholders clearly marked so you can swap in your own topic, tone or audience.',
      'Prompts are grouped by the job they do rather than by model: writing and editing, research and summarising, coding and debugging, image generation, and marketing. Most transfer cleanly between models, because the structure that makes a prompt work — clear role, explicit constraints, an example of the output you want — is the same everywhere.',
    ],
    steps: [
      { title: 'Browse or search', text: 'Filter by category, or search for the task you have in mind. Every prompt shows the kind of output it produces before you commit to it.' },
      { title: 'Copy and customise', text: 'Copy the prompt and replace the bracketed placeholders with your specifics. The more concrete your details, the less editing the output needs.' },
      { title: 'Run and iterate', text: 'Paste it into your model of choice, or run it straight away in TomatoAI Chat. If the result is close but not right, adjust one constraint at a time rather than rewriting the whole prompt.' },
    ],
    faqs: [
      { question: 'Are these prompts free to use?', answer: 'Yes. Every prompt in the library is free to copy, edit and use commercially. No account is needed to browse or copy them.' },
      { question: 'Which AI models do these prompts work with?', answer: 'They are written to be model-agnostic and work with ChatGPT, Claude, Gemini, Llama and most other chat models. Image prompts are tuned for Midjourney and Stable Diffusion but usually transfer to other image generators with minor edits.' },
      { question: 'Why does the same prompt give me different results?', answer: 'Language models are probabilistic, so the same prompt produces different wording each time. If you need consistency, add explicit constraints — a word count, a format, a worked example of the output you want.' },
      { question: 'How do I write a good prompt myself?', answer: 'Give the model a role, state the task plainly, list your constraints, and show one example of a good answer. Most weak prompts fail because they leave the format and the audience implicit.' },
    ],
  },

  '/prompt-generator': {
    heading: 'About the AI prompt generator',
    intro: [
      'The prompt generator turns a one-line idea into a fully structured prompt. You describe what you want in plain language, and it returns a prompt with an explicit role, task description, constraints, output format and, where useful, a worked example — the elements that separate a prompt that works reliably from one that works occasionally.',
      'It is most useful when you know what you want but not how to ask for it: complex multi-step tasks, prompts you intend to reuse across a team, or prompts that need to produce output in a fixed shape such as JSON, a table or a specific document structure.',
    ],
    steps: [
      { title: 'Describe your goal', text: 'Write what you want the AI to do in one or two sentences. Plain language is fine — "write cold outreach emails for a B2B SaaS" is enough to start.' },
      { title: 'Pick a model', text: 'Choose which model should generate the prompt. Different models phrase instructions differently, and the generator adapts its structure to the one you select.' },
      { title: 'Generate and refine', text: 'Review the structured prompt, edit any constraint that does not match your situation, then copy it into whichever AI tool you are using.' },
    ],
    faqs: [
      { question: 'What makes a generated prompt better than what I write myself?', answer: 'It makes the implicit explicit. The generator always specifies role, task, constraints and output format, which are the parts people most often leave out and the parts that most affect the result.' },
      { question: 'Can I use the generated prompt with any AI tool?', answer: 'Yes. The output is plain text and works with ChatGPT, Claude, Gemini, Perplexity or any other chat model, as well as with API calls.' },
      { question: 'Is the prompt generator free?', answer: 'Yes, it runs on free models and does not require a paid plan. Heavy use is rate-limited to keep the service responsive for everyone.' },
      { question: 'Should I edit the generated prompt?', answer: 'Usually, yes. The generator gives you a solid structure, but it does not know your audience, brand voice or edge cases. Treat it as a first draft to tighten rather than a finished artefact.' },
    ],
  },

  '/content-generator': {
    heading: 'About the AI content generator',
    intro: [
      'The content generator drafts long-form and short-form copy from a brief: blog posts and articles, landing page and ad copy, product descriptions, email sequences and social posts. You supply the topic, the audience and the tone, and it returns a structured draft with headings and paragraphs rather than an undifferentiated block of text.',
      'It is built for the first draft, which is the part of writing that takes longest and matters least. The judgement calls — what claims you can stand behind, which examples are actually yours, where your point of view differs from everyone else writing about the same subject — still need you.',
    ],
    steps: [
      { title: 'Set your brief', text: 'Enter the topic, choose the content type, and describe who you are writing for. The more specific the audience, the less generic the draft.' },
      { title: 'Choose tone and length', text: 'Pick the register you want — professional, conversational, technical, persuasive — and roughly how long the piece should be.' },
      { title: 'Generate, then edit', text: 'Review the draft, cut what is padding, and add the specifics only you have: real numbers, real examples, your own opinion. Then publish.' },
    ],
    faqs: [
      { question: 'Will AI-generated content hurt my search rankings?', answer: 'Google judges content by whether it is helpful and original, not by how it was produced. Published as-is, generic AI drafts tend to perform poorly; used as a starting point and edited with real expertise and examples, they are fine.' },
      { question: 'Who owns the content the generator produces?', answer: 'You do, as between you and TomatoAi, subject to the terms of the underlying model provider. Note that AI models can produce similar text for different users, so output is not guaranteed to be unique.' },
      { question: 'How long can the generated content be?', answer: 'Most content types produce between 300 and 1,500 words in a single pass. For longer pieces, generate section by section using your outline as the brief for each part.' },
      { question: 'Should I fact-check the output?', answer: 'Always. Language models produce fluent text regardless of whether the underlying facts are correct, and they are particularly unreliable on statistics, dates, citations and quotes.' },
    ],
  },

  '/summarization': {
    heading: 'About the AI summarizer',
    intro: [
      'The summarizer condenses long documents, articles and transcripts into something you can read in a minute. Paste text directly or upload a PDF or Word file, and choose the shape of the summary you need: a general overview, bullet points, an executive summary for stakeholders, or an academic abstract that preserves methodology and findings.',
      'It is most useful on material you would otherwise skim badly — research papers, long reports, meeting transcripts, dense contracts — where the risk is not that you miss the detail but that you never read it at all.',
    ],
    steps: [
      { title: 'Add your source', text: 'Paste the text, or upload a PDF, DOCX or TXT file. Longer documents are processed in sections and then combined.' },
      { title: 'Pick a summary style', text: 'General for a plain overview, bullets for scanning, executive for decision-makers, or academic to keep methods and findings intact.' },
      { title: 'Review against the source', text: 'Read the summary alongside the original for anything load-bearing. Summaries compress, and compression always loses nuance somewhere.' },
    ],
    faqs: [
      { question: 'What file formats can I upload?', answer: 'PDF, DOCX and plain text files, as well as text pasted straight into the box. Scanned PDFs without a text layer will not extract properly.' },
      { question: 'Is my document stored after summarising?', answer: 'No. Uploads are processed for the duration of the request and are not retained afterwards. The text is sent to the model provider that generates the summary, so avoid uploading confidential material.' },
      { question: 'How accurate are AI summaries?', answer: 'Good on structure and main arguments, less reliable on specific numbers, names and caveats. For anything consequential, check the summary against the source before acting on it.' },
      { question: 'How long can a document be?', answer: 'Long documents are split into sections and summarised in passes, so there is no hard page limit, though very long files take proportionally longer to process.' },
    ],
  },

  '/resume-analyzer': {
    heading: 'About the AI resume analyzer',
    intro: [
      'The resume analyzer reads your CV the way an applicant tracking system does and tells you where it falls down. It scores ATS compatibility, flags formatting that parsers commonly mangle, checks whether your experience is written as measurable achievements rather than duties, and identifies keywords missing relative to the role you are targeting.',
      'Most resumes are rejected for mundane reasons — a two-column layout the parser cannot read, dates in an inconsistent format, a skills section that never mentions the terms in the job posting. Those are exactly the problems worth catching before a human ever sees the document.',
    ],
    steps: [
      { title: 'Upload your resume', text: 'Upload a PDF or DOCX. The analyzer extracts the text the same way an ATS would, so you can see what actually comes through.' },
      { title: 'Add the target role', text: 'Paste the job description you are applying for. Keyword and skills analysis is far more useful when it has something concrete to compare against.' },
      { title: 'Work through the findings', text: 'Fix the structural issues first — they cost you the most — then rewrite weak bullets as achievements with numbers attached.' },
    ],
    faqs: [
      { question: 'What is an ATS score and does it matter?', answer: 'It estimates how cleanly an applicant tracking system can parse and match your resume. It is not a score any employer sees, but a resume that parses badly can be filtered out before a recruiter reads it.' },
      { question: 'Is my resume kept after the analysis?', answer: 'No. The file is processed for the request and is not stored afterwards. It is sent to the AI provider that performs the analysis, so remove anything you would not want processed by a third party.' },
      { question: 'How do I improve a low score?', answer: 'Use a single-column layout, standard section headings, and a common font. Then mirror the language of the job description in your skills and experience, and rewrite duties as results with concrete numbers.' },
      { question: 'Should I use a different resume for each application?', answer: 'For roles you care about, yes. The keyword analysis works best when the resume is tailored to one posting rather than written to cover every role you might want.' },
    ],
  },

  '/optimize-with-ai': {
    heading: 'About the AI text optimizer',
    intro: [
      'The optimizer takes writing you have already done and makes it sharper: tightening padded sentences, fixing grammar and flow, adjusting register, and cutting the throat-clearing that creeps into first drafts. It edits rather than rewrites, so the result still sounds like you.',
      'It works well on emails you want to sound more direct, documentation that has grown woolly, marketing copy that says nothing in many words, and any text where you can tell something is off but cannot pin down what.',
    ],
    steps: [
      { title: 'Paste your text', text: 'Drop in the paragraph, email or document section you want improved. Shorter passages get more focused edits than very long ones.' },
      { title: 'Choose your goal', text: 'Say what you want — clearer, shorter, more formal, more persuasive. Without a goal the optimizer defaults to general clarity.' },
      { title: 'Compare and accept', text: 'Read the revision against your original. Keep the changes that genuinely improve it and discard any that flatten your voice.' },
    ],
    faqs: [
      { question: 'How is this different from a grammar checker?', answer: 'A grammar checker fixes errors. The optimizer also restructures sentences, cuts redundancy and adjusts tone, which is where most of the improvement in ordinary writing actually comes from.' },
      { question: 'Will it change my writing voice?', answer: 'It aims not to. If a revision reads as generic, shorten the passage you submit and be explicit about the tone you want to keep.' },
      { question: 'Which model powers it?', answer: 'It runs on Google Gemini Flash, chosen for fast responses on short passages. Model availability can change as providers update their offerings.' },
      { question: 'Is there a length limit?', answer: 'Very long submissions are truncated. For a full document, optimise it section by section — you will get better edits that way in any case.' },
    ],
  },

  '/roadmap': {
    heading: 'About the AI learning roadmap generator',
    intro: [
      'The roadmap generator turns a subject you want to learn into a sequenced, visual plan. Instead of a flat list of resources, you get stages that build on each other, with the prerequisites made explicit, so you can see what has to come before what and roughly how long each stage takes.',
      'It is aimed at the situation where the problem is not motivation but ordering: you know you want to learn machine learning, or backend development, or data analysis, and the hard part is working out what to do first and what can safely wait.',
    ],
    steps: [
      { title: 'Name your topic', text: 'Enter the skill or subject you want to learn. Being specific helps — "React for production apps" gives a sharper plan than "web development".' },
      { title: 'Set your starting point', text: 'Say what you already know. The roadmap skips fundamentals you have covered rather than starting everyone from zero.' },
      { title: 'Follow the sequence', text: 'Work through the stages in order. Each one lists the concepts to cover and what you should be able to build by the end of it.' },
    ],
    faqs: [
      { question: 'What subjects can I generate a roadmap for?', answer: 'Any learnable skill — programming languages, design, data science, marketing, languages, music. The plans are strongest for technical subjects with well-established learning paths.' },
      { question: 'Are specific courses or books recommended?', answer: 'The roadmap focuses on concepts and sequence rather than naming particular products, because specific resources date quickly. Search for current material once you know what each stage requires.' },
      { question: 'How accurate are the time estimates?', answer: 'They assume steady part-time study and vary widely by person. Treat them as relative weights showing which stages are larger, not as deadlines.' },
      { question: 'Can I change the roadmap after generating it?', answer: 'Yes. Regenerate with a more specific topic or a different starting level to get a plan that fits your situation more closely.' },
    ],
  },

  '/outlier': {
    heading: 'About Outlier AI',
    intro: [
      'Outlier transforms a piece of content into a different form: reframing an article as a thread, turning notes into structured prose, converting a long explanation into something a non-specialist can follow, or shifting a piece from one register to another. It is a transformation tool rather than a generation tool — you bring the substance, it changes the shape.',
      'That distinction matters in practice. Because the source material is yours, the output keeps your facts and your argument, and avoids the generic quality of text written from a prompt alone.',
    ],
    steps: [
      { title: 'Paste your content', text: 'Add the text you want transformed. It can be rough — notes, a transcript, a first draft.' },
      { title: 'Describe the target form', text: 'Say what you want it to become: a summary, a thread, a simpler explanation, a more formal version.' },
      { title: 'Review the result', text: 'Check that the transformation preserved your meaning. Reshaping text can quietly drop qualifications that mattered.' },
    ],
    faqs: [
      { question: 'What kinds of transformation work best?', answer: 'Changing register, changing format and changing audience. Transformations that require new facts the source does not contain work least well, because the model will invent them.' },
      { question: 'Which model does Outlier use?', answer: 'Google Gemini Flash, selected for low latency on medium-length passages.' },
      { question: 'Is Outlier free to use?', answer: 'Yes, it is free to try, with rate limits applied per IP address to keep the service available.' },
      { question: 'How is this different from the content generator?', answer: 'The content generator writes from a brief. Outlier reshapes content you already have, which keeps your facts and your point of view intact.' },
    ],
  },

  '/ai-workflows': {
    heading: 'About AI workflows',
    intro: [
      'An AI workflow chains several tools together so that the output of one becomes the input of the next. Instead of moving text by hand between a research tool, a writing tool and an image generator, the workflow runs the sequence for you and returns the finished result.',
      'The workflows here are pre-built for jobs that genuinely take several steps: turning a topic into a researched article, converting a long video into a set of social posts, or taking a product description through copy, images and ad variants. Each one shows the steps it runs and which tools it uses before you start it.',
    ],
    steps: [
      { title: 'Pick a workflow', text: 'Browse the available workflows and open the one matching your task. Each shows its steps and expected output up front.' },
      { title: 'Provide the input', text: 'Give the workflow its starting material — a topic, a URL, a document or a brief.' },
      { title: 'Review each stage', text: 'The workflow surfaces intermediate output as well as the final result, so you can see where a run went wrong and re-run just that stage.' },
    ],
    faqs: [
      { question: 'How is a workflow different from a single prompt?', answer: 'A prompt is one call to one model. A workflow is a sequence of calls where each step is specialised and receives the previous step\'s output, which produces better results on multi-stage tasks than asking one model to do everything at once.' },
      { question: 'Can I edit a workflow\'s steps?', answer: 'The pre-built workflows run a fixed sequence. If you need a different chain, the n8n templates library is designed for building custom automations.' },
      { question: 'How long does a workflow take to run?', answer: 'Most complete in under a minute. Workflows that involve image generation or long documents take longer, because each stage waits for the previous one to finish.' },
      { question: 'Do I need an account?', answer: 'Browsing workflows is open to everyone. Running one requires an account so that usage can be attributed and rate-limited fairly.' },
    ],
  },

  '/n8n-templates': {
    heading: 'About the n8n template library',
    intro: [
      'n8n is an open-source workflow automation tool: you connect nodes representing services and actions, and n8n runs the chain when a trigger fires. These templates are complete workflows exported as JSON, covering AI agents, email and CRM automation, document processing, research pipelines and social media publishing.',
      'Each template is a starting point rather than a finished system. Import it, point it at your own accounts and credentials, and adjust the logic to match how your team actually works — the value is in not having to wire the structure up from scratch.',
    ],
    steps: [
      { title: 'Find a template', text: 'Filter by category or search for the service you want to automate. Each template lists the nodes it uses and what it does.' },
      { title: 'Copy the JSON', text: 'Copy the workflow JSON, then use Import from Clipboard in your n8n workspace to bring it in whole.' },
      { title: 'Add credentials and test', text: 'Connect your own API keys and accounts, run the workflow manually once to confirm each node behaves as expected, then activate it.' },
    ],
    faqs: [
      { question: 'Are these templates free?', answer: 'Yes. Every template is free to copy, modify and use, including commercially.' },
      { question: 'Do I need my own n8n instance?', answer: 'Yes. The templates are workflow definitions, not a hosted service. Run them on n8n Cloud or a self-hosted n8n instance.' },
      { question: 'Will a template work without changes?', answer: 'Rarely. Every workflow needs your own credentials, and most need their logic adjusted for your data and process. Treat them as a structure to adapt.' },
      { question: 'What are the AI agent templates?', answer: 'Workflows where an LLM node decides which tools to call rather than following a fixed path — useful for tasks such as triaging inbound email or answering questions against your own documents.' },
    ],
  },

  '/search-thumbnail': {
    heading: 'About AI image and thumbnail search',
    intro: [
      'Thumbnail search finds images for a piece of content by describing what you need rather than guessing at keywords. You describe the subject, mood or composition, and it searches high-quality image sources and returns options suited to video thumbnails, article headers and social cards.',
      'It is aimed at the point in publishing where the writing is done and you need a visual that fits, without spending twenty minutes scrolling stock libraries for something that is nearly right.',
    ],
    steps: [
      { title: 'Describe the image', text: 'Say what you want to see. Describing the mood and composition — "wide shot, muted colours, single figure" — works better than a single noun.' },
      { title: 'Review the results', text: 'Scan the returned images at thumbnail size, which is how most of them will actually be seen.' },
      { title: 'Check the licence', text: 'Confirm the usage terms at the source before publishing, particularly for commercial use.' },
    ],
    faqs: [
      { question: 'Where do the images come from?', answer: 'From established image sources including Unsplash and Pexels. Licence terms are set by the source, not by TomatoAi.' },
      { question: 'Can I use these images commercially?', answer: 'Usually, but check each image at its source. Licences differ and some require attribution.' },
      { question: 'What makes a good video thumbnail?', answer: 'A clear focal point, strong contrast, and legibility at small sizes. Judge every candidate at thumbnail scale rather than full size.' },
      { question: 'Does this generate images with AI?', answer: 'No — it searches existing photography. For generated images, see the image generation tools in the AI tools directory.' },
    ],
  },
}
