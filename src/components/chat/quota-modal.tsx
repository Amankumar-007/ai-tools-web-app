"use client"

import Link from "next/link"
import Modal from "react-modal"
import { Gift, X, Zap } from "lucide-react"

import type { PlanId } from "@/lib/billing/plans"

export interface QuotaInfo {
  error: string
  plan: PlanId
  limit: number
  kind: "chat" | "tool"
  /** Unix ms when the daily limit resets. */
  resetAt: number
  upgradeUrl?: string
}

/**
 * Shown when the daily limit is used up. Offers the three honest ways forward:
 * upgrade, earn bonus credits by inviting friends, or wait for the reset.
 */
export function QuotaModal({ info, onClose }: { info: QuotaInfo | null; onClose: () => void }) {
  const reset = info ? new Date(info.resetAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""
  return (
    <Modal
      isOpen={Boolean(info)}
      onRequestClose={onClose}
      contentLabel="Daily limit reached"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 outline-none"
      overlayClassName="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[6px]"
    >
      {info && (
        <div className="relative w-full max-w-md rounded-[28px] border border-zinc-200 bg-[#fcfbfa] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.22)] dark:border-white/10 dark:bg-[#19191b]">
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-ink)]">
            <Zap className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Daily limit reached</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{info.error}</p>
          <p className="mt-2 text-xs text-zinc-500">Your limit resets at {reset} (midnight IST).</p>

          <div className="mt-6 space-y-2.5">
            {info.plan !== "premium" && (
              <Link href={info.upgradeUrl || "/pricing"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]">
                See plans and upgrade
              </Link>
            )}
            <Link href="/account#referral" className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-100 dark:hover:bg-white/5">
              <Gift className="h-4 w-4" /> Invite a friend, earn bonus credits
            </Link>
            <button type="button" onClick={onClose} className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
              I&apos;ll wait for the reset
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
