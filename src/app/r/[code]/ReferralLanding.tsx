"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, FileText, Gift, Sparkles } from "lucide-react"

import { rememberReferral } from "@/lib/growth/client"

export default function ReferralLanding({ code, bonus }: { code: string; bonus: number }) {
  // Remember the invite so it survives sign-up, email confirmation and page changes.
  useEffect(() => { rememberReferral(code) }, [code])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#faf9f7] px-5 py-12 text-zinc-900 dark:bg-[#0b0b0d] dark:text-zinc-100">
      <div className="w-full max-w-md text-center">
        <Image src="/logo.png" alt="" width={56} height={56} className="mx-auto mb-6 h-14 w-14 object-contain" />
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">You&apos;ve been invited to TomatoAI</h1>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
          Chat with PDFs, documents and images. Use 400+ AI tools. Free to start.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left">
          <Gift className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-900 dark:text-emerald-200">
            Join with this invite and you both get <strong>{bonus} bonus credits</strong> after your first message.
          </p>
        </div>

        <ul className="mt-6 space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 shrink-0" /> Auto-picks the best AI model for each question</li>
          <li className="flex items-center gap-2"><FileText className="h-4 w-4 shrink-0" /> Ask questions about PDFs, Word files and images</li>
        </ul>

        <Link
          href={`/register?redirect=${encodeURIComponent("/tomato-ai")}`}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
        >
          Create your free account <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href={`/login?redirect=${encodeURIComponent("/tomato-ai")}`} className="mt-4 inline-block text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400">
          I already have an account
        </Link>
        <p className="mt-6 text-xs text-zinc-500">Invites are for new users: existing accounts can&apos;t redeem one.</p>
      </div>
    </main>
  )
}
