// Extended editorial content for the /ai-tools/[slug] detail pages.
// Keyed by the tool's slug in public/data/ai-tools.json. Only the most
// visited tools are covered here; getToolContent() returns undefined for
// everything else and the page falls back to the base description only.
export interface ToolContentEntry {
  overview: string
  howItWorks: string
  freeTierInfo: string
  useCases: string[]
  pros: string[]
  cons: string[]
  faqs: { question: string; answer: string }[]
}

export const toolContent: Record<string, ToolContentEntry> = {
  chatgpt: {
    overview:
      "ChatGPT is OpenAI's conversational AI assistant, built on the GPT family of large language models. It can hold multi-turn conversations, write and debug code, summarize documents, analyze uploaded files and images, browse the web for current information, and generate images via DALL·E — all from a single chat interface.",
    howItWorks:
      "You type a prompt or question in plain language, and ChatGPT generates a response by predicting the most likely next words based on patterns learned from massive amounts of text during training. It keeps track of the conversation history in a session, so you can ask follow-up questions, request revisions, or attach files and images for it to analyze.",
    freeTierInfo:
      "The free plan gives access to a capable GPT model with usage limits, web browsing, and basic file uploads. Paid plans (Plus, Pro, Team, Enterprise) unlock the most advanced reasoning models, higher/unlimited usage, faster responses, and additional tools like advanced data analysis and larger file uploads.",
    useCases: [
      "Drafting and editing emails, blog posts, and marketing copy",
      "Explaining or debugging code in dozens of programming languages",
      "Summarizing long documents, PDFs, or research papers",
      "Brainstorming ideas, outlines, and business plans",
      "Answering general knowledge questions and tutoring on new topics",
    ],
    pros: [
      "Extremely versatile across writing, coding, and analysis tasks",
      "Large, active ecosystem of plugins, custom GPTs, and API integrations",
      "Regularly updated with newer, more capable models",
      "Mobile, desktop, and browser apps available",
    ],
    cons: [
      "Can occasionally produce confidently wrong answers (hallucinations)",
      "Free tier has usage caps and access to fewer features",
      "Heavy or advanced use requires a paid subscription",
    ],
    faqs: [
      {
        question: "Is ChatGPT free to use?",
        answer:
          "Yes, there is a free tier with a capable model and daily usage limits. Paid plans remove most limits and unlock more advanced models and features.",
      },
      {
        question: "Can ChatGPT access the internet?",
        answer:
          "Yes, when browsing is enabled it can search the web and cite sources for questions about current events or recent information.",
      },
      {
        question: "What is ChatGPT best used for?",
        answer:
          "Writing, coding help, research summarization, and general Q&A are its strongest use cases, though it can assist with almost any text-based task.",
      },
    ],
  },

  claude: {
    overview:
      "Claude is Anthropic's family of AI assistants, known for strong reasoning, long-context understanding, and careful, well-structured writing. It's widely used for coding, document analysis, research, and collaborative writing, and supports uploading files like PDFs, spreadsheets, and images directly into the conversation.",
    howItWorks:
      "Claude processes your prompt (and any attached files) and generates a response using a transformer-based language model trained on text and code. Its larger context window lets it read and reason over very long documents or entire codebases in a single conversation, keeping track of earlier context as you go back and forth.",
    freeTierInfo:
      "The free tier gives access to a capable Claude model with daily message limits. Paid plans (Pro, Max, Team, Enterprise) raise usage limits significantly, unlock the most capable models, and add features like Projects, larger file uploads, and priority access during peak times.",
    useCases: [
      "Reviewing, refactoring, and writing code across large codebases",
      "Analyzing long contracts, reports, or research papers",
      "Long-form writing and editing with a consistent tone",
      "Summarizing meeting transcripts or lengthy documents",
      "Building AI agents and tools via the Claude API",
    ],
    pros: [
      "Very strong at following detailed, multi-step instructions",
      "Large context window for handling long documents and codebases",
      "Careful, well-reasoned responses with less filler",
      "Native file and image analysis in every plan",
    ],
    cons: [
      "Free tier message limits are relatively low for heavy users",
      "No native web browsing on some plans/clients compared to competitors",
      "Image generation is not built in the way it is with some rivals",
    ],
    faqs: [
      {
        question: "Is Claude free to use?",
        answer:
          "Yes, Claude has a free plan with daily message limits. Paid tiers increase those limits and unlock the most capable models.",
      },
      {
        question: "What makes Claude different from ChatGPT?",
        answer:
          "Claude is particularly strong at long-document analysis, coding, and following detailed instructions precisely, thanks to its large context window and reasoning-focused training.",
      },
      {
        question: "Can I use Claude for coding?",
        answer:
          "Yes, Claude is widely used for writing, reviewing, and debugging code, and it powers coding-focused tools like Claude Code.",
      },
    ],
  },

  gemini: {
    overview:
      "Gemini is Google's multimodal AI assistant, deeply integrated with Google Search, Workspace (Docs, Gmail, Sheets), and Android. It can understand text, images, audio, and video in a single prompt, and pulls in real-time information from Google Search when needed.",
    howItWorks:
      "Gemini runs on Google's multimodal large language models, which are trained to process combinations of text, images, code, and audio together rather than treating each as a separate task. When connected to Google apps, it can read your Gmail, Docs, or Calendar (with permission) to answer questions grounded in your own data.",
    freeTierInfo:
      "A free tier is available to any Google account with generous daily usage of a solid model. The paid Google One AI Premium plan unlocks the most advanced Gemini models, higher limits, and deeper integration across Gmail, Docs, and other Workspace apps.",
    useCases: [
      "Answering questions with up-to-date web information via Search grounding",
      "Summarizing emails, documents, and spreadsheets inside Google Workspace",
      "Analyzing images, screenshots, and short videos",
      "Coding assistance and debugging",
      "Planning trips, schedules, and research grounded in real-time data",
    ],
    pros: [
      "Tight integration with Gmail, Docs, Sheets, and Android",
      "Strong multimodal understanding (text, image, audio, video)",
      "Free tier is usable for most everyday tasks",
      "Real-time grounding via Google Search",
    ],
    cons: [
      "Best integration features require a Google Workspace/One subscription",
      "Response style can be more conservative than some competitors",
      "Advanced reasoning models are gated behind the paid tier",
    ],
    faqs: [
      {
        question: "Is Gemini free?",
        answer:
          "Yes, any Google account can use Gemini for free with daily limits. A paid Google One AI Premium plan unlocks higher limits and the most capable models.",
      },
      {
        question: "Does Gemini work with Gmail and Docs?",
        answer:
          "Yes, with permission it can read and summarize your Gmail, Docs, and Sheets content to answer questions grounded in your own files.",
      },
      {
        question: "Can Gemini search the internet?",
        answer:
          "Yes, it can ground responses in real-time Google Search results for questions about current events or recent information.",
      },
    ],
  },

  perplexity: {
    overview:
      "Perplexity is an AI-powered answer engine that combines a chatbot interface with real-time web search. Instead of just returning a list of links like a traditional search engine, it reads the top sources and writes a direct, cited answer to your question.",
    howItWorks:
      "When you ask a question, Perplexity searches the web (and optionally academic sources, or specific domains), retrieves the most relevant pages, then uses a language model to synthesize a summarized answer with inline citations linking back to the original sources.",
    freeTierInfo:
      "The free tier includes unlimited basic searches and a limited number of \"Pro\" searches using more advanced models per day. The Pro subscription unlocks more Pro searches, additional AI models to choose from, file uploads, and image generation.",
    useCases: [
      "Fact-checking and research with clickable source citations",
      "Quickly summarizing news or current events",
      "Academic and technical research with focused source filtering",
      "Comparing products, services, or options with cited data",
      "Getting quick answers without wading through multiple search results",
    ],
    pros: [
      "Answers include clickable citations back to original sources",
      "Faster than manually reading multiple search results",
      "Can focus searches on academic papers, Reddit, or specific domains",
      "Useful free tier for everyday research",
    ],
    cons: [
      "Advanced models and higher usage require a Pro subscription",
      "Summaries can occasionally misrepresent nuance from source articles",
      "Less suited to long, open-ended creative writing than chat-first tools",
    ],
    faqs: [
      {
        question: "Is Perplexity free to use?",
        answer:
          "Yes, the free tier covers unlimited standard searches plus a daily allowance of more advanced Pro searches.",
      },
      {
        question: "How is Perplexity different from Google Search?",
        answer:
          "Instead of a list of links, Perplexity reads top results and writes a direct, cited summary answer, saving you from opening multiple tabs.",
      },
      {
        question: "Does Perplexity cite its sources?",
        answer:
          "Yes, every answer includes numbered citations linking to the exact pages it used, so you can verify the information yourself.",
      },
    ],
  },

  midjourney: {
    overview:
      "Midjourney is an AI image generator known for producing highly detailed, artistic, and stylized images from text prompts. It's popular with illustrators, concept artists, and designers for its distinctive aesthetic quality compared to more photorealistic-focused generators.",
    howItWorks:
      "You describe the image you want in a text prompt, and Midjourney's diffusion-based model generates several variations. You can then upscale a favorite, ask for variations of it, blend reference images together, or use parameters to control style, aspect ratio, and level of detail.",
    freeTierInfo:
      "Midjourney no longer offers an ongoing free trial for new accounts — it requires a paid subscription starting at a low monthly tier, billed either monthly or annually, with higher tiers unlocking faster generation and more monthly image credits.",
    useCases: [
      "Concept art and illustration for games, books, and films",
      "Marketing visuals, mood boards, and social media graphics",
      "Rapid visual brainstorming for design projects",
      "Creating stylized portraits, characters, and environments",
      "Generating textures and backgrounds for creative projects",
    ],
    pros: [
      "Distinctive, high-quality artistic output style",
      "Active community and constantly improving model versions",
      "Fine-grained style and parameter controls for advanced users",
      "Strong at composition, lighting, and detail",
    ],
    cons: [
      "No free tier — requires a paid plan to use",
      "Primarily accessed through Discord or a web app, which has a learning curve",
      "Less precise text-in-image rendering than some competitors",
    ],
    faqs: [
      {
        question: "Is Midjourney free?",
        answer:
          "No, Midjourney requires a paid subscription to generate images; there is no ongoing free tier for new users.",
      },
      {
        question: "Do I need Discord to use Midjourney?",
        answer:
          "You can generate images through Midjourney's own web app now, though many users still use the original Discord-based workflow.",
      },
      {
        question: "Who owns images made with Midjourney?",
        answer:
          "Paying subscribers generally own the images they create, subject to Midjourney's terms of service — check the current terms for commercial use specifics.",
      },
    ],
  },

  "dall-e-3": {
    overview:
      "DALL·E 3 is OpenAI's text-to-image model, integrated directly into ChatGPT and available via the OpenAI API. It's particularly good at following detailed, literal prompts and rendering readable text inside generated images.",
    howItWorks:
      "You describe a scene or image in natural language, and ChatGPT first refines your prompt for clarity before DALL·E 3 generates the image. This extra prompt-rewriting step is why DALL·E 3 tends to follow complex instructions more literally than generators that work directly off the raw prompt.",
    freeTierInfo:
      "Image generation is bundled into ChatGPT's free tier with limited daily generations, and into paid ChatGPT plans with higher limits. It's also available pay-as-you-go through the OpenAI API for developers building it into their own apps.",
    useCases: [
      "Illustrating blog posts and social media content",
      "Generating images with accurate, readable text (posters, signs, logos)",
      "Quick visual mockups for product or marketing ideas",
      "Children's book and storyboard illustration",
      "Prototyping visual concepts before hiring a designer",
    ],
    pros: [
      "Excellent at following detailed, literal prompts",
      "Best-in-class at rendering legible text within images",
      "Built into ChatGPT, so no separate account is needed",
      "Available via API for developers",
    ],
    cons: [
      "Free tier has a limited number of generations per day",
      "Less distinctive artistic style than dedicated art-focused generators",
      "Some content policies restrict certain prompt types",
    ],
    faqs: [
      {
        question: "Is DALL·E 3 free?",
        answer:
          "It's included in ChatGPT's free plan with a daily generation limit; paid ChatGPT plans and the API offer higher usage.",
      },
      {
        question: "Can DALL·E 3 write text inside images accurately?",
        answer:
          "Yes, it's one of the strongest image generators for producing clear, correctly spelled text within an image, such as on signs or posters.",
      },
      {
        question: "How do I access DALL·E 3?",
        answer:
          "Through ChatGPT's image tool directly, or programmatically via the OpenAI API if you're building it into your own product.",
      },
    ],
  },

  "stable-diffusion": {
    overview:
      "Stable Diffusion is an open-source text-to-image model that can be run for free on your own hardware or through numerous third-party hosted services. Its open license makes it the foundation for a huge ecosystem of custom models, fine-tunes, and creative tools.",
    howItWorks:
      "The model starts from random noise and progressively \"denoises\" it over many steps, guided by your text prompt, until a coherent image emerges. Because the model weights are openly available, developers can fine-tune custom versions for specific styles, characters, or subjects.",
    freeTierInfo:
      "The core model is free and open-source — you can download and run it yourself at no cost if you have a capable GPU. Many hosted platforms built on top of it (like DreamStudio or various web UIs) offer free credits with paid tiers for heavier usage.",
    useCases: [
      "Running custom, fine-tuned image models locally for full control and privacy",
      "Building custom creative tools and apps on top of an open model",
      "Generating art, concept designs, and photorealistic images",
      "Training specialized models for a specific art style or product",
      "Batch or automated image generation pipelines",
    ],
    pros: [
      "Free and open-source — no subscription required to run it yourself",
      "Huge ecosystem of community fine-tunes and extensions",
      "Full control over hosting, privacy, and customization",
      "Runs locally without sending data to a third party",
    ],
    cons: [
      "Requires a capable GPU and technical setup to run locally",
      "Hosted/managed versions charge for compute and higher usage",
      "Steeper learning curve than simple prompt-box tools",
    ],
    faqs: [
      {
        question: "Is Stable Diffusion completely free?",
        answer:
          "The model itself is free and open-source. Running it locally costs nothing beyond your own hardware; hosted services built on it may charge for compute.",
      },
      {
        question: "Do I need a powerful computer to use it?",
        answer:
          "To run it locally at good speed you'll want a dedicated GPU with sufficient VRAM; otherwise, hosted web services let you generate images without local hardware.",
      },
      {
        question: "Can I fine-tune Stable Diffusion on my own images?",
        answer:
          "Yes, its open architecture supports fine-tuning and custom training, which is why so many specialized community models exist.",
      },
    ],
  },

  synthesia: {
    overview:
      "Synthesia is an AI video generation platform that turns text scripts into videos featuring realistic AI avatars speaking in dozens of languages. It's widely used for corporate training, product explainer videos, and marketing content without needing a camera, actors, or studio.",
    howItWorks:
      "You write or paste a script, choose from a library of AI avatars (or create a custom digital twin of a real person), pick a voice and language, and Synthesia generates a video of the avatar speaking your script with matching lip movements and natural gestures.",
    freeTierInfo:
      "A free plan lets you create a limited number of short videos per month with a subset of avatars. Paid plans increase video length and volume, unlock the full avatar library, custom avatars, and team collaboration features.",
    useCases: [
      "Corporate training and onboarding videos",
      "Product demos and explainer videos in multiple languages",
      "Localizing marketing videos without reshooting with new actors",
      "Internal communications and HR announcements",
      "Course content for online learning platforms",
    ],
    pros: [
      "No camera, actors, or studio needed to produce professional video",
      "Supports dozens of languages and accents from one script",
      "Custom avatars can be built from a real person's likeness",
      "Fast turnaround compared to traditional video production",
    ],
    cons: [
      "Avatars can still look slightly artificial in close-up, high-motion scenes",
      "Free tier is limited to short videos and few avatars",
      "Best value requires a business-tier subscription",
    ],
    faqs: [
      {
        question: "Is Synthesia free to use?",
        answer:
          "Yes, there's a free plan with a limited number of short videos per month; paid plans unlock longer videos, more avatars, and custom avatars.",
      },
      {
        question: "Can Synthesia create videos in different languages?",
        answer:
          "Yes, it supports generating the same script as a spoken video in dozens of languages and accents without re-recording.",
      },
      {
        question: "Do I need video editing skills to use Synthesia?",
        answer:
          "No, the interface is script-based and designed for non-video-editors — you write text and select an avatar and voice.",
      },
    ],
  },

  "runway-ml": {
    overview:
      "Runway (Runway ML) is a suite of AI-powered video creation and editing tools, including text-to-video and image-to-video generation, green-screen removal, and other AI video effects. It's popular with filmmakers and content creators for both generative video and traditional editing enhanced by AI.",
    howItWorks:
      "You provide a text prompt, image, or existing video clip, and Runway's generative models produce or transform video accordingly — for example, animating a still image into a short video clip, or automatically removing a background without a physical green screen.",
    freeTierInfo:
      "A free tier offers a limited number of generation credits to try the tools. Paid plans (Standard, Pro, Unlimited, Enterprise) provide monthly credit allowances for video generation and unlock higher resolution, longer clips, and faster processing.",
    useCases: [
      "Generating short video clips from text prompts or still images",
      "Removing or replacing video backgrounds without a green screen",
      "Extending, inpainting, or editing existing video footage with AI",
      "Rapid pre-visualization for film and ad concepts",
      "Creating B-roll and social media video content",
    ],
    pros: [
      "One of the most capable text-to-video and image-to-video generators",
      "Combines generative AI with practical editing tools in one app",
      "Frequent model updates improving quality and consistency",
      "Useful free tier to test before subscribing",
    ],
    cons: [
      "Generation credits are consumed quickly with heavier use",
      "Higher-resolution, longer clips require a paid plan",
      "Generated video can still show artifacts in complex motion",
    ],
    faqs: [
      {
        question: "Is Runway free?",
        answer:
          "There's a free tier with limited generation credits; ongoing or heavier use requires a paid subscription for more credits and features.",
      },
      {
        question: "What can Runway generate videos from?",
        answer:
          "You can generate video from a text prompt, from a single image, or by editing/extending existing video footage.",
      },
      {
        question: "Is Runway only for generating new video, or can it edit existing footage too?",
        answer:
          "Both — it includes generative tools as well as AI-assisted editing features like background removal, inpainting, and video extension.",
      },
    ],
  },

  "jasper-ai": {
    overview:
      "Jasper is an AI content platform aimed at marketing teams and businesses, focused on generating on-brand copy at scale — blog posts, ad copy, social captions, and email campaigns — using brand voice and style guides trained on a company's existing content.",
    howItWorks:
      "You set up a brand voice profile from your existing content and guidelines, then use templates or a chat interface to generate copy for specific formats (ads, blogs, emails). Jasper applies your brand voice settings so output matches your company's tone consistently across a team.",
    freeTierInfo:
      "Jasper does not offer an ongoing free plan, but typically provides a free trial period to test the platform. After the trial, plans are priced per seat and scale up with more brand voices, workflows, and enterprise features.",
    useCases: [
      "Producing on-brand marketing copy at scale across a team",
      "Long-form blog posts and SEO content",
      "Ad copy and social media captions for campaigns",
      "Email marketing sequences and product descriptions",
      "Maintaining consistent brand voice across multiple writers",
    ],
    pros: [
      "Strong brand-voice training for consistent team-wide output",
      "Built specifically for marketing workflows and campaigns",
      "Templates cover most common marketing content formats",
      "Collaboration features suited to teams, not just individuals",
    ],
    cons: [
      "No permanent free tier — paid subscription required after trial",
      "Pricier than general-purpose chat AI tools for individual use",
      "Best value is realized by teams, less so by solo users",
    ],
    faqs: [
      {
        question: "Is Jasper AI free?",
        answer:
          "Jasper typically offers a free trial rather than an ongoing free plan; after that, it's a paid, per-seat subscription.",
      },
      {
        question: "What is Jasper best used for?",
        answer:
          "It's built for marketing teams that need consistent, on-brand copy at scale across blogs, ads, and social content.",
      },
      {
        question: "How is Jasper different from ChatGPT for marketing copy?",
        answer:
          "Jasper adds brand-voice training, campaign templates, and team workflows specifically tailored to marketing, rather than being a general-purpose assistant.",
      },
    ],
  },

  grammarly: {
    overview:
      "Grammarly is an AI writing assistant that checks grammar, spelling, punctuation, tone, and clarity in real time as you write, across browsers, desktop apps, and Microsoft Office/Google Docs integrations. Its AI features also help rewrite sentences, adjust tone, and generate content.",
    howItWorks:
      "Grammarly's browser extension or app monitors what you type and flags issues using a mix of rule-based grammar checks and machine learning models trained on large volumes of writing. It suggests corrections inline, and its generative features can rewrite or expand text based on a prompt.",
    freeTierInfo:
      "The free plan covers core grammar, spelling, and punctuation checks everywhere you type. Premium and Business plans add tone adjustments, fluency and clarity rewrites, plagiarism detection, and more advanced generative writing features.",
    useCases: [
      "Catching grammar, spelling, and punctuation mistakes while typing anywhere online",
      "Adjusting tone for emails, reports, and professional communication",
      "Checking for plagiarism in academic or professional writing",
      "Improving clarity and conciseness in long documents",
      "Team style-guide enforcement for consistent business writing",
    ],
    pros: [
      "Works across almost any app or website via browser extension",
      "Free tier already covers the core grammar/spelling checks",
      "Real-time suggestions with clear explanations",
      "Business plans support brand style guides and admin controls",
    ],
    cons: [
      "Advanced tone, clarity, and plagiarism features require a paid plan",
      "Occasional suggestions can feel overly aggressive or generic",
      "Full functionality depends on the extension being installed everywhere you write",
    ],
    faqs: [
      {
        question: "Is Grammarly free?",
        answer:
          "Yes, the free plan covers core grammar, spelling, and punctuation checking. Premium adds tone, clarity, and plagiarism features.",
      },
      {
        question: "Does Grammarly work in Google Docs and Microsoft Word?",
        answer:
          "Yes, it integrates directly with Google Docs, Microsoft Word, and most browsers, email clients, and social platforms.",
      },
      {
        question: "Can Grammarly rewrite sentences for me, not just correct them?",
        answer:
          "Yes, its generative AI features can rewrite sentences for tone, clarity, or length, in addition to basic corrections.",
      },
    ],
  },

  "notion-ai": {
    overview:
      "Notion AI is an AI assistant built directly into Notion, the all-in-one workspace for notes, docs, wikis, and project management. It can write, summarize, translate, and answer questions about your own Notion pages and connected data without leaving the app.",
    howItWorks:
      "Inside any Notion page, you can invoke AI to draft content, summarize a page, translate text, fix grammar, or generate an action-item list from meeting notes. Notion AI's Q&A feature can also search across your entire connected workspace to answer questions grounded in your team's own documents.",
    freeTierInfo:
      "Notion itself has a generous free plan for personal use, but Notion AI features require an add-on subscription or are bundled into certain paid Notion plans, billed per member per month.",
    useCases: [
      "Summarizing long meeting notes or documents into key takeaways",
      "Drafting project briefs, memos, and status updates directly in your workspace",
      "Answering questions by searching across your team's Notion pages",
      "Translating or fixing grammar in existing notes",
      "Generating action items and to-do lists from raw notes",
    ],
    pros: [
      "Answers are grounded in your own team's documents, not just generic knowledge",
      "No need to copy-paste between a separate chat tool and your notes",
      "Useful across writing, summarizing, and Q&A in one integration",
      "Works within a workspace many teams already use daily",
    ],
    cons: [
      "Requires an active Notion workspace to use at all",
      "AI features are a paid add-on rather than included free",
      "Less flexible than a standalone general-purpose chatbot",
    ],
    faqs: [
      {
        question: "Is Notion AI free?",
        answer:
          "Notion has a free plan for the base workspace, but the AI features require a paid add-on or an AI-inclusive paid plan.",
      },
      {
        question: "Can Notion AI answer questions about my own documents?",
        answer:
          "Yes, its Q&A feature searches across your connected Notion workspace to ground answers in your team's own notes and docs.",
      },
      {
        question: "Do I need a separate app to use Notion AI?",
        answer:
          "No, it's built directly into the Notion editor, so you can use it inline on any page without switching tools.",
      },
    ],
  },

  "github-copilot": {
    overview:
      "GitHub Copilot is an AI pair-programmer that integrates into code editors like VS Code, Visual Studio, and JetBrains IDEs. It suggests code completions, whole functions, and can answer coding questions in a chat panel based on the context of your open files.",
    howItWorks:
      "As you type code, Copilot analyzes your current file and surrounding context, then suggests the next lines or entire function bodies using a code-trained language model. Its chat mode lets you ask it to explain code, fix bugs, write tests, or refactor a selection directly inside your editor.",
    freeTierInfo:
      "A limited free tier is available to individual developers with a monthly cap on completions and chat interactions. Paid plans (Pro, Pro+, Business, Enterprise) remove most limits and add more powerful models, organization-wide policy controls, and codebase-aware features.",
    useCases: [
      "Autocompleting boilerplate and repetitive code as you type",
      "Generating unit tests for existing functions",
      "Explaining unfamiliar code or error messages",
      "Refactoring and fixing bugs via in-editor chat",
      "Scaffolding new functions or files from a natural-language description",
    ],
    pros: [
      "Deep integration with popular IDEs and GitHub itself",
      "Speeds up writing repetitive or boilerplate code significantly",
      "Chat mode can explain, fix, and refactor in context",
      "Free tier available for individual developers to try",
    ],
    cons: [
      "Free tier has meaningful monthly usage limits",
      "Suggestions occasionally need manual correction for correctness or style",
      "Best experience requires a paid plan for heavier daily use",
    ],
    faqs: [
      {
        question: "Is GitHub Copilot free?",
        answer:
          "There's a limited free tier for individuals with capped monthly usage; paid plans increase limits and add more capable models.",
      },
      {
        question: "Which code editors support Copilot?",
        answer:
          "It works in VS Code, Visual Studio, JetBrains IDEs, Neovim, and directly on GitHub.com, among others.",
      },
      {
        question: "Can Copilot write entire functions, not just single-line suggestions?",
        answer:
          "Yes, it can generate whole functions or files from a comment or natural-language description, and its chat mode can build multi-file changes.",
      },
    ],
  },

  cursor: {
    overview:
      "Cursor is an AI-first code editor built as a fork of VS Code, designed around AI-assisted coding from the ground up rather than as an add-on. It offers deep codebase-aware chat, multi-file editing, and autocomplete that predicts entire edits, not just the next line.",
    howItWorks:
      "Cursor indexes your codebase so its AI features understand the broader project context, not just the open file. You can chat with it about your code, ask it to make multi-file changes, or let its Tab autocomplete predict and apply entire edits, with the model choice configurable between several leading LLMs.",
    freeTierInfo:
      "A free Hobby tier includes a limited number of premium AI requests per month with unlimited basic completions. Paid plans (Pro, Business) provide much higher usage limits, access to more advanced models, and team-management features.",
    useCases: [
      "AI-assisted refactoring across multiple files in a codebase",
      "Chatting with an AI that understands your entire project context",
      "Rapid prototyping new features with AI-generated scaffolding",
      "Debugging by asking the AI to trace an issue across files",
      "Migrating or upgrading code with AI-guided multi-file edits",
    ],
    pros: [
      "Built from the ground up for AI-native coding, not bolted onto an existing editor",
      "Understands and edits across multiple files at once",
      "Choice of underlying AI models for different tasks",
      "Familiar VS Code-based interface and extension compatibility",
    ],
    cons: [
      "Free tier's premium AI requests are limited per month",
      "Heavier professional use requires a paid plan",
      "Being a separate editor means switching from your existing setup",
    ],
    faqs: [
      {
        question: "Is Cursor free to use?",
        answer:
          "Yes, there's a free Hobby tier with limited premium AI requests per month and unlimited basic autocomplete.",
      },
      {
        question: "Is Cursor based on VS Code?",
        answer:
          "Yes, it's built as a fork of VS Code, so most extensions, themes, and keybindings carry over.",
      },
      {
        question: "Does Cursor understand my whole codebase, not just one file?",
        answer:
          "Yes, it indexes your project so chat and edits can reference and modify multiple related files at once.",
      },
    ],
  },

  elevenlabs: {
    overview:
      "ElevenLabs is an AI voice generation platform known for highly realistic text-to-speech and voice cloning. It's used for audiobooks, video narration, dubbing, and building voice AI agents, supporting dozens of languages with natural-sounding intonation.",
    howItWorks:
      "You type or paste text, choose a voice from the library (or clone a custom voice from a short audio sample), and the model generates natural-sounding speech complete with appropriate pacing and emotion. Its dubbing and speech-to-speech tools can also translate and re-voice existing audio or video into other languages.",
    freeTierInfo:
      "A free tier includes a limited number of characters converted to speech per month with access to the standard voice library. Paid plans increase the monthly character allowance and unlock voice cloning, higher-quality models, and commercial usage rights.",
    useCases: [
      "Narrating audiobooks and articles with natural-sounding voices",
      "Voiceovers for YouTube videos, ads, and explainer content",
      "Cloning a voice for consistent branded audio content",
      "Dubbing videos into other languages while preserving vocal characteristics",
      "Building voice interfaces and conversational AI agents",
    ],
    pros: [
      "Among the most natural-sounding AI voices available",
      "Voice cloning from short audio samples",
      "Supports many languages and accents",
      "Free tier is enough to test quality before committing",
    ],
    cons: [
      "Monthly character limits mean heavier usage requires a paid plan",
      "Commercial rights and higher-quality models are gated behind paid tiers",
      "Voice cloning raises consent/ethical considerations that require careful use",
    ],
    faqs: [
      {
        question: "Is ElevenLabs free?",
        answer:
          "Yes, there's a free tier with a limited monthly character allowance; paid plans raise the limit and add voice cloning and commercial rights.",
      },
      {
        question: "Can ElevenLabs clone my own voice?",
        answer:
          "Yes, you can create a custom voice clone from a short sample of audio, subject to consent and usage policy requirements.",
      },
      {
        question: "What languages does ElevenLabs support?",
        answer:
          "It supports dozens of languages and accents for both text-to-speech and its dubbing/translation tools.",
      },
    ],
  },

  "suno-ai": {
    overview:
      "Suno is an AI music generation tool that creates full songs — including vocals, lyrics, and instrumentation — from a short text description or your own lyrics. It's used by hobbyists and creators to produce complete tracks in seconds without any musical training.",
    howItWorks:
      "You describe the style, mood, or genre you want (or paste your own lyrics), and Suno's generative audio model composes a full song, including a melody, backing instrumentation, and AI-sung vocals matching the described style, in about a minute.",
    freeTierInfo:
      "A free plan allows a limited number of song generations per day for non-commercial use. Paid plans increase the number of generations, add commercial usage rights, and unlock higher-quality audio output and faster generation.",
    useCases: [
      "Creating background music and jingles for videos or podcasts",
      "Writing and producing full songs from your own lyrics",
      "Rapid prototyping of musical ideas before studio production",
      "Generating royalty-eligible music for content creators (on paid plans)",
      "Experimenting with genres and styles without musical training",
    ],
    pros: [
      "Generates complete songs with vocals and instrumentation in under a minute",
      "No musical training or instruments required",
      "Free tier available to experiment before subscribing",
      "Wide range of genres and styles supported",
    ],
    cons: [
      "Commercial usage rights require a paid subscription",
      "Free tier generations are capped per day",
      "AI vocals can occasionally sound slightly synthetic on close listening",
    ],
    faqs: [
      {
        question: "Is Suno AI free?",
        answer:
          "Yes, a free plan allows a limited number of song generations per day; paid plans add more generations and commercial rights.",
      },
      {
        question: "Can I use Suno-generated songs commercially?",
        answer:
          "Commercial usage rights typically require a paid subscription tier — check the current terms of service for specifics.",
      },
      {
        question: "Do I need to know music theory to use Suno?",
        answer:
          "No, you only need a text description of the style you want or your own lyrics; the AI handles composition and instrumentation.",
      },
    ],
  },

  "canva-ai": {
    overview:
      "Canva AI refers to the suite of AI-powered design tools built into Canva, the popular drag-and-drop design platform. Features like Magic Design, Magic Write, background remover, and text-to-image generation help users create social posts, presentations, and marketing materials faster.",
    howItWorks:
      "Within the Canva editor, you can describe what you want (a presentation, a social post, an image) and Magic Design will generate layout options automatically. Other AI tools like Magic Write draft copy, Magic Eraser removes unwanted objects from photos, and background remover isolates subjects with one click.",
    freeTierInfo:
      "Canva's free plan includes access to core design tools and a limited number of AI feature uses (like Magic Write credits) per month. Canva Pro unlocks unlimited use of most AI features, a larger asset library, and brand kit tools.",
    useCases: [
      "Generating social media posts, presentations, and flyers from a text prompt",
      "Writing captions, headlines, and marketing copy inside the design",
      "Removing backgrounds or unwanted objects from photos automatically",
      "Resizing a single design across many platforms/formats at once",
      "Building on-brand templates for a team using shared brand kits",
    ],
    pros: [
      "Combines full design tools with AI generation in one app",
      "Very approachable for non-designers",
      "Free plan already includes useful AI features",
      "Huge template and asset library",
    ],
    cons: [
      "Heaviest AI features (unlimited Magic Write, premium tools) need Canva Pro",
      "Less granular creative control than dedicated design software",
      "AI-generated images/layouts sometimes need manual polishing",
    ],
    faqs: [
      {
        question: "Is Canva AI free?",
        answer:
          "Yes, the free Canva plan includes limited monthly use of AI features; Canva Pro unlocks unlimited use of most of them.",
      },
      {
        question: "What can Canva's Magic Design do?",
        answer:
          "It generates full design layouts — presentations, social posts, documents — automatically from a text prompt or an uploaded photo.",
      },
      {
        question: "Do I need design experience to use Canva AI?",
        answer:
          "No, it's built for non-designers, with AI handling layout, copy, and image editing so you can produce polished designs quickly.",
      },
    ],
  },

  "figma-ai": {
    overview:
      "Figma AI is a set of AI features built into Figma, the collaborative interface design tool. It can generate first-draft UI layouts from a prompt, rename layers automatically, remove backgrounds from images, and translate or rewrite text within a design.",
    howItWorks:
      "Inside a Figma file, you can describe a screen or component you want and Figma AI will generate an editable first draft using real design components, rather than a flat image. Other tools like auto-rename and content-aware search speed up organizing and navigating large design files.",
    freeTierInfo:
      "Figma's free \"Starter\" plan includes limited access to AI features. Paid plans (Professional, Organization, Enterprise) expand AI usage and unlock additional AI-assisted design and prototyping tools.",
    useCases: [
      "Generating first-draft UI screens and components from a text prompt",
      "Auto-renaming and organizing messy layer structures",
      "Rewriting or translating text within an existing design",
      "Removing image backgrounds directly inside a design file",
      "Searching large design files by describing what you're looking for",
    ],
    pros: [
      "Generates editable design components, not just static images",
      "Speeds up early-stage UI prototyping significantly",
      "Integrated directly into an existing team's Figma workflow",
      "Useful for cleaning up and organizing large files",
    ],
    cons: [
      "Full AI feature access is limited on the free plan",
      "Generated layouts often need design refinement before shipping",
      "Requires an existing Figma workflow to get value from it",
    ],
    faqs: [
      {
        question: "Is Figma AI free?",
        answer:
          "The free Starter plan includes limited AI feature access; paid Figma plans expand usage and unlock more AI tools.",
      },
      {
        question: "Does Figma AI generate real, editable designs?",
        answer:
          "Yes, generated layouts use real Figma components and layers you can edit, rather than a flat, non-editable image.",
      },
      {
        question: "Can Figma AI help clean up messy design files?",
        answer:
          "Yes, features like auto-rename and content-aware search help organize and navigate large, messy files faster.",
      },
    ],
  },

  zapier: {
    overview:
      "Zapier is a no-code automation platform that connects thousands of apps (Gmail, Slack, Google Sheets, Salesforce, and more) so actions in one app automatically trigger actions in another. Its AI features add natural-language workflow building and AI steps within automations.",
    howItWorks:
      "You choose a trigger event in one app (like \"new email received\") and one or more actions in other apps (like \"add row to spreadsheet\" or \"send Slack message\"), and Zapier runs that workflow automatically whenever the trigger fires — no code required. AI-powered steps can also summarize, classify, or generate content mid-workflow.",
    freeTierInfo:
      "A free plan supports a limited number of single-step Zaps (automations) per month between two apps. Paid plans (Starter, Professional, Team, Enterprise) unlock multi-step Zaps, more monthly tasks, premium app integrations, and advanced logic like filters and paths.",
    useCases: [
      "Automatically saving email attachments or leads to a spreadsheet or CRM",
      "Sending Slack or email notifications when a form is submitted",
      "Syncing customer data between a CRM, email tool, and support system",
      "Using AI steps to summarize, tag, or route incoming requests",
      "Chaining multi-step workflows across dozens of business apps",
    ],
    pros: [
      "Connects thousands of apps without writing any code",
      "Free plan is enough for simple, single-step automations",
      "AI steps can add summarization or classification to workflows",
      "Widely adopted, so most SaaS tools already integrate with it",
    ],
    cons: [
      "Multi-step, complex workflows require a paid plan",
      "Monthly task limits can be consumed quickly at scale",
      "Some premium app integrations are locked to higher tiers",
    ],
    faqs: [
      {
        question: "Is Zapier free?",
        answer:
          "Yes, a free plan supports simple single-step automations between two apps with a monthly task limit.",
      },
      {
        question: "Do I need to know how to code to use Zapier?",
        answer:
          "No, it's a no-code platform — you configure triggers and actions through a visual interface without writing scripts.",
      },
      {
        question: "How many apps does Zapier integrate with?",
        answer:
          "Thousands of apps across categories like email, CRM, spreadsheets, messaging, and project management.",
      },
    ],
  },

  "character-ai": {
    overview:
      "Character.AI lets users chat with and create AI-powered characters that maintain a consistent personality, backstory, and speaking style across conversations. It's used for creative roleplay, practicing conversations, and building fan-made or original characters others can talk to.",
    howItWorks:
      "You either pick an existing character from a public library or create your own by defining a name, personality description, and example dialogue. The underlying language model then stays in character during conversation, adapting its responses to match the persona you've set up.",
    freeTierInfo:
      "The core chat experience is free with ads and standard response speed. The paid \"c.ai+\" subscription removes ads, prioritizes faster response times, and offers early access to new features.",
    useCases: [
      "Creative writing and roleplay with custom characters",
      "Practicing conversations in a low-stakes, judgment-free setting",
      "Building and sharing original or fan-made characters with a community",
      "Interactive storytelling and collaborative fiction",
      "Language practice through conversational chat",
    ],
    pros: [
      "Free to use for the core chat and character-creation experience",
      "Large community-built library of ready-made characters",
      "Characters maintain personality consistency across long conversations",
      "Easy character creation without any coding",
    ],
    cons: [
      "Free tier includes ads and slower response times at peak usage",
      "Content moderation limits some types of roleplay content",
      "Not designed for factual research or productivity tasks",
    ],
    faqs: [
      {
        question: "Is Character.AI free?",
        answer:
          "Yes, the core experience is free with ads; a paid c.ai+ subscription removes ads and speeds up responses.",
      },
      {
        question: "Can I create my own AI character?",
        answer:
          "Yes, anyone can create a custom character by defining its personality, backstory, and sample dialogue, no coding required.",
      },
      {
        question: "Is Character.AI good for factual research?",
        answer:
          "No, it's designed for creative roleplay and conversation rather than factual accuracy — use a search-grounded assistant for research.",
      },
    ],
  },

  heygen: {
    overview:
      "HeyGen is an AI video generation platform focused on realistic talking-head avatars, used for marketing videos, sales outreach, training content, and localizing videos into other languages while preserving the speaker's face and lip-sync.",
    howItWorks:
      "You write or paste a script, select an avatar (stock or a custom digital twin trained on your own footage), choose a voice and language, and HeyGen generates a video of the avatar speaking with matching lip movements. Its video translation feature can also re-dub existing videos into other languages while keeping the original speaker's face.",
    freeTierInfo:
      "A free tier allows a small number of short videos per month with limited avatars. Paid plans expand video length, avatar options, custom avatar creation, and add team collaboration features.",
    useCases: [
      "Personalized sales and marketing outreach videos at scale",
      "Corporate training and onboarding content",
      "Translating and dubbing existing videos into other languages",
      "Product explainer and demo videos without filming",
      "Creating a custom digital avatar of yourself for repeated content",
    ],
    pros: [
      "Realistic avatars with accurate lip-sync across languages",
      "Can create a custom avatar from your own video footage",
      "Speeds up producing video content without filming equipment",
      "Free tier available to test quality first",
    ],
    cons: [
      "Free tier limits video length and avatar selection",
      "Custom avatar creation and longer videos need a paid plan",
      "Avatars can still look slightly synthetic in certain lighting/motion",
    ],
    faqs: [
      {
        question: "Is HeyGen free?",
        answer:
          "Yes, a free tier offers a small number of short videos per month; paid plans unlock longer videos and custom avatars.",
      },
      {
        question: "Can HeyGen translate an existing video into another language?",
        answer:
          "Yes, its video translation feature dubs existing footage into other languages while preserving the original speaker's face and lip movement.",
      },
      {
        question: "Can I make an avatar of myself?",
        answer:
          "Yes, custom avatar creation lets you train a digital twin from your own video footage, available on paid plans.",
      },
    ],
  },

  n8n: {
    overview:
      "n8n is a workflow automation tool similar to Zapier but built to be self-hostable and highly extensible, popular with developers and technical teams. It connects apps and APIs through a visual node-based editor and supports custom code steps for complex logic.",
    howItWorks:
      "You build workflows visually by dragging and connecting \"nodes\" representing triggers, actions, and logic (like conditionals and loops) between different apps and APIs. Because it can be self-hosted, technical teams get full control over data and can write custom JavaScript/Python code nodes for logic that pre-built integrations don't cover.",
    freeTierInfo:
      "n8n is source-available and free to self-host with unlimited workflows if you run your own server. A paid cloud-hosted version is also available, priced by workflow execution volume, for teams that don't want to manage their own infrastructure.",
    useCases: [
      "Building complex, multi-step automations with custom logic and code",
      "Self-hosting workflow automation for full data control and privacy",
      "Connecting internal APIs and databases that aren't in typical no-code app libraries",
      "Automating AI agent pipelines that call multiple tools and APIs",
      "Replacing costly per-task pricing of other automation platforms at scale",
    ],
    pros: [
      "Free and unlimited when self-hosted",
      "Full custom code support for complex logic",
      "Visual editor is still accessible to non-developers for simpler workflows",
      "Strong fit for AI agent and multi-API automation pipelines",
    ],
    cons: [
      "Self-hosting requires some technical setup and maintenance",
      "Cloud-hosted plan pricing scales with execution volume",
      "Steeper learning curve than the simplest no-code tools",
    ],
    faqs: [
      {
        question: "Is n8n free?",
        answer:
          "Yes, self-hosting n8n is free with unlimited workflows; a paid cloud-hosted option is also available for teams that prefer managed hosting.",
      },
      {
        question: "Do I need to know how to code to use n8n?",
        answer:
          "No, basic workflows can be built visually without code, but custom code nodes are available for advanced logic when needed.",
      },
      {
        question: "How is n8n different from Zapier?",
        answer:
          "n8n can be self-hosted for free with full data control and custom code, while Zapier is a fully managed, simpler no-code platform.",
      },
    ],
  },

  "hugging-face": {
    overview:
      "Hugging Face is a platform and community hub for open-source machine learning models, datasets, and demo apps. Developers use it to discover, download, fine-tune, and deploy thousands of AI models — including text, image, and audio models — across nearly every ML framework.",
    howItWorks:
      "The Hugging Face Hub hosts pre-trained models and datasets that anyone can download, run, or fine-tune using open libraries like Transformers and Diffusers. Its Spaces feature lets developers deploy interactive demo apps, while paid Inference Endpoints let you run models in production without managing your own GPU servers.",
    freeTierInfo:
      "Browsing, downloading, and running most open models and datasets is completely free. Paid tiers (Pro, Enterprise) add private model hosting, more compute for Spaces, and managed inference infrastructure for production deployments.",
    useCases: [
      "Discovering and downloading open-source AI models for any task",
      "Fine-tuning existing models on your own data",
      "Deploying interactive ML demo apps via Spaces",
      "Hosting private models and datasets for a team or company",
      "Running production inference without managing your own servers (paid)",
    ],
    pros: [
      "Massive library of free, open-source models and datasets",
      "Strong community and documentation for nearly every ML task",
      "Free to browse, download, and self-host models",
      "Framework-agnostic — supports PyTorch, TensorFlow, and more",
    ],
    cons: [
      "Running large models yourself still requires adequate hardware",
      "Production-grade hosting and private repos require a paid plan",
      "Quality varies across community-uploaded models",
    ],
    faqs: [
      {
        question: "Is Hugging Face free?",
        answer:
          "Yes, browsing, downloading, and running most public models and datasets is free. Paid plans add private hosting and managed inference.",
      },
      {
        question: "Do I need to be an ML expert to use Hugging Face?",
        answer:
          "No, many models can be run with just a few lines of code using the Transformers library, though building custom models benefits from ML knowledge.",
      },
      {
        question: "Can I deploy my own model as a demo app?",
        answer:
          "Yes, Hugging Face Spaces lets you deploy interactive demo apps for your model that others can try directly in the browser.",
      },
    ],
  },

  "otter-ai": {
    overview:
      "Otter.ai is an AI meeting assistant that joins video calls to record, transcribe, and summarize conversations in real time. It generates searchable transcripts, automated summaries, and action items for Zoom, Google Meet, and Microsoft Teams meetings.",
    howItWorks:
      "Otter joins your calendar-scheduled meetings automatically (or can be added manually) and transcribes speech to text in real time, identifying different speakers. After the meeting, it generates an AI summary, key takeaways, and action items, and lets you search across all your past meeting transcripts.",
    freeTierInfo:
      "A free plan includes a limited number of transcription minutes per month with basic summary features. Paid plans (Pro, Business, Enterprise) increase monthly minutes, add more advanced AI summaries, and support larger teams with admin controls.",
    useCases: [
      "Automatically transcribing and summarizing video meetings",
      "Generating action items and follow-ups after calls",
      "Searching across past meeting transcripts by keyword",
      "Creating accessible written records of interviews or lectures",
      "Sharing meeting notes with team members who couldn't attend",
    ],
    pros: [
      "Joins meetings automatically and requires no manual note-taking",
      "Accurate real-time transcription with speaker identification",
      "Searchable archive of all past meeting transcripts",
      "Free tier is usable for light, occasional meeting needs",
    ],
    cons: [
      "Free tier's monthly transcription minutes are limited",
      "Accuracy can dip with heavy accents, crosstalk, or poor audio",
      "Full team features require a paid Business/Enterprise plan",
    ],
    faqs: [
      {
        question: "Is Otter.ai free?",
        answer:
          "Yes, a free plan includes a limited number of transcription minutes per month; paid plans raise the limit and add features.",
      },
      {
        question: "Which video call platforms does Otter.ai support?",
        answer:
          "It integrates with Zoom, Google Meet, and Microsoft Teams to join and transcribe meetings automatically.",
      },
      {
        question: "Can Otter.ai generate action items automatically?",
        answer:
          "Yes, its AI summary feature extracts key takeaways and action items from the meeting transcript automatically.",
      },
    ],
  },

  descript: {
    overview:
      "Descript is an AI-powered video and audio editor that lets you edit recordings by editing a text transcript, as if you were editing a document. It's widely used by podcasters and video creators for its overdub, filler-word removal, and screen recording features.",
    howItWorks:
      "Descript automatically transcribes your video or audio file into text; deleting or rearranging words in the transcript edits the underlying media to match. Its \"Overdub\" feature can generate a synthetic version of your own voice to fix mistakes without re-recording, and \"Studio Sound\" cleans up background noise automatically.",
    freeTierInfo:
      "A free plan includes a limited amount of transcription and editing time per month with watermarked exports on some plans. Paid plans (Creator, Pro, Enterprise) increase transcription hours, remove watermarks, and unlock Overdub, advanced AI editing, and team collaboration.",
    useCases: [
      "Editing podcasts and videos by editing text instead of a timeline",
      "Automatically removing filler words (\"um,\" \"uh\") from recordings",
      "Screen recording tutorials with automatic transcription",
      "Fixing small mistakes in narration using an AI voice clone (Overdub)",
      "Cleaning up background noise and improving audio quality automatically",
    ],
    pros: [
      "Text-based editing is far faster and more approachable than a timeline editor",
      "Automatic filler-word removal and noise cleanup save significant editing time",
      "Combines recording, transcription, and editing in one tool",
      "Free tier is enough to try the core workflow",
    ],
    cons: [
      "Free tier caps monthly transcription/export time",
      "Overdub and advanced AI features require a paid plan",
      "Less suited to highly complex, effects-heavy video editing than dedicated NLEs",
    ],
    faqs: [
      {
        question: "Is Descript free?",
        answer:
          "Yes, a free plan includes limited monthly transcription and editing time; paid plans raise limits and add features like Overdub.",
      },
      {
        question: "Can I really edit video by editing text?",
        answer:
          "Yes, Descript transcribes your recording and lets you cut, rearrange, or delete content by editing the transcript directly.",
      },
      {
        question: "What is Overdub?",
        answer:
          "Overdub is Descript's voice-cloning feature that can generate corrected narration in your own voice without needing to re-record.",
      },
    ],
  },
}

export function getToolContent(slug: string): ToolContentEntry | undefined {
  return toolContent[slug]
}
