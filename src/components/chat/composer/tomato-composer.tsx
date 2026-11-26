"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MutableRefObject,
  type ReactNode,
} from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { motionFade, motionSpring } from "@/lib/motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Check, ChevronDown, ChevronUp, Volume2, VolumeX } from "lucide-react"
import { toast } from "sonner"

import { AttachMenu } from "@/components/chat/attach-menu"
import { AttachmentChips } from "@/components/chat/attachment-chips"
import type { PendingAttachment } from "@/components/chat/use-attachments"
import { useVoiceInput, type VoiceFinish } from "@/components/chat/use-voice-input"
import { ACCEPT } from "@/lib/ai-context/file-processing"
import { useVoicePrefs } from "@/lib/voice/prefs"
import { VOICE_LANGUAGES, formatClock, mergeIntoDraft, speechErrorMessage, voiceLanguage } from "@/lib/voice/speech"
import "./tomato-composer.css"

/**
 * Tomato Composer: the chat message bar.
 *
 * The look and motion are Pin UI's "Prompt Composer": five cards stand up behind the field, lean away from the one you
 * point at, and sink behind the field when you pick one, which then arrives inside it as a chip. The difference is that
 * everything here is real and connected to the chat: the cards open the image and document pickers, switch on web
 * search and Lightning mode, and start voice typing (speech to text with a live microphone waveform, Indian languages,
 * optional send-when-I-stop, optional read-answers-aloud). Files, paste, drag and drop, the model picker, send and stop all
 * go through the props, so the chat page keeps its own logic.
 */

export interface TomatoComposerProps {
  value: string
  onChange: (value: string) => void
  /** Enter or the send button. `search` is true while the web-search chip is on. */
  onSend: (text: string, options: { search: boolean }) => void
  onStop?: () => void
  /** A reply is being written: the send button becomes stop. */
  submitting?: boolean
  disabled?: boolean
  /** Attached files are still being read: typing is fine, sending waits. */
  busy?: boolean
  attachments: PendingAttachment[]
  onFilesSelected: (files: File[]) => void
  onRemoveAttachment: (id: string) => void
  /** The choices in the model list. */
  models: ComposerModel[]
  selectedModel: string
  onModelChange: (id: string) => void
  lightningActive: boolean
  onLightningToggle: () => void
  textareaRef?: MutableRefObject<HTMLTextAreaElement | null>
  /** Fan of quick actions open by default (the welcome screen). It can always be toggled. */
  quickActions?: boolean
  footnote?: ReactNode
}

export interface ComposerModel { id: string; name: string; note: string }

export type ActionId = "image" | "lightning" | "search" | "voice" | "docs"

interface Action { id: ActionId; label: string; tilt: number; rise: number; layer: number }

const ACTIONS: Action[] = [
  { id: "image", label: "Analyse image", tilt: -5, rise: 0, layer: 1 },
  { id: "lightning", label: "Lightning", tilt: 2.5, rise: 3, layer: 2 },
  { id: "search", label: "Search web", tilt: -2, rise: 6, layer: 4 },
  { id: "voice", label: "Voice typing", tilt: 3, rise: 3, layer: 3 },
  { id: "docs", label: "Analyse docs", tilt: -4.5, rise: 0, layer: 4 },
]

const fade = (delay = 0) => ({ ...motionFade, delay })
const blurIn = { opacity: 0, filter: "blur(6px)" }
const blurOut = { opacity: 1, filter: "blur(0px)" }

/* where each card stands along the field, as a share of its width */
const CENTRES = [14.2, 32.1, 50, 67.9, 85.8]

const DOC_ACCEPT = `${ACCEPT.pdf},${ACCEPT.document},${ACCEPT.data}`

export default function TomatoComposer(props: TomatoComposerProps) {
  const {
    value, onChange, onSend, onStop, submitting = false, disabled = false, busy = false, attachments, onFilesSelected, onRemoveAttachment,
    models, selectedModel, onModelChange, lightningActive, onLightningToggle, textareaRef: externalRef, quickActions = true, footnote,
  } = props
  const reduced = useReducedMotion()
  const group = useId()
  const inputId = useId()
  const innerRef = useRef<HTMLTextAreaElement | null>(null)
  const imageInput = useRef<HTMLInputElement>(null)
  const docInput = useRef<HTMLInputElement>(null)
  const valueRef = useRef(value)
  useEffect(() => { valueRef.current = value }, [value])

  const [searchOn, setSearchOn] = useState(false)
  const [trayOpen, setTrayOpen] = useState(quickActions)
  const [hovered, setHovered] = useState<ActionId | null>(null)
  const [spins, setSpins] = useState(0)
  const [round, setRound] = useState(0)
  const [dropping, setDropping] = useState(false)
  const [prefs, setPrefs] = useVoicePrefs()
  const [speakOk, setSpeakOk] = useState(false)

  useEffect(() => { setTrayOpen(quickActions) }, [quickActions])
  useEffect(() => { setSpeakOk(typeof window !== "undefined" && "speechSynthesis" in window) }, [])

  const setRefs = useCallback((node: HTMLTextAreaElement | null) => {
    innerRef.current = node
    if (externalRef) externalRef.current = node
  }, [externalRef])
  const focusField = () => innerRef.current?.focus({ preventScroll: true })

  // The field grows with the message up to about four lines; after that the bar keeps its size and the text scrolls inside
  // it. The layout never switches, so nothing jumps while you type or paste.
  const measure = useCallback(() => {
    const el = innerRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [])
  useEffect(() => { measure() }, [measure, value])
  useEffect(() => {
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [measure])

  const chips: Array<"search" | "lightning"> = [...(searchOn ? (["search"] as const) : []), ...(lightningActive ? (["lightning"] as const) : [])]

  // ── sending ────────────────────────────────────────────────────────

  const submit = useCallback((text: string) => {
    onSend(text.trim(), { search: searchOn })
    onChange("")
    setSearchOn(false)
    setHovered(null)
    setRound((n) => n + 1)
  }, [onSend, onChange, searchOn])

  // ── voice ──────────────────────────────────────────────────────────

  const refocus = useRef(false)
  const onVoiceFinish = useCallback(({ text, error, stopped }: VoiceFinish) => {
    if (error) toast.error(speechErrorMessage(error))
    if (!text) { if (stopped && !error) toast.info("I did not hear anything."); return }
    const merged = mergeIntoDraft(valueRef.current, text)
    onChange(merged)
    const hasWork = merged.trim().length > 0 || attachments.length > 0
    if (prefs.autoSend && stopped && !error && hasWork && !busy && !submitting && !disabled) submit(merged)
    else refocus.current = true
  }, [onChange, attachments.length, prefs.autoSend, busy, submitting, disabled, submit])

  const voice = useVoiceInput(onVoiceFinish)
  const recording = voice.status !== "idle"
  const cancelVoice = voice.cancel
  // The text field is not on screen while recording: focus it once it is back.
  useEffect(() => {
    if (recording || !refocus.current) return
    refocus.current = false
    const t = setTimeout(() => innerRef.current?.focus({ preventScroll: true }), 90)
    return () => clearTimeout(t)
  }, [recording])

  async function startVoice() {
    if (recording || disabled) return
    if (!voice.supported) { toast.error(speechErrorMessage("unsupported")); return }
    setHovered(null)
    const result = await voice.start(prefs.lang)
    if (!result.ok && result.error !== "busy") toast.error(speechErrorMessage(result.error))
  }

  // Escape cancels a recording from anywhere.
  useEffect(() => {
    if (!recording) return
    // Escape closes the voice settings menu first; only with no menu open does it cancel the recording. This listener runs in
    // the capture phase, before the menu's own, so the menu is still in the page when it looks.
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && !document.querySelector('[role="menu"]')) { event.preventDefault(); cancelVoice() } }
    document.addEventListener("keydown", onKey, true)
    return () => document.removeEventListener("keydown", onKey, true)
  }, [recording, cancelVoice])

  // ── the cards ──────────────────────────────────────────────────────

  const fanUp = trayOpen && chips.length === 0 && !recording && !submitting && !disabled && value.trim() === "" && attachments.length === 0
  const canSend = (value.trim().length > 0 || attachments.length > 0) && !busy && !disabled && !recording

  const pick = (id: ActionId) => {
    setHovered(null)
    if (id === "voice") { void startVoice(); return }
    if (id === "image") { imageInput.current?.click(); return }
    if (id === "docs") { docInput.current?.click(); return }
    if (id === "lightning") { onLightningToggle(); focusField(); return }
    setSearchOn(true)
    focusField()
  }

  const clearChips = () => {
    if (searchOn) setSearchOn(false)
    if (lightningActive) onLightningToggle()
    setTrayOpen(true)
    focusField()
  }

  const removeChip = (chip: "search" | "lightning") => {
    if (chip === "search") setSearchOn(false)
    else onLightningToggle()
    focusField()
  }

  const onFormSubmit = (event?: FormEvent) => {
    event?.preventDefault()
    if (submitting) return
    if (canSend) submit(value)
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); onFormSubmit(); return }
    if (event.key === "Escape" && chips.length > 0) { event.preventDefault(); clearChips(); return }
    if (event.key === "Backspace" && value === "" && chips.length > 0) removeChip(chips[chips.length - 1])
  }

  const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(event.clipboardData.files)
    if (files.length > 0) { event.preventDefault(); onFilesSelected(files) }
  }

  const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer.types).includes("Files")
  // The long invitation does not fit a narrow phone next to the buttons.
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const query = window.matchMedia("(max-width: 430px)")
    const update = () => setNarrow(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  const placeholder = searchOn ? "Search the web…" : attachments.length > 0 ? "Ask about your files…" : narrow ? "Ask anything…" : "Ask TomatoAI anything…"
  const langShort = voiceLanguage(prefs.lang).short

  return (
    <div className="pcmp">
      {/* the pickers behind the Analyse image and Analyse docs cards */}
      <input ref={imageInput} type="file" multiple accept={ACCEPT.image} tabIndex={-1} aria-hidden="true" className="pcmp__sr" onChange={(event) => { const files = Array.from(event.target.files ?? []); event.target.value = ""; if (files.length) onFilesSelected(files) }} />
      <input ref={docInput} type="file" multiple accept={DOC_ACCEPT} tabIndex={-1} aria-hidden="true" className="pcmp__sr" onChange={(event) => { const files = Array.from(event.target.files ?? []); event.target.value = ""; if (files.length) onFilesSelected(files) }} />

      <LayoutGroup id={`pcmp-${group}`}>
        <form className="pcmp__row" onSubmit={onFormSubmit}>
          <div className="pcmp__side">
            <ModelPill models={models} selected={selectedModel} onPick={onModelChange} disabled={disabled} />
          </div>

          <div className="pcmp__fieldWrap">
            <div className="pcmp__field" data-fan={fanUp ? "up" : "down"}>
              {/* the quick actions, fanned out behind the field */}
              <div className="pcmp__fan" key={round} onPointerLeave={() => setHovered(null)}>
                {ACTIONS.map((a, i) => {
                  const lifted = hovered === a.id
                  const h = hovered ? ACTIONS.findIndex((x) => x.id === hovered) : -1
                  const lean = h < 0 || h === i ? 0 : i < h ? -1 : 1
                  const near = h >= 0 && Math.abs(h - i) === 1
                  const sinking = (a.id === "search" && searchOn) || (a.id === "lightning" && lightningActive) || (a.id === "voice" && recording)
                  return (
                    <motion.button
                      key={a.id}
                      type="button"
                      className={`pcmp__card pcmp__card--${a.id}`}
                      style={{ left: `calc(${CENTRES[i]}% - var(--pcmp-card-w) / 2)`, zIndex: lifted ? 10 : a.layer }}
                      aria-label={a.label}
                      tabIndex={fanUp ? 0 : -1}
                      aria-hidden={!fanUp}
                      data-testid={`card-${a.id}`}
                      onPointerEnter={(e) => e.pointerType === "mouse" && fanUp && setHovered(a.id)}
                      onFocus={() => fanUp && setHovered(a.id)}
                      onBlur={() => setHovered(null)}
                      onClick={() => fanUp && pick(a.id)}
                      initial={reduced ? false : { y: "115%", rotate: 0, scale: 0.92 }}
                      animate={
                        fanUp
                          ? { y: -a.rise + (lifted ? -16 : near ? -3 : 0), x: lean * (near ? 10 : 4), rotate: lifted ? a.tilt * 0.3 : a.tilt + lean * (near ? 1.5 : 0.5), scale: lifted ? 1.05 : 1, opacity: 1 }
                          : { y: "115%", x: 0, rotate: 0, scale: 0.92, opacity: reduced ? 0 : 1 }
                      }
                      transition={{ ...motionSpring, delay: reduced ? 0 : fanUp ? (hovered ? 0 : 0.05 + i * 0.045) : sinking ? 0.06 : 0, opacity: fade() }}
                      whileTap={reduced || !fanUp ? undefined : { scale: 0.97, y: -10 - a.rise }}
                    >
                      <motion.span
                        className="pcmp__cardFace"
                        initial={false}
                        animate={{ "--pcmp-peel": a.id === "docs" && lifted && !reduced ? 1.2 : 1 } as Record<string, number>}
                        transition={motionSpring}
                      >
                        {(a.id === "lightning" || a.id === "search") && <span className="pcmp__band" />}
                        {a.id === "docs" && <span className="pcmp__peel" aria-hidden="true" />}
                        <span className="pcmp__label">{a.label}</span>
                        <span className="pcmp__artBox"><CardArt id={a.id} live={lifted} /></span>
                      </motion.span>
                    </motion.button>
                  )
                })}
              </div>

              {/* the field itself */}
              <div
                className="pcmp__bar"
                data-testid="composer-bar"
                data-recording={recording || undefined}
                data-drop={dropping || undefined}
                onDragOver={(event) => { if (hasFiles(event)) { event.preventDefault(); setDropping(true) } }}
                onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropping(false) }}
                onDrop={(event) => { if (!hasFiles(event)) return; event.preventDefault(); setDropping(false); onFilesSelected(Array.from(event.dataTransfer.files)) }}
              >
                {attachments.length > 0 && (
                  <div className="pcmp__attach"><AttachmentChips items={attachments} onRemove={onRemoveAttachment} /></div>
                )}
                <AnimatePresence mode="popLayout" initial={false}>
                  {recording ? (
                    <motion.div
                      key="recorder"
                      className="pcmp__recorder"
                      initial={reduced ? { opacity: 0 } : { ...blurIn, y: 6 }}
                      animate={{ ...blurOut, y: 0 }}
                      exit={reduced ? { opacity: 0 } : { ...blurIn, y: -6 }}
                      transition={{ ...motionSpring, opacity: fade(), filter: fade() }}
                    >
                      <Recorder
                        status={voice.status}
                        seconds={voice.seconds}
                        live={voice.live}
                        getLevel={voice.getLevel}
                        langCode={prefs.lang}
                        langShort={langShort}
                        autoSend={prefs.autoSend}
                        speakReplies={prefs.speakReplies}
                        speakOk={speakOk}
                        onLang={(code) => { setPrefs({ lang: code }); voice.setLang(code) }}
                        onAutoSend={(on) => setPrefs({ autoSend: on })}
                        onSpeakReplies={(on) => setPrefs({ speakReplies: on })}
                        onCancel={voice.cancel}
                        onStop={voice.stop}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="typer"
                      className="pcmp__typer"
                      initial={reduced ? { opacity: 0 } : { ...blurIn, y: 6 }}
                      animate={{ ...blurOut, y: 0 }}
                      exit={reduced ? { opacity: 0 } : { ...blurIn, y: -6 }}
                      transition={{ ...motionSpring, opacity: fade(), filter: fade() }}
                    >
                      <div className="pcmp__toolsL">
                        <AttachMenu
                          onFiles={onFilesSelected}
                          disabled={disabled}
                          iconClassName="h-[19px] w-[19px]"
                          className="pcmp__attachBtn h-[34px] w-[34px] rounded-[10px] text-[var(--pcmp-tool)] hover:bg-[var(--pcmp-tool-hover)] data-[state=open]:bg-[var(--pcmp-tool-hover)] dark:text-[var(--pcmp-tool)] dark:hover:bg-[var(--pcmp-tool-hover)] dark:data-[state=open]:bg-[var(--pcmp-tool-hover)]"
                        />
                      <AnimatePresence mode="popLayout" initial={false}>
                        {chips.map((chip) => (
                          <motion.button
                            key={chip}
                            type="button"
                            className={`pcmp__chip pcmp__chip--${chip}`}
                            data-testid={`chip-${chip}`}
                            onClick={() => removeChip(chip)}
                            aria-label={`${chip === "search" ? "Search web" : "Lightning mode"}: remove`}
                            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: -10, filter: "blur(6px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7, filter: "blur(6px)" }}
                            transition={{ ...motionSpring, delay: reduced ? 0 : 0.12, opacity: fade(reduced ? 0 : 0.12), filter: fade(reduced ? 0 : 0.12) }}
                            whileTap={reduced ? undefined : { scale: 0.94 }}
                          >
                            <ChipIcon id={chip} />
                            <span>{chip === "search" ? "Search web" : "Lightning"}</span>
                            <svg className="pcmp__chipX" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3.5 3.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                      </div>

                      <motion.div className="pcmp__inputWrap" layout="position" transition={motionSpring}>
                        <label htmlFor={inputId} className="pcmp__sr">Message TomatoAI</label>
                        <textarea
                          ref={setRefs}
                          id={inputId}
                          className="pcmp__input chat-scroll"
                          rows={1}
                          value={value}
                          onChange={(event) => onChange(event.target.value)}
                          onKeyDown={onKeyDown}
                          onPaste={onPaste}
                          disabled={disabled}
                          autoComplete="off"
                          enterKeyHint="send"
                        />
                        <AnimatePresence mode="popLayout" initial={false}>
                          {value === "" && (
                            <motion.span
                              key={placeholder}
                              className="pcmp__placeholder"
                              aria-hidden="true"
                              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 8, filter: "blur(4px)" }}
                              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -8, filter: "blur(4px)" }}
                              transition={{ ...motionSpring, opacity: fade(), filter: fade() }}
                            >
                              {placeholder}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <div className="pcmp__tools pcmp__toolsR">
                        <motion.button
                          type="button"
                          className="pcmp__tool"
                          aria-label={fanUp ? "Hide the quick actions" : "Show the quick actions"}
                          aria-expanded={fanUp}
                          data-testid="toggle-fan"
                          disabled={disabled || submitting}
                          onClick={() => { setSpins((n) => n + 1); if (chips.length > 0) clearChips(); else setTrayOpen((o) => !o) }}
                          whileTap={reduced ? undefined : { scale: 0.86 }}
                          transition={motionSpring}
                        >
                          <motion.span animate={{ rotate: spins * 180 }} transition={motionSpring} style={{ display: "grid", placeItems: "center" }}>
                            {fanUp ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
                          </motion.span>
                        </motion.button>

                        {speakOk && (
                          <motion.button
                            type="button"
                            className="pcmp__tool"
                            aria-label={prefs.speakReplies ? "Stop reading answers aloud" : "Read answers aloud"}
                            aria-pressed={prefs.speakReplies}
                            title={prefs.speakReplies ? "Answers are read aloud" : "Read answers aloud"}
                            data-testid="toggle-speak"
                            disabled={disabled}
                            onClick={() => setPrefs({ speakReplies: !prefs.speakReplies })}
                            whileTap={reduced ? undefined : { scale: 0.86 }}
                            transition={motionSpring}
                          >
                            {prefs.speakReplies ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
                          </motion.button>
                        )}

                        <motion.button
                          type="button"
                          className="pcmp__tool"
                          aria-label="Voice typing"
                          title="Voice typing"
                          data-testid="mic"
                          disabled={disabled}
                          onClick={() => void startVoice()}
                          whileTap={reduced ? undefined : { scale: 0.86 }}
                          transition={motionSpring}
                        >
                          <MicGlyph />
                        </motion.button>

                        {submitting ? (
                          <motion.button type="button" className="pcmp__send" aria-label="Stop generating" data-testid="stop" data-ready onClick={onStop} whileTap={reduced ? undefined : { scale: 0.88 }} transition={motionSpring}>
                            <span className="pcmp__stopSquare" style={{ width: 11, height: 11 }} />
                          </motion.button>
                        ) : (
                          <motion.button
                            type="submit"
                            className="pcmp__send"
                            aria-label={busy ? "Reading your files…" : "Send message"}
                            title={busy ? "Reading your files…" : undefined}
                            data-testid="send"
                            disabled={!canSend}
                            data-ready={canSend || undefined}
                            whileTap={reduced || !canSend ? undefined : { scale: 0.88 }}
                            transition={motionSpring}
                          >
                            <motion.svg viewBox="0 0 16 16" fill="none" aria-hidden="true" animate={canSend && !reduced ? { y: [0, -1.5, 0] } : { y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
                              <path d="M8 12.75V3.5M4 7.5l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </motion.svg>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </form>
      </LayoutGroup>
      {footnote && <p className="pcmp__hint">{footnote}</p>}
    </div>
  )
}

function MicGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="7" y="2.75" width="6" height="9.5" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.6 9.5a5.4 5.4 0 0 0 10.8 0M10 15v2.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

/* ------------------------------------------------------------- recorder -- */

const BARS = 44
const STEP_MS = 70

/*
 * The voice bar. The waveform is the real microphone level: every 70 ms the current level is pushed in at the right
 * and the bars scroll left like a voice memo. The bars are written straight to the DOM, so only the clock and the live
 * caption re-render.
 */
function Recorder({
  status, seconds, live, getLevel, langCode, langShort, autoSend, speakReplies, speakOk, onLang, onAutoSend, onSpeakReplies, onCancel, onStop,
}: {
  status: "starting" | "listening" | "finishing" | "idle"
  seconds: number
  live: string
  getLevel: () => number
  langCode: string
  langShort: string
  autoSend: boolean
  speakReplies: boolean
  speakOk: boolean
  onLang: (code: string) => void
  onAutoSend: (on: boolean) => void
  onSpeakReplies: (on: boolean) => void
  onCancel: () => void
  onStop: () => void
}) {
  const reduced = useReducedMotion()
  const barsRef = useRef<HTMLSpanElement[]>([])

  useEffect(() => {
    const levels = Array.from({ length: BARS }, () => 0.08)
    const paint = () => {
      barsRef.current.forEach((el, i) => { if (el) el.style.transform = `scaleY(${levels[i].toFixed(3)})` })
    }
    if (reduced) { paint(); return }
    const t = setInterval(() => {
      const level = getLevel()
      levels.shift()
      levels.push(Math.max(0.08, Math.min(1, 0.08 + level * 0.92)))
      paint()
    }, STEP_MS)
    paint()
    return () => clearInterval(t)
  }, [reduced, getLevel])

  const caption = live || (status === "starting" ? "Waiting for the microphone…" : status === "finishing" ? "Finishing…" : "Listening… start speaking")

  return (
    <>
      <div className="pcmp__recRow">
        <span className="pcmp__rec" aria-hidden="true">
          <motion.span className="pcmp__recDot" animate={reduced ? undefined : { opacity: [1, 0.35, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
          <span className="pcmp__recClock" data-testid="rec-clock">{formatClock(seconds)}</span>
        </span>
        <span className="pcmp__sr" role="status">{status === "starting" ? "Waiting for the microphone" : status === "finishing" ? "Finishing" : "Listening"}</span>
        <span className="pcmp__wave" aria-hidden="true" data-testid="rec-wave">
          {Array.from({ length: BARS }, (_, i) => (
            <span key={i} className="pcmp__waveBar" ref={(el) => { if (el) barsRef.current[i] = el }} />
          ))}
        </span>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="pcmp__lang" aria-label={`Voice settings. Speaking ${voiceLanguage(langCode).label}`} data-testid="voice-settings">
              {langShort}<ChevronDown className="h-3 w-3" aria-hidden="true" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="top" align="end" sideOffset={10} collisionPadding={12} className="z-[10000] max-h-[min(380px,65vh)] w-[min(280px,calc(100vw-24px))] overflow-y-auto rounded-2xl border border-zinc-200 bg-[#fcfbfa] p-1.5 text-zinc-800 shadow-[0_18px_60px_rgba(0,0,0,0.18)] outline-none dark:border-white/10 dark:bg-[#1b1b1d] dark:text-zinc-100">
              <DropdownMenu.Label className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[.14em] text-zinc-500 dark:text-zinc-400">Voice</DropdownMenu.Label>
              <DropdownMenu.CheckboxItem checked={autoSend} onCheckedChange={onAutoSend} onSelect={(e) => e.preventDefault()} data-testid="opt-autosend" className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-white/10">
                <span className="flex flex-col"><span>Send when I stop</span><span className="text-xs text-zinc-500 dark:text-zinc-400">Hands-free: no need to press send</span></span>
                <DropdownMenu.ItemIndicator><Check className="h-4 w-4" /></DropdownMenu.ItemIndicator>
              </DropdownMenu.CheckboxItem>
              {speakOk && (
                <DropdownMenu.CheckboxItem checked={speakReplies} onCheckedChange={onSpeakReplies} onSelect={(e) => e.preventDefault()} data-testid="opt-speak" className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-white/10">
                  <span className="flex flex-col"><span>Read answers aloud</span><span className="text-xs text-zinc-500 dark:text-zinc-400">Uses your device&apos;s voices</span></span>
                  <DropdownMenu.ItemIndicator><Check className="h-4 w-4" /></DropdownMenu.ItemIndicator>
                </DropdownMenu.CheckboxItem>
              )}
              <DropdownMenu.Separator className="my-1.5 h-px bg-zinc-200 dark:bg-white/10" />
              <DropdownMenu.Label className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[.14em] text-zinc-500 dark:text-zinc-400">I am speaking</DropdownMenu.Label>
              <DropdownMenu.RadioGroup value={langCode} onValueChange={onLang}>
                {VOICE_LANGUAGES.map((l) => (
                  <DropdownMenu.RadioItem key={l.code} value={l.code} data-testid={`lang-${l.code}`} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-white/10">
                    {l.label}
                    <DropdownMenu.ItemIndicator><Check className="h-4 w-4" /></DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="pcmp__tools">
          <motion.button type="button" className="pcmp__tool" aria-label="Cancel recording" data-testid="rec-cancel" onClick={onCancel} whileTap={reduced ? undefined : { scale: 0.86 }} transition={motionSpring}>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5.5 5.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </motion.button>
          <motion.button type="button" className="pcmp__stop" aria-label="Stop recording and use what I said" data-testid="rec-stop" disabled={status === "finishing"} onClick={onStop} whileTap={reduced ? undefined : { scale: 0.88 }} transition={motionSpring}>
            {!reduced && <motion.span className="pcmp__ring" initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 1.4, ease: "easeOut", repeat: Infinity }} />}
            <span className="pcmp__stopSquare" />
          </motion.button>
        </div>
      </div>
      <div className="pcmp__caption" data-empty={live ? undefined : true} data-testid="rec-caption" aria-live="polite">{caption}</div>
    </>
  )
}

/* ------------------------------------------------------------ model pill -- */

/*
 * The model pill and its list, as in Pin UI: one grey square shared through a layout id follows the pointer from row
 * to row, the check sits on the model in use, and the pill's name swaps through a blur. The list opens upward (the bar
 * lives at the bottom of the screen), closes on an outside press or Escape, and works from the keyboard (arrows, Home, End).
 * Choosing a row switches the chat's model: the page keeps its own fail-over and routing logic.
 */
function ModelPill({ models, selected, onPick, disabled }: { models: ComposerModel[]; selected: string; onPick: (id: string) => void; disabled?: boolean }) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const current = models.find((m) => m.id === selected)
  const label = current?.name ?? (models.length ? models[0].name : "Model")
  const selectedIndex = Math.max(0, models.findIndex((m) => m.id === selected))
  const turn = [...label].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 6

  const close = useCallback(() => { setOpen(false); setHover(null) }, [])

  useEffect(() => {
    if (!open) return
    const away = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) close() }
    const esc = (event: KeyboardEvent) => { if (event.key === "Escape") { event.stopPropagation(); close(); rootRef.current?.querySelector<HTMLButtonElement>(".pcmp__pill")?.focus() } }
    document.addEventListener("pointerdown", away)
    document.addEventListener("keydown", esc, true)
    // Put the focus on the model in use, so the arrow keys start there.
    requestAnimationFrame(() => rootRef.current?.querySelectorAll<HTMLButtonElement>(".pcmp__option")[selectedIndex]?.focus({ preventScroll: true }))
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc, true) }
  }, [open, close, selectedIndex])

  const onMenuKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const options = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>(".pcmp__option") ?? [])
    const at = options.findIndex((el) => el === document.activeElement)
    let next = -1
    if (event.key === "ArrowDown") next = (at + 1) % options.length
    else if (event.key === "ArrowUp") next = (at - 1 + options.length) % options.length
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = options.length - 1
    if (next >= 0) { event.preventDefault(); options[next]?.focus() }
  }

  return (
    <div className="pcmp__model" ref={rootRef}>
      <motion.button
        type="button"
        className="pcmp__pill"
        layout
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Choose AI model. Current: ${label}`}
        data-testid="model-pill"
        onClick={() => setOpen((o) => !o)}
        whileTap={reduced ? undefined : { scale: 0.95 }}
        transition={motionSpring}
      >
        <motion.svg className="pcmp__petals" layout="position" viewBox="0 0 16 16" aria-hidden="true" animate={{ rotate: turn * 60 }} transition={motionSpring}>
          {Array.from({ length: 6 }, (_, i) => <circle key={i} cx="8" cy="3.9" r="2.6" fill="currentColor" transform={`rotate(${i * 60} 8 8)`} />)}
          <circle cx="8" cy="8" r="2" fill="var(--pcmp-pill)" />
        </motion.svg>
        <span className="pcmp__pillName">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={label}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ ...motionSpring, opacity: fade(), filter: fade() }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.svg className="pcmp__caret" layout="position" viewBox="0 0 10 10" fill="none" aria-hidden="true" animate={{ rotate: open ? 180 : 0 }} transition={motionSpring}>
          <path d="m2.5 4 2.5 2.5L7.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            className="pcmp__menu chat-scroll"
            role="listbox"
            aria-label="Model"
            data-testid="model-menu"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 4, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 4, filter: "blur(6px)" }}
            transition={{ ...motionSpring, opacity: fade(), filter: fade() }}
            onPointerLeave={() => setHover(null)}
            onKeyDown={onMenuKey}
          >
            {models.map((m, i) => (
              <motion.button
                key={m.id}
                type="button"
                role="option"
                aria-selected={m.id === selected}
                className="pcmp__option"
                data-testid={`model-${m.id}`}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={() => { onPick(m.id); close() }}
                initial={reduced ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...motionSpring, opacity: fade(reduced ? 0 : 0.03 + Math.min(i, 8) * 0.025), y: { ...motionSpring, delay: reduced ? 0 : 0.03 + Math.min(i, 8) * 0.025 } }}
              >
                {hover === i && <motion.span layoutId="pcmp-option-hover" className="pcmp__optionHover" transition={motionSpring} />}
                <span className="pcmp__optionText">
                  <span className="pcmp__optionName">{m.name}</span>
                  <span className="pcmp__optionNote">{m.note}</span>
                </span>
                {m.id === selected && (
                  <motion.svg layoutId="pcmp-option-check" className="pcmp__check" viewBox="0 0 14 14" fill="none" aria-hidden="true" transition={motionSpring}>
                    <path d="m3 7.4 2.6 2.6L11 4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------- card art -- */

/* each card's drawing, in the faint grey the reference draws them in; hovered, it comes to life */
function CardArt({ id, live }: { id: ActionId; live: boolean }) {
  const reduced = useReducedMotion()
  const uid = useId().replace(/:/g, "")
  const go = live && !reduced
  const spin = { transformBox: "fill-box" as const, transformOrigin: "center" }

  if (id === "image") {
    return (
      <svg className="pcmp__art" viewBox="0 0 80 64" fill="none" aria-hidden="true">
        <motion.path d="M52 4c1.3 7.4 3.6 9.7 11 11-7.4 1.3-9.7 3.6-11 11-1.3-7.4-3.6-9.7-11-11 7.4-1.3 9.7-3.6 11-11Z" fill="var(--pcmp-art-deep)" style={spin} animate={go ? { rotate: 90, scale: 1.2 } : { rotate: 0, scale: 1 }} transition={motionSpring} />
        <motion.path d="M24 22 35 41H13Z" stroke="var(--pcmp-art)" strokeWidth="5" strokeLinejoin="round" style={spin} animate={go ? { rotate: -14, y: -2 } : { rotate: 0, y: 0 }} transition={motionSpring} />
        <rect x="12" y="48" width="18" height="18" rx="4.5" stroke="var(--pcmp-art)" strokeWidth="5" />
        <motion.circle cx="52" cy="54" r="9" stroke="var(--pcmp-art)" strokeWidth="5" animate={go ? { y: -3 } : { y: 0 }} transition={{ ...motionSpring, delay: go ? 0.04 : 0 }} />
      </svg>
    )
  }

  if (id === "lightning") {
    return (
      <svg className="pcmp__art" viewBox="0 0 80 64" fill="none" aria-hidden="true">
        <motion.path d="M46 0 22 34h17l-7 30 28-40H44Z" fill="var(--pcmp-art-deep)" style={spin} animate={go ? { rotate: -8, scale: 1.12, y: -2 } : { rotate: 0, scale: 1, y: 0 }} transition={motionSpring} />
        <motion.path d="M12 22h8M8 34h10M12 46h8" stroke="var(--pcmp-art)" strokeWidth="5" strokeLinecap="round" animate={go ? { x: -3 } : { x: 0 }} transition={motionSpring} />
      </svg>
    )
  }

  if (id === "search") {
    return (
      <svg className="pcmp__art" viewBox="0 0 80 64" fill="none" aria-hidden="true">
        <motion.circle cx="40" cy="38" r="24" stroke="var(--pcmp-art)" strokeWidth="5" animate={go ? { y: -2 } : { y: 0 }} transition={motionSpring} />
        <motion.ellipse cx="40" cy="38" rx="10" ry="24" stroke="var(--pcmp-art-deep)" strokeWidth="4" style={spin} animate={go ? { scaleX: [1, 0.3, 1] } : { scaleX: 1 }} transition={go ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : motionSpring} />
        <path d="M16 38h48" stroke="var(--pcmp-art-deep)" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  }

  if (id === "voice") {
    return (
      <svg className="pcmp__art" viewBox="0 0 80 64" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`pcmp-mic-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--pcmp-art)" />
            <stop offset="1" stopColor="var(--pcmp-art-deep)" />
          </linearGradient>
        </defs>
        <path d="M18 34c0 13 9.5 22 22 22s22-9 22-22" stroke="var(--pcmp-art)" strokeWidth="5" strokeLinecap="round" />
        <motion.rect x="28" y="2" width="24" height="44" rx="12" fill={`url(#pcmp-mic-${uid})`} animate={go ? { y: -2 } : { y: 0 }} transition={motionSpring} />
        <motion.g style={spin} animate={go ? { scale: [1, 1.14, 1] } : { scale: 1 }} transition={go ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : motionSpring}>
          <circle cx="40" cy="46" r="11" fill="var(--pcmp-rec)" />
          <circle cx="40" cy="46" r="4" fill="var(--pcmp-rec-dot)" />
        </motion.g>
      </svg>
    )
  }

  return (
    <svg className="pcmp__art" viewBox="0 0 80 64" fill="none" aria-hidden="true">
      <motion.g style={spin} animate={go ? { rotate: -4, y: -2 } : { rotate: 0, y: 0 }} transition={motionSpring}>
        <rect x="16" y="4" width="48" height="60" rx="8" fill="var(--pcmp-art)" />
        <motion.rect x="31" y="24" width="24" height="5.5" rx="2.75" fill="var(--pcmp-card)" style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }} animate={go ? { scaleX: 1.15 } : { scaleX: 1 }} transition={motionSpring} />
        <motion.rect x="31" y="36" width="24" height="5.5" rx="2.75" fill="var(--pcmp-card)" style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }} animate={go ? { scaleX: 0.7 } : { scaleX: 1 }} transition={motionSpring} />
      </motion.g>
    </svg>
  )
}

function ChipIcon({ id }: { id: "search" | "lightning" }) {
  return (
    <svg className="pcmp__chipIcon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {id === "search" ? (
        <>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2 8h12M8 2c2 1.8 3 3.8 3 6s-1 4.2-3 6c-2-1.8-3-3.8-3-6s1-4.2 3-6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </>
      ) : (
        <path d="M9 1.5 3.5 9H8l-1 5.5L12.5 7H8Z" fill="currentColor" />
      )}
    </svg>
  )
}
