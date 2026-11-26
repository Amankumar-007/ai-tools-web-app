"use client"

import { useState } from "react"
import { Check, Loader2, Mail } from "lucide-react"

import { cn } from "@/lib/utils"

type State = "idle" | "sending" | "done" | "error"

/**
 * Email signup (newsletter / paid-plan waitlist). Posts to /api/growth/subscribe.
 * `website` is a honeypot: hidden from people, filled in by simple bots.
 */
export function NewsletterSignup({
  source,
  title,
  blurb,
  className,
  tone = "auto",
}: {
  source: string
  title?: string
  blurb?: string
  className?: string
  tone?: "auto" | "dark" | "footer"
}) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<State>("idle")
  const [message, setMessage] = useState("")

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === "sending") return
    setState("sending")
    try {
      const form = new FormData(event.currentTarget)
      const res = await fetch("/api/growth/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, website: String(form.get("website") ?? "") }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; already?: boolean; error?: string }
      if (res.ok && data.ok) {
        setState("done")
        setMessage(data.already ? "You're already on the list." : "You're in. Watch your inbox.")
        setEmail("")
      } else {
        setState("error")
        setMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch {
      setState("error")
      setMessage("Network error. Please try again.")
    }
  }

  const dark = tone === "dark"
  const footer = tone === "footer"
  return (
    <div className={cn("w-full", className)}>
      {title && <h3 className={cn("text-base font-semibold", footer ? "text-white dark:text-black" : dark ? "text-white" : "text-zinc-900 dark:text-zinc-100")}>{title}</h3>}
      {blurb && <p className={cn("mt-1 text-sm", footer ? "text-neutral-400 dark:text-neutral-600" : dark ? "text-white/60" : "text-zinc-600 dark:text-zinc-400")}>{blurb}</p>}

      {state === "done" ? (
        <p role="status" className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-500">
          <Check className="h-4 w-4" /> {message}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row" noValidate>
          <label className="sr-only" htmlFor={`email-${source}`}>Email address</label>
          <div className="relative flex-1">
            <Mail className={cn("pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", footer ? "text-neutral-500" : dark ? "text-white/40" : "text-zinc-400")} />
            <input
              id={`email-${source}`}
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={cn(
                "w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none transition-colors",
                footer
                  ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/40 dark:border-black/20 dark:bg-black/5 dark:text-black dark:placeholder:text-black/40 dark:focus:border-black/50"
                  : dark
                  ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/40"
                  : "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
              )}
            />
          </div>
          {/* Honeypot: off-screen and not focusable. */}
          <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <button
            type="submit"
            disabled={state === "sending"}
            className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60", footer ? "bg-white text-black dark:bg-black dark:text-white" : "bg-zinc-900 text-white dark:bg-white dark:text-black")}
          >
            {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />} Subscribe
          </button>
        </form>
      )}
      {state === "error" && <p role="alert" className="mt-2 text-sm text-red-500">{message}</p>}
      {state !== "done" && <p className={cn("mt-2 text-xs", footer ? "text-neutral-500" : dark ? "text-white/40" : "text-zinc-500")}>No spam. One-click unsubscribe.</p>}
    </div>
  )
}
