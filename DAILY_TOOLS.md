# Daily Tools (`/tools`)

37 everyday tools in three kinds:

- **On your device (no sign-in, unlimited)**: files and numbers are processed in the browser and never uploaded.
- **Online (no sign-in)**: needs the network, but still no account. The LinkedIn and X (Twitter) video downloaders.
- **AI tools (free account)**: each run counts as one "AI tool run" from the daily allowance.

| Kind | Tools |
| --- | --- |
| On-device, **new** | PDF Converter (PDF to Word, Excel, text, Markdown, HTML, images), PDF Toolkit (merge, split, delete, rotate, reorder, images to PDF), Favicon Generator (.ico, PNGs, manifest, HTML, ZIP), Image Converter & Compressor, QR Code Generator (UPI, WhatsApp, Wi-Fi, contact, link...), YouTube Thumbnail Downloader, GST Invoice Generator (PDF with UPI QR), Day Planner (time-blocks a to-do list, exports `.ics`) |
| Online, **new** | LinkedIn Video Downloader and X (Twitter) Video Downloader (public posts, MP4, straight from each platform's CDN) |
| Resume, **new** | Resume Builder (6 designs, live preview, PDF + Word), Resume Keyword Matcher (on-device), Cover Letter Writer and Resume Bullet Improver (AI) |
| AI, **new** | Content Calendar Planner, LinkedIn Post Writer, LinkedIn Profile Optimizer, Cover Letter Writer, Resume Bullet Improver |
| On-device (original) | EMI, SIP & investment, GST, percentage & discount, bill splitter, BMI & calorie, age & date, unit converter, password generator, text toolkit |
| AI (original) | Email writer, reply assistant, rewrite & grammar fixer, translator, letter writer, caption writer, meal, workout, trip and study planners |

The original 20 are kept below the new ones. To remove any tool, delete its entry in `registry.ts` / `registry-media.ts`
(and its `ToolBody.tsx` mapping, or its `AI_SPECS` / `TOOLS` entry); the hub, pages, sitemap and launcher follow the registry.

## What makes them different (all implemented, nothing aspirational)

- **Your files never leave your device** for PDF, image, favicon, QR and invoice tools (pdf.js, pdf-lib, canvas, JSZip in the browser).
- **PDF to Word/Excel rebuilds structure**: headings by font size, paragraphs by line gaps, bullets, real tables (as Word tables / Excel columns with real numbers), running headers/footers and page numbers removed. Scanned PDFs are detected and the user is told OCR is needed.
- **Favicon pack from any image**: `favicon.ico` with several sizes, PNGs (16 to 512), Apple touch icon, Android icons, `site.webmanifest`, the HTML to paste, and a ZIP.
- **Resume Builder**: one layout engine (`resume/render.ts`) draws six designs as a real text PDF with clickable links; the live preview is that same PDF drawn by pdf.js, so what you see is what downloads. Word export (`resume/docx.ts`) keeps every script. Saved only in the browser.
- **Resume Keyword Matcher**: compares a job post with a resume (weighted by repetition, light stemming, phrases). Plain word matching, labelled as such, never called an ATS score.
- **GST invoices**: integer-paise maths per line, CGST = SGST, IGST between states, GSTIN checksum, UPI scan-to-pay QR.
- **Day Planner**: fixed-time tasks first, the rest by priority, lunch and breaks, never silently drops a task, `.ics` export.
- **12 output languages for every AI tool**, including Hinglish (`src/lib/daily-tools/languages.ts`).
- **India-first**: rupees, lakh/crore grouping, GST, UPI, Indian BMI cut-offs, Indian letter formats.
- **Refine in one click** with version stepping; **"Send to..."** passes a result to another tool.
- **Private**: history, saved groups and launcher recents live only in the browser.
- **Ctrl/Cmd+K** (or `/`) opens a launcher to jump to any tool.
- Every tool has a brand-coloured logo tile (real LinkedIn / YouTube / PDF logos), shown on the hub, the featured row, the launcher and the tool page.

## Where things are

| What | Where |
| --- | --- |
| The list of tools, SEO copy, FAQs, colours, featured list | `src/lib/daily-tools/registry.ts` (original 20 + merge) and `registry-media.ts` (the 12 new) |
| Search/AI-answer layer (JSON-LD, key facts, FAQs, llms.txt text); guide in `SEO.md` | `src/lib/daily-tools/seo.ts`, `src/app/{sitemap,robots}.ts`, `src/app/llms.txt/`, `src/app/llms-full.txt/`, share cards in `src/app/og/tools/` |
| Client-safe categories vs server-only hub data (keeps long text out of the browser) | `src/lib/daily-tools/categories.ts`, `hub-data.ts` |
| Calculator maths (pure, unit-tested) | `src/lib/daily-tools/calc/*.ts` |
| PDF engine (layout detection, writers, merge/split) | `src/lib/daily-tools/pdf/{pipeline,layout,writers,tools}.ts` |
| Favicon, image resize, QR, YouTube, planner, invoice (+PDF) | `src/lib/daily-tools/{image/*,qr,youtube,planner,invoice,invoice-pdf}.ts` |
| LinkedIn URL + page parsing | `src/lib/daily-tools/linkedin.ts`; server lookup in `src/app/api/linkedin-video/route.ts` |
| X (Twitter) URL + post parsing | `src/lib/daily-tools/xvideo.ts`; server lookup in `src/app/api/x-video/route.ts`. Shared UI: `local/SocialVideoDownloader.tsx` |
| Resume model, PDF, Word, keywords | `src/lib/daily-tools/resume/{model,render,docx,keywords}.ts`; UI `local/ResumeBuilder.tsx`, `local/ResumeKeywordMatcher.tsx`; registry in `registry-career.ts` |
| AI tool forms / prompts (prompts never reach the browser) | `src/lib/daily-tools/ai/forms.ts`, `ai/prompts.ts` |
| AI API | `POST /api/daily-tools/run`, wrapped in `withQuota('tool')` |
| Provider fallback (Gemini, then OpenRouter) | `src/lib/ai/complete.ts` |
| UI | `src/components/daily-tools/` (`ToolsHub.tsx`, `ToolBody.tsx`, `icons.tsx`, `local/*.tsx`, `AiToolRunner.tsx`, `ToolLauncher.tsx`) |
| Pages | `src/app/(routes)/tools/page.tsx` and `tools/[slug]/page.tsx` |

## LinkedIn Video Downloader: how it works and its limits

The browser sends the post link to `/api/linkedin-video` (2 KB body, rate limited: 4/min, 25/day anonymous). The server only
accepts `linkedin.com` links (and `lnkd.in`, whose redirects it follows manually, validating every hop), fetches the public
post page with no cookies, and reads the video links LinkedIn puts in the page. It returns only `*.licdn.com` media URLs. The
browser then downloads the MP4 **directly from LinkedIn's CDN**; no video passes through this server.

- Works only for **public posts with a natively uploaded video**. Private, deleted, image-only and externally hosted videos are explained, not faked.
- It depends on LinkedIn's page markup and on LinkedIn answering the server. LinkedIn may change the markup or block datacentre IPs; then the tool shows a clear message. Re-test after any LinkedIn change and after deploying to a new host.
- Downloading is for the user's own content or content they have permission to save; the page says so.

## X (Twitter) Video Downloader: how it works and its limits

The server calls only X's fixed public embed endpoint (`cdn.syndication.twimg.com/tweet-result`, the one X's own embedded posts use). The pasted link supplies nothing but a numeric post id, so no other address can ever be requested. No login, no cookies. Only `video.twimg.com` / `pbs.twimg.com` addresses are returned and the browser downloads the MP4 straight from X (limits: 4/min and 25/day per anonymous IP).

- Works for **public posts with a video or GIF**. Private, protected, deleted and hidden posts, and videos that belong to a quoted or reposted post, are explained, not faked.
- It depends on X keeping that embed endpoint public. If X changes or restricts it, the tool shows a clear message: re-test after any X change.
- Quality labels are the real heights (for example 720p, 360p, 270p).

## Instagram and Facebook: deliberately NOT included

Instagram and Facebook return a login page, not the video, to a logged-out server. The only ways to get the file are logging in with an account, using spoofed browser tokens against private endpoints, or paying a third-party scraping service. All three break the platforms' terms or put someone's account at risk, so no downloader was built. For your own content, use the platform's own download / archive options.

## Security model of the AI route

The browser can only pick a tool, fill that tool's form and optionally choose one of nine fixed refine instructions.
Everything is re-validated on the server (unknown fields dropped, option values and lengths enforced, control characters refused),
and the prompt is built on the server, so the endpoint cannot be used as a general chatbot. User text is placed inside
`<input>` tags that it cannot close, and the instructions say tag contents are data. Sign-in is required, the daily quota is
metered per person (refunded on any failure), and requests are rate limited and count toward the site-wide AI budget.

## Provider keys and capacity (important)

AI tools use `GEMINI_API_KEY` first (`gemini-2.5-flash`), then `OPENROUTER_API_KEY`. Free tiers are small: Gemini's free
allowance is a few hundred requests a day and OpenRouter's free models are capped at 50 a day for the whole key. A short or
cut-off answer is rejected per tool (`minChars`) and the next provider is tried; if every provider fails the user gets a calm
"busy" message and **is not charged a run**. Before you promote the tools, put a billing-enabled Gemini key (or OpenRouter credits) behind them.

## Known limits (be honest on the site and in support)

- PDF to Word/Excel is built from text positions: complex layouts, columns and images need tidying. No OCR for scanned PDFs.
- The invoice PDF uses the built-in Helvetica font, so it prints `Rs.` and Latin letters only. No IRN / e-way bill, and GSTINs are checksum-checked, not looked up in the GST registry.
- Image Converter cannot read HEIC (browsers cannot); it says so.
- Animated GIFs become still images.
- Resume PDF designs use standard fonts: English and Western letters only (other characters show as "?" and the page warns); the Word download keeps every script. The two-column Sidebar design is read less reliably by some job-portal parsers.
- Resume Keyword Matcher is a word check, not a real ATS score.

## Add another tool

1. **On-device**: put the logic in `src/lib/daily-tools/yourtool.ts` (pure, unit-tested), build `components/daily-tools/local/YourTool.tsx`,
   map it in `ToolBody.tsx` (dynamic import), add an entry (icon, colour in `COLORS`) to `registry-media.ts` or `registry.ts` with `kind: 'local'`.
2. **AI**: add a form in `ai/forms.ts` (`AI_SPECS`), a prompt in `ai/prompts.ts` (`TOOLS`, with `minChars`), and a registry entry with `kind: 'ai'`.
   The runner, API, hub, sitemap and launcher pick it up automatically. Make sure every `required` field has an example.
3. If a tool fetches from a third-party host in the browser, add that host to `connect-src` in `next.config.ts`.

Keep claims on the page true: the registry copy is what visitors and search engines read.
