# SEO, AEO and GEO for the Daily Tools

What is built in, how to get the pages indexed, and how to keep it honest.

## What every tool page now carries

| Layer | What it does | Where |
| --- | --- | --- |
| **SEO** | Unique title and description per tool, canonical URL, `en-IN` and `x-default` language tags, a share card made for each tool (1200 x 630), clean heading order (one `h1`), the page sits in `sitemap.xml` with its real last-modified date and image | `tools/[slug]/page.tsx`, `tools/[slug]/opengraph-image.tsx`, `app/sitemap.ts` |
| **AEO** (answer engines: Google AI Overviews, Bing Copilot, voice assistants) | A one-line answer (the tagline) and a fuller answer in "At a glance" that are marked `speakable`; `FAQPage` and `HowTo` structured data that match the visible FAQ and steps exactly | `lib/daily-tools/seo.ts`, `ToolPageAbout.tsx` |
| **GEO** (generative engines: ChatGPT, Perplexity, Claude, Gemini) | A "key facts" list (price, sign-in, what happens to your data, languages, last updated) written to be quoted; one linked schema graph (`WebPage`, `WebApplication`, `HowTo`, `BreadcrumbList`, publisher, `areaServed: India`); `/llms.txt` and `/llms-full.txt`; AI crawlers explicitly allowed in `robots.txt` | `lib/daily-tools/seo.ts`, `app/llms.txt`, `app/llms-full.txt`, `app/robots.ts` |
| **Hub** (`/tools`) | `CollectionPage` + `ItemList` + `FAQPage` schema, visible FAQ, its own share card | `tools/page.tsx` |

Nothing is invented: there are no star ratings or review counts (we have none), and the only price is free.

## Getting the pages indexed (what only you can do)

Search engines decide when to index; these steps tell them the pages exist.

1. **Google**: open Google Search Console, add `https://www.tomatoai.in`, then *Sitemaps* and submit `sitemap.xml`. Then *URL inspection* on `/tools` and a few tool pages and press *Request indexing*. (The Indexing API is only for job posts and live-stream pages, so it is not used.)
   Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the token Google gives you if you verify by meta tag.
2. **Bing, Yandex, Naver, Seznam, Yep (IndexNow)**: deploy the site, then run
   `npm run seo:indexnow -- --dry` to preview, and `npm run seo:indexnow` to submit every URL in the live sitemap.
   The key file is `public/57b2f6694409ea663504a6d8b1105e48.txt` and must be reachable at `/57b2f6694409ea663504a6d8b1105e48.txt` on the live site (the script checks this first). Bing Webmaster Tools can import your Google Search Console site.
   Re-run it after you add or change tools.
3. **AI assistants** need no submission. `/llms.txt` and `/robots.txt` are what they read; allow a few weeks for them to pick pages up.

## When you change a tool

- Edit its entry in `src/lib/daily-tools/registry*.ts`. The page, the schema, the sitemap and `llms.txt` all read from it.
- If behaviour or copy really changed, bump `TOOLS_UPDATED` in `src/lib/daily-tools/seo.ts`. It appears on each page ("Last updated") and as the sitemap date. Do not bump it without a real change.
- Keep descriptions 80 to 200 characters and each FAQ answer a plain, complete sentence: that is what answer engines quote.
- A new tool needs nothing else: its page, share card, sitemap entry and `llms.txt` line appear automatically.

## Checking it

- Rich results: paste a tool URL into <https://search.google.com/test/rich-results>.
- Structured data: <https://validator.schema.org/>.
- Share cards: open `/og/tools/<slug>` (one tool) or `/og/tools` (the hub) in a browser.
- After a deploy: `curl -s https://www.tomatoai.in/robots.txt` must **not** disallow `/_next/` (Google needs the CSS and JavaScript there).

## Performance notes (what was changed and why)

- The registry's long text (intro, steps, FAQs for every tool) is server-only now (`categories.ts` + `hub-data.ts`); the browser gets slim props. About 24 kB of JavaScript less on every tool page.
- The sign-in client (Supabase) is downloaded only when an invite code is waiting or after the tool-page navbar has painted, not in the first load.
- Google Analytics loads when the browser is idle.
- Huge images were replaced: the chat page artwork (4.7 MB of CSS backgrounds, one hidden) is now two optimised WebP files via `next/image`; backgrounds and the default share image are tiny. Run `node scripts/optimize-images.cjs` to regenerate them from the originals.
- The main navbar's animation engine (framer-motion `domMax`) loads after the page is shown (`LazyMotion` + `src/lib/motion-features.ts`), about 28 kB less in the first download of every page that has the navbar.
- Unhashed files in `/public` (images, icons, fonts) are cached for a week with stale-while-revalidate (`next.config.ts`).
- `robots.txt` no longer blocks `/_next/static/`.
- Measured on a phone profile (4x CPU, slow 4G, no cache, median of 3), before -> after: `/tools` JS 374 -> 344 kB and blocking time 1152 -> 588 ms; a tool page 594 -> 570 kB JS and blocking 1862 -> 1253 ms; `/tomato-ai` images 492 -> 14 kB, LCP 6.4 -> 4.7 s; home images 1361 -> 865 kB. Timings are noisy on a small machine (first paint on `/tools` varied between runs), so trust the byte counts more than single timings.
- Building on a low-RAM machine can run out of memory (exit 134). Set `NODE_OPTIONS=--max-old-space-size=3072`, and do not use `ANALYZE=true` there (it is memory-heavy).
- Unused big files still sit in `/public` (for example `a.jpg`, `side.png`, `n8n.png`). They are not downloaded by visitors, but they bloat the repository and deployments; consider removing them.
- November 2026 second pass: home page logo 1.4 MB -> 13 kB and dark background 1.5 MB -> 6 kB; the favicon in `src/app` was a 1.4 MB PNG (now the 15 kB icon, duplicate removed); marquee and FAQ accordion are CSS; headline no longer waits for an animation; navbar/footer links do not prefetch every page; templates list 4.5 MB -> 106 kB. Measure with a production build (`next build && next start`): Lighthouse on the dev server reports unminified code and dev tools.
