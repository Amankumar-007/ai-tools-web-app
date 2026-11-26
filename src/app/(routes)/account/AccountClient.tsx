'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Copy, CreditCard, Flame, Gift, Loader2, MessageSquare, Share2, Users, Wrench, Zap } from 'lucide-react'
import { toast } from 'sonner'

import MainNavbar from '@/components/MainNavbar'
import { NewsletterSignup } from '@/components/growth/newsletter-signup'
import { RESET_LABEL, STREAK_MILESTONES } from '@/lib/growth/config'
import { getSummary, referralLink, touchToday, whatsappShareUrl } from '@/lib/growth/client'
import type { GrowthSummary } from '@/lib/growth/types'
import { getCurrentUser, signOut, type User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase-browser'

const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function Card({ id, title, icon, children }: { id?: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{icon}{title}</h2>
      {children}
    </section>
  )
}

function Meter({ label, icon, used, limit, credits }: { label: string; icon: React.ReactNode; used: number; limit: number; credits: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((Math.min(used, limit) / limit) * 100)) : 100
  const left = Math.max(limit - used, 0)
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">{icon}{label}</span>
        <span className="text-zinc-500 dark:text-zinc-400">{left} of {limit} left{credits > 0 ? ` + ${credits} bonus` : ''}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" role="progressbar" aria-label={`${label} used today`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AccountClient() {
  const router = useRouter()
  const params = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [summary, setSummary] = useState<GrowthSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const awardedToast = useRef(false)

  const load = useCallback(async () => {
    const current = await getCurrentUser()
    if (!current) { router.replace(`/login?redirect=${encodeURIComponent('/account')}`); return }
    setUser(current)
    // Opening your account counts as an active day for your streak.
    const result = await touchToday()
    setSummary(result ?? (await getSummary()))
    if (result?.touch.awarded && !awardedToast.current) {
      awardedToast.current = true
      toast.success(`${result.touch.streak}-day streak! +${result.touch.awarded} bonus credits`)
    }
    setLoading(false)
  }, [router])

  useEffect(() => { void load() }, [load])

  // Returning from checkout: normally the plan is already active, but if the confirmation is still in flight
  // (or the browser closed early and the webhook is finishing it) refresh the session until the plan appears.
  useEffect(() => {
    const state = params.get('checkout')
    if (state !== 'success' && state !== 'pending') return
    let cancelled = false
    ;(async () => {
      if (state === 'pending') toast.info('Confirming your payment. Please do not pay again.')
      for (let i = 0; i < 12 && !cancelled; i++) {
        await supabase.auth.refreshSession().catch(() => {})
        const next = await getSummary()
        if (next) setSummary(next)
        if (next && next.plan !== 'free') { toast.success(`You're on ${next.planName}. Thank you!`); return }
        await new Promise((r) => setTimeout(r, 2500))
      }
      if (!cancelled) toast.info('Your payment is safe and your plan is still activating. It will appear here shortly; refresh in a minute.')
    })()
    return () => { cancelled = true }
  }, [params])

  const handleSignOut = async () => { await signOut(); router.push('/') }
  const handleProtectedLink = (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>, href: string) => { e.preventDefault(); router.push(href) }

  const link = summary?.referral ? referralLink(summary.referral.code) : ''
  async function copyLink() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch { toast.error('Could not copy. Select the link and copy it manually.') }
  }
  async function shareLink() {
    if (!summary?.referral) return
    const text = `Join me on TomatoAI and we both get ${summary.referral.refereeBonus} bonus credits.`
    if (navigator.share) { try { await navigator.share({ title: 'TomatoAI', text, url: link }); return } catch { /* cancelled */ } }
    await copyLink()
  }

  const nextMilestone = summary?.streak !== undefined
    ? Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b).find((m) => m > (summary.streak ?? 0))
    : undefined

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100">
      <MainNavbar user={user} onSignOut={handleSignOut} onProtectedLink={handleProtectedLink} />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28">
        <h1 className="text-3xl font-medium tracking-tight">Your account</h1>
        {user && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{(user as unknown as { email?: string }).email}</p>}

        {loading || !summary ? (
          <div className="mt-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>
        ) : (
          <div className="mt-8 space-y-5">
            <Card title="Plan" icon={<CreditCard className="h-4 w-4" />}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">{summary.planName}</p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{summary.limits.chat} messages and {summary.limits.tool} tool runs per day</p>
                  {summary.plan !== 'free' && summary.billing.endsAt && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Active until <strong>{dateFormat.format(new Date(summary.billing.endsAt * 1000))}</strong>. It does not renew by itself.</p>
                  )}
                </div>
                {summary.plan === 'free' ? (
                  <Link href="/pricing" className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 dark:bg-white dark:text-black">See paid plans</Link>
                ) : (
                  <Link href="/pricing" className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Renew or upgrade</Link>
                )}
              </div>
            </Card>

            {summary.enabled && summary.usage && (
              <Card title="Today's usage" icon={<Zap className="h-4 w-4" />}>
                <div className="space-y-5">
                  <Meter label="AI chat messages" icon={<MessageSquare className="h-4 w-4" />} used={summary.usage.chat} limit={summary.limits.chat} credits={summary.credits ?? 0} />
                  <Meter label="AI tool runs" icon={<Wrench className="h-4 w-4" />} used={summary.usage.tool} limit={summary.limits.tool} credits={summary.credits ?? 0} />
                </div>
                <p className="mt-4 text-xs text-zinc-500">
                  Resets at {RESET_LABEL}. You have <strong>{summary.credits ?? 0}</strong> bonus credits: they kick in after your daily allowance and never expire.
                </p>
              </Card>
            )}

            {summary.enabled && summary.streak !== undefined && (
              <Card title="Daily streak" icon={<Flame className="h-4 w-4" />}>
                <div className="flex items-end gap-6">
                  <div><p className="text-4xl font-semibold tabular-nums">{summary.streak}</p><p className="text-xs text-zinc-500">day{summary.streak === 1 ? '' : 's'} in a row</p></div>
                  <div><p className="text-xl font-medium tabular-nums text-zinc-500">{summary.longestStreak}</p><p className="text-xs text-zinc-500">best</p></div>
                </div>
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {nextMilestone
                    ? <>Come back daily: reach <strong>{nextMilestone} days</strong> for <strong>+{STREAK_MILESTONES[nextMilestone]} bonus credits</strong>.</>
                    : 'You have hit every streak milestone. Legend.'}
                </p>
              </Card>
            )}

            {summary.enabled && summary.referral && (
              <Card id="referral" title="Invite friends, earn credits" icon={<Gift className="h-4 w-4" />}>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  When a friend joins with your link and sends their first message, you <strong>both get {summary.referral.refereeBonus} bonus credits</strong>.
                  You can earn up to {summary.referral.monthlyCap} referral rewards a month.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Your invite link" className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950" />
                  <button type="button" onClick={copyLink} className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 dark:bg-white dark:text-black">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={whatsappShareUrl(link, summary.referral.refereeBonus)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">Share on WhatsApp</a>
                  <button type="button" onClick={shareLink} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Share2 className="h-4 w-4" />Share</button>
                </div>
                <div className="mt-5 flex items-center gap-6 text-sm">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4 text-zinc-400" /><strong>{summary.referral.completed}</strong> joined &amp; active</span>
                  <span className="text-zinc-500">{summary.referral.pending} waiting for their first message</span>
                </div>
              </Card>
            )}

            {!summary.enabled && (
              <p className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">Bonus credits, streaks and invites are being switched on. Your plan and daily limits above are already active.</p>
            )}

            <Card title="Stay in the loop" icon={<Zap className="h-4 w-4" />}>
              <NewsletterSignup source="account" blurb="New AI tools and tips, once in a while." />
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
