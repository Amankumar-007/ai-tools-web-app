'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MainNavbar from '@/components/MainNavbar'
import type { User } from '@/lib/supabase'

// Thin client wrapper so server-rendered pages (like the static tool detail
// pages) can render the navbar without passing functions across the
// server/client boundary.
export default function ToolPageNavbar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // The sign-in client is downloaded after the page is shown, not as part of the first load.
  useEffect(() => {
    let alive = true
    import('@/lib/supabase').then((m) => m.getCurrentUser()).then((u) => { if (alive) setUser(u) }).catch(() => {})
    return () => { alive = false }
  }, [])

  const handleSignOut = async () => {
    const { signOut } = await import('@/lib/supabase')
    await signOut()
    setUser(null)
    router.push('/')
  }

  const handleProtectedLink = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
    href: string
  ) => {
    e.preventDefault()
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(href)}`)
    } else {
      router.push(href)
    }
  }

  return <MainNavbar user={user} onSignOut={handleSignOut} onProtectedLink={handleProtectedLink} />
}
