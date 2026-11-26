"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { classifySpeechError, joinSpeech, levelFromBytes, readResults, type SpeechErrorCode } from "@/lib/voice/speech"

/* eslint-disable @typescript-eslint/no-explicit-any */

export type VoiceStatus = "idle" | "starting" | "listening" | "finishing"

export interface VoiceFinish {
  /** Everything that was said (empty when nothing was heard). */
  text: string
  /** Why it ended early, if it did. The text said before that is still returned. */
  error: SpeechErrorCode | null
  /** True when the person pressed stop (or the time limit was reached), false when it ended by itself. */
  stopped: boolean
}

const MAX_SECONDS = 300
const MAX_RESTARTS = 20

function recognitionCtor(): any | null {
  if (typeof window === "undefined") return null
  const w = window as any
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

/** Safari's speech recognition does not share the microphone with a second capture, so there the waveform follows speech activity instead. */
function canMeterMicrophone(): boolean {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return false
  const ua = navigator.userAgent
  const safariOnly = /safari/i.test(ua) && !/chrome|chromium|crios|android|edg/i.test(ua)
  return !safariOnly
}

interface Session {
  rec: any
  stream: MediaStream | null
  ctx: AudioContext | null
  analyser: AnalyserNode | null
  buffer: Uint8Array<ArrayBuffer> | null
  committed: string
  sessionFinal: string
  sessionInterim: string
  userStopped: boolean
  switching: boolean
  fatal: SpeechErrorCode | null
  restarts: number
  noSpeech: number
  activity: number
  lang: string
  timer: ReturnType<typeof setInterval> | null
  guard: ReturnType<typeof setTimeout> | null
  done: boolean
}

/**
 * Voice typing with the browser's own speech recognition, plus a real microphone level for the waveform.
 * Nothing is recorded or uploaded by us: audio goes only to the browser's speech service (for Chrome and Edge that is
 * the vendor's cloud service, which is why the page says it needs the internet). It keeps listening through pauses
 * (browsers end a session after a few seconds of silence), switches language on the fly and always ends with
 * one callback saying what was heard.
 */
export function useVoiceInput(onFinish: (result: VoiceFinish) => void) {
  const [supported, setSupported] = useState(false)
  const [status, setStatus] = useState<VoiceStatus>("idle")
  const [live, setLive] = useState("")
  const [seconds, setSeconds] = useState(0)
  const session = useRef<Session | null>(null)
  const finishRef = useRef(onFinish)
  useEffect(() => { finishRef.current = onFinish }, [onFinish])
  useEffect(() => { setSupported(recognitionCtor() !== null) }, [])

  const teardown = useCallback((s: Session) => {
    if (s.timer) clearInterval(s.timer)
    if (s.guard) clearTimeout(s.guard)
    s.timer = null; s.guard = null
    s.stream?.getTracks().forEach((t) => t.stop())
    try { void s.ctx?.close() } catch { /* already closed */ }
    s.stream = null; s.ctx = null; s.analyser = null
  }, [])

  const finish = useCallback((s: Session, report: boolean) => {
    if (s.done) return
    s.done = true
    teardown(s)
    if (session.current === s) session.current = null
    setStatus("idle"); setSeconds(0)
    const text = joinSpeech(s.committed)
    setLive("")
    if (report) finishRef.current({ text, error: s.fatal, stopped: s.userStopped })
  }, [teardown])

  const makeRecognition = useCallback((s: Session) => {
    const Ctor = recognitionCtor()
    const rec = new Ctor()
    rec.lang = s.lang; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1
    rec.onstart = () => { if (!s.done) setStatus((cur) => (cur === "starting" ? "listening" : cur)) }
    rec.onresult = (event: any) => {
      const { final, interim } = readResults(event.results)
      s.sessionFinal = final; s.sessionInterim = interim; s.activity = 1; s.noSpeech = 0
      setLive(joinSpeech(s.committed, final, interim))
    }
    rec.onerror = (event: any) => {
      if (event?.error === "aborted") return
      const code = classifySpeechError(event?.error)
      if (code === "no-speech") { s.noSpeech++; return }
      s.fatal = code
    }
    rec.onend = () => {
      if (s.done) return
      // Fold this round into what was said, then decide whether to listen again.
      s.committed = joinSpeech(s.committed, s.sessionFinal, s.sessionInterim)
      s.sessionFinal = ""; s.sessionInterim = ""
      if (s.fatal || s.userStopped) { finish(s, true); return }
      if (s.switching) {
        s.switching = false
        try { s.rec = makeRecognition(s); s.rec.start() } catch { s.fatal = "unknown"; finish(s, true) }
        return
      }
      if (s.noSpeech >= 3 && !s.committed) { s.fatal = "no-speech"; finish(s, true); return }
      if (s.restarts >= MAX_RESTARTS) { finish(s, true); return }
      s.restarts++
      try { s.rec = makeRecognition(s); s.rec.start() } catch { s.fatal = "unknown"; finish(s, true) }
    }
    return rec
  }, [finish])

  const start = useCallback(async (lang: string): Promise<{ ok: true } | { ok: false; error: SpeechErrorCode }> => {
    if (session.current) return { ok: false, error: "busy" }
    if (!recognitionCtor()) return { ok: false, error: "unsupported" }
    setStatus("starting"); setLive(""); setSeconds(0)
    const s: Session = { rec: null, stream: null, ctx: null, analyser: null, buffer: null, committed: "", sessionFinal: "", sessionInterim: "", userStopped: false, switching: false, fatal: null, restarts: 0, noSpeech: 0, activity: 0, lang, timer: null, guard: null, done: false }
    session.current = s

    // Ask for the microphone first, so a refusal is reported clearly and the waveform has a real signal.
    if (canMeterMicrophone()) {
      try {
        s.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) {
          s.ctx = new AudioCtx()
          s.analyser = s.ctx!.createAnalyser(); s.analyser!.fftSize = 512
          s.ctx!.createMediaStreamSource(s.stream).connect(s.analyser!)
          s.buffer = new Uint8Array(new ArrayBuffer(s.analyser!.fftSize))
        }
      } catch (e) {
        const code = classifySpeechError((e as { name?: string })?.name)
        s.done = true; teardown(s); session.current = null
        setStatus("idle")
        return { ok: false, error: code === "unknown" ? "no-mic" : code }
      }
    }
    if (s.done || session.current !== s) { teardown(s); return { ok: false, error: "busy" } } // cancelled while the permission prompt was open

    try {
      s.rec = makeRecognition(s)
      s.rec.start()
    } catch {
      s.done = true; teardown(s); session.current = null; setStatus("idle")
      return { ok: false, error: "unknown" }
    }
    const began = Date.now()
    s.timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - began) / 1000)
      setSeconds(elapsed)
      if (elapsed >= MAX_SECONDS) stop()
    }, 500)
    return { ok: true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [makeRecognition, teardown])

  const stop = useCallback(() => {
    const s = session.current
    if (!s || s.done) return
    s.userStopped = true
    setStatus("finishing")
    try { s.rec?.stop() } catch { /* not started yet */ }
    // If the browser never reports the end, do not leave the bar stuck.
    s.guard = setTimeout(() => { s.committed = joinSpeech(s.committed, s.sessionFinal, s.sessionInterim); finish(s, true) }, 2500)
  }, [finish])

  const cancel = useCallback(() => {
    const s = session.current
    if (!s || s.done) return
    s.userStopped = true
    try { s.rec?.abort() } catch { /* already stopped */ }
    finish(s, false)
  }, [finish])

  /** Changes the spoken language without losing what was already said. */
  const setLang = useCallback((lang: string) => {
    const s = session.current
    if (!s || s.done || s.lang === lang) return
    s.lang = lang; s.switching = true
    try { s.rec?.abort() } catch { /* ignore */ }
  }, [])

  /** Current microphone loudness, 0..1. Read it on every animation tick; it does no state updates. */
  const getLevel = useCallback((): number => {
    const s = session.current
    if (!s) return 0
    if (s.analyser && s.buffer) { s.analyser.getByteTimeDomainData(s.buffer); return levelFromBytes(s.buffer) }
    s.activity *= 0.88
    return s.activity * (0.45 + Math.random() * 0.4)
  }, [])

  useEffect(() => () => { const s = session.current; if (s) { try { s.rec?.abort() } catch { /* gone */ } s.done = true; teardown(s); session.current = null } }, [teardown])

  return { supported, status, live, seconds, start, stop, cancel, setLang, getLevel }
}
