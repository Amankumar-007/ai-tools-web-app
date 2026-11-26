# Security

## What protects the API

Every `/api/*` request goes through `src/middleware.ts`, in this order:

1. **Path normalisation.** Encoded paths (`/api/%61dmin`) cannot dodge a rule.
2. **Per-IP flood limit.** IPv6 addresses are limited per /64. Forwarding headers are believed only on Vercel or when `TRUST_PROXY_HEADERS=1` is set for a proxy you control (otherwise a client could rotate fake IPs), and never the client-controlled left side of `X-Forwarded-For`.
3. **Same-origin check** on every POST/PUT/PATCH/DELETE: the request must carry a trusted `Origin` (or a same-origin `Sec-Fetch-Site`). Other websites and bare scripts are refused.
4. **Size limits** per route, on the declared length and again on the bytes actually read.
5. **Admin gate** for `/api/admin/*` and `/admin/*` pages: a valid, signed, short-lived admin session or nothing.
6. **Sign-in check** for routes that need an account. Tokens are verified once and cached for 60 s (invalid ones for 15 s), and never stored in clear.
7. **Rate limits** per route type (`src/lib/security/policies.ts`), per user when signed in and per IP otherwise, plus a **site-wide daily AI budget** (`AI_GLOBAL_DAILY_CAP`).

Identity headers `x-tomato-uid` / `x-tomato-ip` are always overwritten by the middleware, so handlers can trust them.

## Admin area

- No credentials in the code. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_JWT_SECRET` (make them with `node scripts/admin-setup.cjs`).
- Passwords are checked with scrypt in constant time; unknown accounts cost the same time as wrong passwords.
- Login is limited to 5 attempts / 15 min per IP and 8 attempts / hour per account.
- The session is an `HttpOnly`, `SameSite=Strict` cookie (`__Host-` prefixed in production) valid for 8 hours. The token is never given to page JavaScript.
- If the secrets are missing, admin sign-in is disabled; there is no fallback.

## Second pass (November 2026)

- **Open redirect closed.** `?redirect=` on sign-in and sign-up goes through `src/lib/security/redirect.ts` (same-site paths only, including the `/..//host` trick).
- **Password reset.** The emailed link returns to this site (it pointed at an old Vercel address), no account is created for unknown emails, and the answer does not reveal whether an account exists.
- **No AI calls from the browser.** Content Generator, Optimize with AI and Outlier use `/api/text-tools` (sign-in, quota, rate limit).
- **Third-party icons are hosted here** (they were loaded from unpkg at `@latest`, which can change under you).
- **Dependencies:** unused packages removed, React patched, PostCSS pinned up through `overrides`; `npm audit --omit=dev` reports 0.
- `/api/track` and `/api/n8n-templates` are public (anonymous page-view ping with only the path; read-only list of files already public). Both stay rate limited.

**Still yours to check:** `public/All issues - Tomatoai.pdf` and the screenshots in `public/` are downloadable by anyone once deployed; delete or move them if they are internal. Lighthouse reports saved into `public/` are now git-ignored.

## Production checklist

- [ ] Set every variable in `.env.example` in your hosting provider. Rotate any key that was ever committed or pasted into a chat.
- [ ] **Upstash Redis** (`UPSTASH_REDIS_REST_URL` / `_TOKEN`): without it, rate limits are per serverless instance. With it they hold everywhere.
- [ ] `SUPABASE_JWT_SECRET`: faster, network-free token checks.
- [ ] Run `supabase-hardening.sql` after setting `SUPABASE_SERVICE_ROLE_KEY` (stops any signed-in user from editing the tools table from the browser).
- [ ] `CRON_SECRET`: `/api/cron/*` refuses everything without it.
- [ ] Cloudinary: restrict the `ml_default` unsigned upload preset (allowed formats, max size, folder) in the Cloudinary console; its name is visible to browsers.
- [ ] `npm audit` regularly; keep `next` on the latest 15.5.x patch.

## What is intentionally not done

- **Nonce-based CSP.** It would make every page render dynamically and lose static/ISR speed. Instead `unsafe-eval` is removed in production, `object-src`, `base-uri` and `form-action` are locked, `connect-src` only lists hosts the browser really uses, and the places that render model output as HTML escape it first.
- **Hiding client JavaScript.** Browsers must receive it. Source maps are disabled, `console.log` is stripped from production builds, and all secrets, AI keys and business logic stay on the server.
