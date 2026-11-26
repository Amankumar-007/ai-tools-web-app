"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { forgetReferral, pendingReferral, rememberReferral } from "@/lib/growth/referral-store"

/**
 * Mounted once in the root layout. Does two quiet jobs:
 *  1. captures `?ref=CODE` from any landing URL, and
 *  2. once the visitor is signed in, redeems the remembered code (the reward itself is paid later,
 *     on their first real use of the product, so sign-ups alone earn nothing).
 *
 * Almost every visit has no invite code. Then there is nothing to redeem and the sign-in client (about 37 kB of
 * JavaScript) is not even downloaded; it is fetched only when a code is waiting.
 */
export function GrowthBootstrap() {
  const claiming = useRef(false)

  useEffect(() => {
    try { rememberReferral(new URLSearchParams(window.location.search).get("ref")) } catch { /* ignore */ }
    if (!pendingReferral()) return

    let cancelled = false
    let unsubscribe = () => {}

    void (async () => {
      const [{ supabase }, { claimReferral }] = await Promise.all([import("@/lib/supabase-browser"), import("@/lib/growth/client")])
      if (cancelled) return

      const tryClaim = async () => {
        const code = pendingReferral()
        if (!code || claiming.current) return
        claiming.current = true
        const result = await claimReferral(code)
        claiming.current = false
        if (result.ok) {
          toast.success(`Invite applied. You and your friend each get ${result.bonus ?? 20} bonus credits after your first message.`)
        }
        // Keep the code only if we could not reach the server; every definite answer settles it.
        if (result.reason !== "unavailable" && result.reason !== "rate_limited") forgetReferral()
      }

      supabase.auth.getSession().then(({ data }) => { if (data.session?.user) void tryClaim() }).catch(() => {})
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { if (session?.user) void tryClaim() })
      unsubscribe = () => subscription.unsubscribe()
    })()

    return () => { cancelled = true; unsubscribe() }
  }, [])

  return null
}
