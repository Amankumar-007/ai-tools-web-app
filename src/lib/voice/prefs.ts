'use client';

import { useSyncExternalStore } from 'react';
import { DEFAULT_VOICE_PREFS, parseVoicePrefs, type VoicePrefs } from './speech';

/**
 * Voice settings (language, send when I stop, read answers aloud) live in one small shared store, so the message bar and
 * the chat page always agree. Saved in this browser only; reads and writes never throw (private mode, blocked storage).
 */

const KEY = 'tomato_voice_prefs_v1';
let current: VoicePrefs = DEFAULT_VOICE_PREFS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try { current = parseVoicePrefs(localStorage.getItem(KEY)); } catch { current = { ...DEFAULT_VOICE_PREFS }; }
}

export function getVoicePrefs(): VoicePrefs { load(); return current; }

export function setVoicePrefs(patch: Partial<VoicePrefs>) {
  load();
  current = parseVoicePrefs({ ...current, ...patch });
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* storage unavailable: keep it for this visit */ }
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

/** Server render and first paint use the defaults, so there is never a hydration mismatch; the saved values arrive right after. */
export function useVoicePrefs(): [VoicePrefs, (patch: Partial<VoicePrefs>) => void] {
  const prefs = useSyncExternalStore(subscribe, getVoicePrefs, () => DEFAULT_VOICE_PREFS);
  return [prefs, setVoicePrefs];
}
