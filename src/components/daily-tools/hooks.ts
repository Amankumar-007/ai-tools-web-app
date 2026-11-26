'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Form state that lives in the page's URL. Opening a link restores the exact numbers, so any calculation can be
 * shared on WhatsApp and reopens identically. Only known keys are read, each value is length-capped, and values
 * equal to the default are left out to keep links short. Nothing is sent to a server.
 */
export function useShareableState<T extends Record<string, string>>(defaults: T): { state: T; set: (patch: Partial<T>) => void; link: () => string; reset: () => void } {
  const defaultsRef = useRef(defaults)
  const [state, setState] = useState<T>(defaults)
  const hydrated = useRef(false)

  // Read the URL once after mount (not during render, so server and browser HTML always match).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const patch: Record<string, string> = {}
    for (const key of Object.keys(defaultsRef.current)) {
      const raw = params.get(key)
      if (raw !== null && raw.length <= 60 && !/[\u0000-\u001f<>]/.test(raw)) patch[key] = raw
    }
    if (Object.keys(patch).length) setState((s) => ({ ...s, ...patch }))
    hydrated.current = true
  }, [])

  // Keep the address bar in step with the form (debounced).
  useEffect(() => {
    if (!hydrated.current) return
    const t = setTimeout(() => {
      const params = new URLSearchParams()
      for (const [k, v] of Object.entries(state)) if (v !== defaultsRef.current[k]) params.set(k, v)
      const query = params.toString()
      const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
      if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.replaceState(window.history.state, '', next)
    }, 400)
    return () => clearTimeout(t)
  }, [state])

  const set = useCallback((patch: Partial<T>) => setState((s) => ({ ...s, ...patch })), [])
  const link = useCallback(() => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(state)) if (v !== defaultsRef.current[k]) params.set(k, v)
    const query = params.toString()
    return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`
  }, [state])
  const reset = useCallback(() => setState(defaultsRef.current), [])
  return { state, set, link, reset }
}

/** Remember a value in this browser only. Never throws (private mode, blocked storage). */
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void, boolean] {
  const [value, setValue] = useState<T>(initial)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) setValue(JSON.parse(raw) as T)
    } catch { /* ignore corrupt or blocked storage */ }
    setReady(true)
  }, [key])
  const save = useCallback((v: T) => {
    setValue(v)
    try { window.localStorage.setItem(key, JSON.stringify(v)) } catch { /* ignore */ }
  }, [key])
  return [value, save, ready]
}
