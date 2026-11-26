'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'

import { crackTime, estimateStrength, generatePassphrase, generatePassword, generatePin, passphraseBits, passwordBits, PASSWORD_LIMITS, validatePassword, WORDLIST, type PassphraseOptions, type PasswordOptions } from '@/lib/daily-tools/calc/password'
import { Card, CopyButton, ErrorNote, inputClass, Note, Segmented, SelectField, Stat } from '../ui'

type Tab = 'password' | 'passphrase' | 'pin' | 'check'
const BAR = ['bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-lime-500', 'bg-emerald-500']

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 accent-orange-500" />
      {label}
    </label>
  )
}

function StrengthBar({ score, label, detail }: { score: number; label: string; detail?: string }) {
  return (
    <div>
      <div className="flex gap-1" role="img" aria-label={`Strength: ${label}`}>{[0, 1, 2, 3, 4].map((i) => <div key={i} className={`h-2 flex-1 rounded-full ${i <= score ? BAR[score] : 'bg-zinc-200 dark:bg-zinc-800'}`} />)}</div>
      <p className="mt-1.5 text-sm font-medium">{label}{detail && <span className="font-normal text-zinc-500"> · {detail}</span>}</p>
    </div>
  )
}

export default function PasswordTool() {
  const [tab, setTab] = useState<Tab>('password')
  const [pw, setPw] = useState<PasswordOptions>({ length: 16, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false })
  const [pp, setPp] = useState<PassphraseOptions>({ words: 5, separator: '-', capitalize: true, addNumber: true })
  const [pinLength, setPinLength] = useState(6)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [show, setShow] = useState(false)

  // Generated in the browser after mount (never during server render), from the browser's secure random source.
  const generate = useCallback(() => {
    try {
      setError(null)
      if (tab === 'password') { const problem = validatePassword(pw); if (problem) { setError(problem); setOutput(''); return } setOutput(generatePassword(pw)) }
      else if (tab === 'passphrase') setOutput(generatePassphrase(pp))
      else if (tab === 'pin') setOutput(generatePin(pinLength))
    } catch (e) { setError(e instanceof RangeError ? e.message : 'Could not generate.'); setOutput('') }
  }, [tab, pw, pp, pinLength])
  useEffect(() => { if (tab !== 'check') generate() }, [generate, tab])

  const strength = useMemo(() => estimateStrength(tab === 'check' ? typed : output), [tab, typed, output])
  const bits = tab === 'password' ? (validatePassword(pw) ? 0 : passwordBits(pw)) : tab === 'passphrase' ? passphraseBits(pp.words, pp.addNumber) : tab === 'pin' ? pinLength * Math.log2(10) : strength.bits

  return (
    <div className="space-y-6">
      <Segmented label="Tool" value={tab} onChange={(v) => { setTab(v); setShow(false) }} options={[{ value: 'password', label: 'Password' }, { value: 'passphrase', label: 'Passphrase' }, { value: 'pin', label: 'PIN' }, { value: 'check', label: 'Check a password' }]} />

      {tab !== 'check' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <Card>
            <div className="space-y-4">
              {tab === 'password' && (
                <>
                  <div>
                    <label htmlFor="pw-len" className="mb-1.5 flex justify-between text-sm font-medium"><span>Length</span><span className="tabular-nums">{pw.length}</span></label>
                    <input id="pw-len" type="range" min={PASSWORD_LIMITS.min} max={64} value={pw.length} onChange={(e) => setPw({ ...pw, length: Number(e.target.value) })} className="w-full accent-orange-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Toggle label="Lowercase (a–z)" checked={pw.lower} onChange={(v) => setPw({ ...pw, lower: v })} />
                    <Toggle label="Uppercase (A–Z)" checked={pw.upper} onChange={(v) => setPw({ ...pw, upper: v })} />
                    <Toggle label="Digits (0–9)" checked={pw.digits} onChange={(v) => setPw({ ...pw, digits: v })} />
                    <Toggle label="Symbols (!@#…)" checked={pw.symbols} onChange={(v) => setPw({ ...pw, symbols: v })} />
                  </div>
                  <Toggle label="Avoid look-alike characters (I l 1 O 0)" checked={pw.excludeAmbiguous} onChange={(v) => setPw({ ...pw, excludeAmbiguous: v })} />
                </>
              )}
              {tab === 'passphrase' && (
                <>
                  <div>
                    <label htmlFor="pp-words" className="mb-1.5 flex justify-between text-sm font-medium"><span>Number of words</span><span className="tabular-nums">{pp.words}</span></label>
                    <input id="pp-words" type="range" min={3} max={10} value={pp.words} onChange={(e) => setPp({ ...pp, words: Number(e.target.value) })} className="w-full accent-orange-500" />
                  </div>
                  <SelectField label="Separator" value={pp.separator} onChange={(v) => setPp({ ...pp, separator: v })} options={[{ value: '-', label: 'Hyphen (-)' }, { value: ' ', label: 'Space' }, { value: '.', label: 'Dot (.)' }, { value: '_', label: 'Underscore (_)' }, { value: '', label: 'None' }]} />
                  <Toggle label="Capitalise each word" checked={pp.capitalize} onChange={(v) => setPp({ ...pp, capitalize: v })} />
                  <Toggle label="Add a 2-digit number at the end" checked={pp.addNumber} onChange={(v) => setPp({ ...pp, addNumber: v })} />
                </>
              )}
              {tab === 'pin' && (
                <div>
                  <label htmlFor="pin-len" className="mb-1.5 flex justify-between text-sm font-medium"><span>PIN length</span><span className="tabular-nums">{pinLength}</span></label>
                  <input id="pin-len" type="range" min={4} max={12} value={pinLength} onChange={(e) => setPinLength(Number(e.target.value))} className="w-full accent-orange-500" />
                  <p className="mt-2 text-xs text-zinc-500">PINs are weak against offline attacks. Use 6 or more digits, and never reuse your bank PIN.</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            {error ? <ErrorNote>{error}</ErrorNote> : (
              <>
                <p className="select-all break-all rounded-2xl border border-zinc-200 bg-zinc-50 p-5 font-mono text-xl leading-relaxed dark:border-zinc-800 dark:bg-zinc-950/50" data-testid="generated">{output || '…'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyButton text={output} label="Copy" />
                  <button type="button" onClick={generate} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><RefreshCw className="h-4 w-4" />Generate another</button>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Stat label="Strength" value={strength.label} sub={`about ${Math.round(bits)} bits`} tone={strength.score >= 3 ? 'good' : strength.score === 2 ? 'warn' : 'bad'} />
                  <Stat label="A fast attacker needs" value={crackTime(bits)} sub="at 10 billion guesses a second" />
                </div>
                {tab === 'passphrase' && <p className="mt-3 text-xs text-zinc-500">Each word is chosen at random from a list of {WORDLIST.length} words (about {Math.log2(WORDLIST.length).toFixed(1)} bits each). 5 or more words is a good everyday choice.</p>}
              </>
            )}
          </Card>
        </div>
      ) : (
        <Card>
          <label htmlFor="pw-check" className="mb-1.5 block text-sm font-medium">Type or paste a password to check</label>
          <div className="relative">
            <input id="pw-check" type={show ? 'text' : 'password'} value={typed} onChange={(e) => setTyped(e.target.value.slice(0, 200))} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="Checked on this device only" className={`${inputClass} pr-12 font-mono`} />
            <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">Nothing you type here is sent anywhere, saved or logged. Even so, avoid testing a password you use for something important: test one that is similar.</p>
          {typed && (
            <div className="mt-6 space-y-5">
              <StrengthBar score={strength.score} label={strength.label} detail={`about ${Math.round(strength.bits)} bits · a fast attacker needs ${crackTime(strength.bits)}`} />
              {strength.hints.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">{strength.hints.map((h) => <li key={h}>{h}</li>)}</ul>}
            </div>
          )}
        </Card>
      )}
      <Note>Passwords, passphrases and PINs are generated in your browser using its cryptographic random generator and are never sent to our servers. The strength meter is an estimate: it catches common passwords and patterns, but it cannot know if your password was leaked elsewhere. Use a different password for every account and keep them in a password manager.</Note>
    </div>
  )
}
