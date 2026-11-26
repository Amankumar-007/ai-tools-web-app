# Plans, limits, referrals and engagement

## What exists

| Feature | Where | Notes |
| --- | --- | --- |
| Free / Pro / Premium plans | `src/lib/billing/plans.ts` | The single source for prices, limits and the features listed on `/pricing`. |
| Daily limits | `withQuota()` in `src/lib/growth/meter.ts` | Wraps chat and every AI tool route. Resets at midnight IST. Failed requests are refunded. |
| Checkout, payment check, webhook | `src/app/api/billing/*`, `src/app/api/razorpay/webhook` | Razorpay prepaid plans (30 days / 1 year, no auto-renew). Every payment is recorded once in `growth_payments`; the plan on the user's account (`app_metadata`) is a cache of that ledger. |
| Bonus credits | `supabase-growth.sql` | 1 credit = 1 extra message or tool run; used after the daily allowance; never expire. |
| Daily streak | `/api/growth/touch` | +credits at 3, 7, 14, 30, 60, 100 days (edit `STREAK_MILESTONES` in `src/lib/growth/config.ts`). |
| Referrals | `/r/CODE`, `/api/growth/referral` | Both people get 20 credits **after the new user's first message** (not at sign-up), max 20 rewards per referrer per month. |
| Account page | `/account` | Plan and end date, renew/upgrade, usage, streak, invite link, newsletter. |
| Newsletter / waitlist | `/api/growth/subscribe`, footer, pricing page | Stored in `growth_subscribers`; one-click unsubscribe; export at `/api/admin/subscribers?format=csv`. |
| Admin stats | `/api/admin/growth` | Profiles, active today, referrals, credits outstanding, payments and revenue, whether storage/billing are wired up. |

## Change the plans

Edit `src/lib/billing/plans.ts` (prices, default limits) or set `PLAN_*` environment variables.
Do not promise anything on the pricing page that is not enforced: `planFeatures()` builds the list from the real numbers on purpose.

## Switch it on (production)

1. **Supabase**: set `SUPABASE_SERVICE_ROLE_KEY` on your server (never in a `NEXT_PUBLIC_` variable), then run `supabase-growth.sql` in the SQL editor. Also run `supabase-hardening.sql` if you have not.
2. **Razorpay** (start with `rzp_test_` keys from Dashboard -> Account & Settings -> API keys):
   - Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
   - Account & Settings -> Webhooks -> add `https://YOUR-DOMAIN/api/razorpay/webhook`, type a secret of your own, and tick
     `payment.authorized`, `payment.captured`, `order.paid`, `refund.processed`. Put that secret in `RAZORPAY_WEBHOOK_SECRET`
     (it is **not** the API key secret). The webhook is what activates a plan if someone pays and closes the tab.
   - Settings -> Payment capture: automatic capture is recommended. If it is manual, the app captures payments itself.
   - Locally, Razorpay cannot reach `localhost`; use a tunnel (e.g. ngrok) for the webhook, or rely on the in-browser confirmation.
3. `NEXT_PUBLIC_SITE_URL=https://YOUR-DOMAIN` for correct links in emails and sharing.
4. Currency defaults to INR (what Razorpay accounts support out of the box). `BILLING_CURRENCY=usd` only works once international payments are enabled on your account.
5. Recommended: `SUPABASE_JWT_SECRET` and Upstash Redis (see `.env.example`).

Until step 1 and 2 are complete, checkout stays **off** on purpose (we never take money we cannot fulfil) and `/pricing` shows a waitlist.
Without step 1 alone, daily limits still work (per instance), but credits, streaks, referrals and the newsletter switch themselves off.

## Local development

Nothing to set up: without Supabase keys, a JSON file under `.data/` stores credits, streaks, referrals and signups.

## Known limits

- A referral is remembered in the browser. If someone opens the email-confirmation link on a different device, the invite is not applied.
- Daily limits are per account; sharing one account shares its limits.
- Plan changes reach a user's session within about a minute (on the account page right after checkout it is immediate).
- Plans are prepaid and do not renew by themselves. Renewing while active stacks the new period after the current one.
  Upgrading (Pro -> Premium) starts the higher plan immediately and the unused Pro time is not carried over (the pricing page says so).
  Buying a lower plan than the one you have is refused.
- Refunds: refund a payment in the Razorpay dashboard. A **full** refund removes that purchase's access automatically (`refund.processed`);
  partial refunds do nothing. If someone had stacked several purchases, check their account manually.
- Razorpay does not issue GST invoices for you. If you need invoices, create them yourself from the `growth_payments` table.
- Test the whole payment loop with test keys (use Razorpay's test UPI id `success@razorpay`) before going live.
