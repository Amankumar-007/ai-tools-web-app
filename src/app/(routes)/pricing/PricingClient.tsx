'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import MainNavbar from '@/components/MainNavbar'
import { NewsletterSignup } from '@/components/growth/newsletter-signup'
import { startCheckout } from '@/lib/billing/checkout-client'
import { formatMoney, PLAN_RANK, type Currency, type Interval, type PaidPlanId, type PlanId } from '@/lib/billing/plans'
import { getSummary } from '@/lib/growth/client'
import { getCurrentUser, signOut, type User } from '@/lib/supabase'

export interface PlanCard {
  id: PlanId
  name: string
  tagline: string
  features: string[]
  prices?: { month: number; year: number }
}

const FAQ = [
  { q: 'What counts as an AI message?', a: 'Every question you send in TomatoAI Chat. Attachments are part of the message, not extra.' },
  { q: 'What is an AI tool run?', a: 'One run of an AI tool: resume analyzer, summarizer, prompt or roadmap generator, image tools, and the AI tools in Daily Tools. Calculators and other on-device tools are always free and unlimited.' },
  { q: 'When do my daily limits reset?', a: 'At midnight IST. Unused messages do not roll over.' },
  { q: 'What are bonus credits?', a: 'Extra messages or tool runs you earn by inviting friends and keeping a daily streak. They are used after your daily allowance and never expire.' },
  { q: 'Does it renew automatically?', a: 'No. Plans are prepaid for 30 days or a year and never charge you again by themselves, so there is nothing to cancel. Renew before it ends and the new period is added after the current one.' },
  { q: 'How do I pay?', a: 'Securely through Razorpay: UPI, cards, netbanking and wallets. We never see your card details.' },
  { q: 'What happens if I upgrade?', a: 'Pro to Premium starts Premium immediately. The unused days of Pro do not carry over, so upgrade near the end of a Pro period if you want to waste nothing.' },
  { q: 'Is there an API?', a: 'Not today. These plans are for using TomatoAI in the browser.' },
]

const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function PricingClient({ plans, currency, billingReady }: { plans: PlanCard[]; currency: Currency; billingReady: boolean }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [currentPlan, setCurrentPlan] = useState<PlanId | null>(null)
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [interval, setIntervalState] = useState<Interval>('year')
  const [busy, setBusy] = useState<PlanId | null>(null)

  async function refreshPlan() {
    const summary = await getSummary()
    setCurrentPlan(summary?.plan ?? null)
    setEndsAt(summary?.billing.endsAt ?? null)
  }

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u)
      if (u) await refreshPlan()
    })
  }, [])

  const handleSignOut = async () => { await signOut(); setUser(null); setCurrentPlan(null); setEndsAt(null); router.push('/') }
  const handleProtectedLink = (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>, href: string) => {
    e.preventDefault()
    router.push(user ? href : `/login?redirect=${encodeURIComponent(href)}`)
  }

  async function choose(plan: PaidPlanId) {
    if (!billingReady) {
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!user) { router.push(`/login?redirect=${encodeURIComponent('/pricing')}`); return }
    setBusy(plan)
    try {
      const result = await startCheckout(plan, interval, (user as unknown as { email?: string }).email)
      switch (result.status) {
        case 'paid':
          toast.success('Payment successful. Your plan is active.')
          router.push('/account?checkout=success')
          return
        case 'pending':
          toast.info(result.message, { duration: 12000 })
          router.push('/account?checkout=pending')
          return
        case 'signed-out':
          router.push(`/login?redirect=${encodeURIComponent('/pricing')}`)
          return
        case 'cancelled':
          return
        default:
          toast.error(result.message)
      }
    } finally {
      setBusy(null)
    }
  }

  const yearlySaving = (card: PlanCard) => (card.prices ? Math.round(100 - (card.prices.year / (12 * card.prices.month)) * 100) : 0)

  function paidButton(card: PlanCard, featured: boolean) {
    const mine = currentPlan && currentPlan !== 'free' ? currentPlan : null
    const lower = mine !== null && PLAN_RANK[card.id] < PLAN_RANK[mine]
    const same = mine === card.id
    const upgrade = mine !== null && PLAN_RANK[card.id] > PLAN_RANK[mine]
    const label = !billingReady ? 'Join the waitlist' : same ? `Renew ${card.name}` : upgrade ? `Upgrade to ${card.name}` : `Get ${card.name}`
    const style = `flex w-full items-center justify-between rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60 ${featured ? 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white' : 'bg-zinc-900 text-white dark:bg-white dark:text-black'}`
    if (lower) {
      return <button type="button" disabled className="flex w-full items-center justify-between rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium opacity-60 dark:border-zinc-700">Included in your {mine === 'premium' ? 'Premium' : 'Pro'} plan</button>
    }
    return (
      <div>
        <button type="button" disabled={busy !== null} onClick={() => choose(card.id as PaidPlanId)} className={style}>
          {label}
          {busy === card.id ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        </button>
        {same && endsAt && <p className="mt-2 text-center text-xs opacity-70">Active until {dateFormat.format(new Date(endsAt * 1000))}. Renewing adds time after that.</p>}
        {upgrade && <p className="mt-2 text-center text-xs opacity-70">Starts {card.name} now. Unused days of your current plan do not carry over.</p>}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 transition-colors duration-500 dark:bg-[#09090b] dark:text-zinc-100">
      <MainNavbar user={user} onSignOut={handleSignOut} onProtectedLink={handleProtectedLink} />

      <main className="z-10 flex-grow">
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-32 text-center">
          <h1 className="mb-5 text-4xl font-medium leading-tight tracking-tight md:text-6xl">Simple pricing. Start free.</h1>
          <p className="text-base font-light text-zinc-500 dark:text-zinc-400 md:text-lg">
            Chat with PDFs and images, run AI tools, and explore 400+ tools in the directory. Upgrade only when you need higher daily limits.
            Pay once for 30 days or a year: no auto-renew, no surprise charges.
          </p>

          <div role="group" aria-label="Billing period" className="mt-8 inline-flex rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
            {(['month', 'year'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={interval === value}
                onClick={() => setIntervalState(value)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${interval === value ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                {value === 'month' ? '30 days' : '1 year'}
                {value === 'year' && <span className="ml-2 text-xs opacity-70">save {Math.max(...plans.map(yearlySaving))}%</span>}
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-3">
          {plans.map((card) => {
            const featured = card.id === 'pro'
            const isCurrent = (currentPlan ?? 'free') === card.id
            const price = card.prices ? card.prices[interval] : 0
            return (
              <div
                key={card.id}
                className={`relative flex flex-col rounded-3xl border p-8 ${featured ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black' : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50'}`}
              >
                {featured && <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
                <h2 className="text-lg font-medium">{card.name}</h2>
                <p className={`mt-1 text-sm ${featured ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-500 dark:text-zinc-400'}`}>{card.tagline}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">{formatMoney(price, currency)}</span>
                  <span className={`text-sm ${featured ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-500'}`}>{card.prices ? (interval === 'month' ? '/ 30 days' : '/ year') : 'forever'}</span>
                </div>
                {card.prices && interval === 'year' && (
                  <p className={`mt-1 text-xs ${featured ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-500'}`}>
                    about {formatMoney(Math.round(card.prices.year / 12 / 100) * 100, currency)} / month, paid once a year
                  </p>
                )}

                <ul className="mb-8 mt-6 flex-grow space-y-3">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check size={16} className="mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {card.id === 'free' ? (
                  <button
                    type="button"
                    onClick={() => router.push('/tomato-ai')}
                    className="flex w-full items-center justify-between rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    {isCurrent ? 'Your current plan' : 'Start chatting free'} <ArrowRight size={16} />
                  </button>
                ) : (
                  paidButton(card, featured)
                )}
              </div>
            )
          })}
        </section>

        <p className="mx-auto max-w-2xl px-6 text-center text-xs text-zinc-500">
          Daily limits reset at midnight IST. Bonus credits never expire. Every plan uses the same automatic best-model routing; paid plans raise your limits, nothing else.
          Payments are processed by Razorpay.
        </p>

        {!billingReady && (
          <section id="waitlist" className="mx-auto mt-14 max-w-xl px-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
              <NewsletterSignup
                source="pricing-waitlist"
                title="Paid plans open soon"
                blurb="Join the waitlist and we will email you the moment Pro and Premium are available."
              />
            </div>
          </section>
        )}

        <section className="mx-auto mt-20 max-w-3xl px-6 pb-24">
          <h2 className="mb-6 text-center text-2xl font-medium tracking-tight">Questions</h2>
          <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50">
            {FAQ.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                  {item.q}
                  <span className="ml-4 text-zinc-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
