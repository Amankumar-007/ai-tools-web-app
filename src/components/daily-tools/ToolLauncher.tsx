'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// The dialog (and the tool list behind it) is only downloaded the first time someone opens it.
const LauncherDialog = dynamic(() => import('./LauncherDialog'), { ssr: false })

export const OPEN_LAUNCHER_EVENT = 'tomato:open-launcher'

/** Ctrl/Cmd + K (or "/" outside a text box) opens a quick "jump to any tool" box on every page. */
export default function ToolLauncher() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); return }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const t = e.target as HTMLElement | null
        const typing = t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))
        if (!typing) { e.preventDefault(); setOpen(true) }
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_LAUNCHER_EVENT, onOpen)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener(OPEN_LAUNCHER_EVENT, onOpen) }
  }, [])

  return open ? <LauncherDialog onClose={() => setOpen(false)} /> : null
}
