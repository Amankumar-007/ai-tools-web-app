"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { chunkForSpeech, detectSpeechLang, speechPlainText } from "@/lib/voice/speech"

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  const exact = voices.filter((v) => v.lang.replace("_", "-").toLowerCase() === lang.toLowerCase())
  const sameLanguage = voices.filter((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()))
  const pool = exact.length ? exact : sameLanguage
  // Prefer the natural-sounding network voices browsers ship, then anything local.
  return pool.find((v) => /natural|google|neural/i.test(v.name)) ?? pool[0] ?? null
}

/**
 * Reads an answer aloud with the browser's own voices (nothing is sent anywhere). The language follows the writing
 * system of the text, markdown symbols and code are skipped, and long answers are spoken sentence by sentence so the
 * engine does not stall. One answer at a time: starting another stops the first.
 */
export function useReadAloud() {
  const [supported, setSupported] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const run = useRef(0)

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined")
    return () => { try { window.speechSynthesis?.cancel() } catch { /* nothing speaking */ } }
  }, [])

  const stop = useCallback(() => {
    run.current++
    try { window.speechSynthesis?.cancel() } catch { /* nothing speaking */ }
    setSpeakingId(null)
  }, [])

  const speak = useCallback((id: string, markdown: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return false
    const text = speechPlainText(markdown)
    if (!text) return false
    const synth = window.speechSynthesis
    const lang = detectSpeechLang(text)
    const chunks = chunkForSpeech(text)
    const mine = ++run.current
    try { synth.cancel() } catch { /* nothing speaking */ }
    setSpeakingId(id)

    const next = (i: number) => {
      if (run.current !== mine) return
      if (i >= chunks.length) { setSpeakingId(null); return }
      const utterance = new SpeechSynthesisUtterance(chunks[i])
      utterance.lang = lang
      const voice = pickVoice(synth.getVoices(), lang)
      if (voice) utterance.voice = voice
      utterance.rate = 1; utterance.pitch = 1
      utterance.onend = () => next(i + 1)
      utterance.onerror = (event) => { if (run.current === mine && event.error !== "interrupted" && event.error !== "canceled") setSpeakingId(null) }
      synth.speak(utterance)
    }
    // A cancel and a speak in the same tick is ignored by some engines.
    setTimeout(() => next(0), 60)
    return true
  }, [])

  const toggle = useCallback((id: string, markdown: string) => {
    if (speakingId === id) stop()
    else speak(id, markdown)
  }, [speakingId, speak, stop])

  return { supported, speakingId, speak, stop, toggle }
}
