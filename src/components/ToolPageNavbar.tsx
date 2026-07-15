'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MainNavbar from '@/components/MainNavbar'
import { getCurrentUser, signOut, User } from '@/lib/supabase'

// Thin client wrapper so server-rendered pages (like the static tool detail
// pages) can render the navbar without passing functions across the
// server/client boundary.
export default function ToolPageNavbar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  const handleSignOut = async () => {
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
