/**
 * Day planner: turns a task list into a realistic time-blocked schedule, and exports it as a calendar file (.ics).
 * Pure and deterministic (the clock is injected), so every rule is unit-tested.
 *
 * Rules, in order of importance:
 *  1. Fixed-time tasks are placed first, exactly where asked. If one collides with lunch, the day's edges or another
 *     fixed task it is NOT silently moved: it is reported as a conflict.
 *  2. Flexible tasks fill the free time top-down, highest priority first (longer tasks first among equals).
 *  3. After `breakEvery` minutes of continuous focus a break is inserted; tasks too long for one stretch are split.
 *  4. Anything that does not fit is reported, with how many minutes are left over, never dropped quietly.
 */

export type Priority = 1 | 2 | 3; // 3 = most important

export interface PlanTask { id: string; title: string; minutes: number; priority: Priority; /** "HH:MM" - pin the task to this time. */ start?: string }
export interface PlanSettings {
  dayStart: string; dayEnd: string;
  /** "" = no lunch break. */
  lunchStart: string; lunchMinutes: number;
  /** Minutes of continuous focus before a break (0 = no automatic breaks). */
  breakEvery: number; breakMinutes: number;
  /** Quiet gap kept after each task. */
  buffer: number;
  /** Do not leave a slice of a split task shorter than this. */
  minChunk: number;
}

export const DEFAULT_SETTINGS: PlanSettings = { dayStart: '09:00', dayEnd: '18:00', lunchStart: '13:00', lunchMinutes: 60, breakEvery: 90, breakMinutes: 10, buffer: 5, minChunk: 20 };

export type BlockKind = 'task' | 'fixed' | 'break' | 'lunch';
export interface PlanBlock { kind: BlockKind; title: string; start: number; end: number; taskId?: string; part?: { index: number; of: number }; priority?: Priority }
export interface Problem { taskId: string; title: string; reason: string; minutesLeft: number }
export interface Plan { blocks: PlanBlock[]; problems: Problem[]; focusMinutes: number; freeMinutes: number; settingsError?: string }

export function parseTime(text: string): number | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(text.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}
export const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
export function formatTime12(minutes: number): string {
  const h = Math.floor(minutes / 60); const m = minutes % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
export const formatDuration = (minutes: number) => (minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`);

export const LIMITS = { maxTasks: 40, maxTaskMinutes: 12 * 60 } as const;

export function validateSettings(s: PlanSettings): string | null {
  const start = parseTime(s.dayStart), end = parseTime(s.dayEnd);
  if (start === null || end === null) return 'Enter the start and end of your day as times, like 09:00.';
  if (end - start < 60) return 'Your day must be at least one hour long.';
  if (s.lunchStart !== '' && parseTime(s.lunchStart) === null) return 'Lunch time must look like 13:00 (or leave it empty).';
  for (const [name, v, max] of [['Lunch length', s.lunchMinutes, 240], ['Break every', s.breakEvery, 480], ['Break length', s.breakMinutes, 120], ['Gap after tasks', s.buffer, 60], ['Smallest split', s.minChunk, 240]] as const) {
    if (!Number.isInteger(v) || v < 0 || v > max) return `${name} must be a whole number between 0 and ${max}.`;
  }
  if (s.breakEvery > 0 && s.breakEvery < 15) return 'Break every: use at least 15 minutes, or 0 for no automatic breaks.';
  return null;
}

export function validateTask(t: PlanTask): string | null {
  if (!t.title.trim()) return 'Give every task a name.';
  if (!Number.isInteger(t.minutes) || t.minutes < 5 || t.minutes > LIMITS.maxTaskMinutes) return `"${t.title.trim().slice(0, 30)}": time must be between 5 and ${LIMITS.maxTaskMinutes} minutes.`;
  if (t.start !== undefined && t.start !== '' && parseTime(t.start) === null) return `"${t.title.trim().slice(0, 30)}": the fixed time must look like 14:30.`;
  return null;
}

interface Interval { start: number; end: number }

export function planDay(tasks: PlanTask[], settings: PlanSettings): Plan {
  const settingsError = validateSettings(settings);
  if (settingsError) return { blocks: [], problems: [], focusMinutes: 0, freeMinutes: 0, settingsError };
  const dayStart = parseTime(settings.dayStart)!, dayEnd = parseTime(settings.dayEnd)!;
  const blocks: PlanBlock[] = []; const problems: Problem[] = [];
  const busy: Interval[] = [];

  if (settings.lunchStart !== '' && settings.lunchMinutes > 0) {
    const ls = parseTime(settings.lunchStart)!; const le = Math.min(ls + settings.lunchMinutes, dayEnd);
    if (le > dayStart && ls < dayEnd) { const start = Math.max(ls, dayStart); blocks.push({ kind: 'lunch', title: 'Lunch', start, end: le }); busy.push({ start, end: le }); }
  }

  const valid = tasks.filter((t) => validateTask(t) === null);
  for (const t of tasks) { const err = validateTask(t); if (err) problems.push({ taskId: t.id, title: t.title.trim() || 'Untitled', reason: err, minutesLeft: Number.isFinite(t.minutes) ? t.minutes : 0 }); }

  // 1. Fixed tasks, in time order.
  const fixed = valid.filter((t) => t.start).map((t) => ({ t, start: parseTime(t.start!)! })).sort((a, b) => a.start - b.start);
  for (const { t, start } of fixed) {
    const end = start + t.minutes;
    const clash = start < dayStart || end > dayEnd ? 'It falls outside your working day.' : busy.find((b) => start < b.end && end > b.start) ? 'It overlaps lunch or another fixed task.' : null;
    if (clash) { problems.push({ taskId: t.id, title: t.title.trim(), reason: clash, minutesLeft: t.minutes }); continue; }
    blocks.push({ kind: 'fixed', title: t.title.trim(), start, end, taskId: t.id, priority: t.priority });
    busy.push({ start, end });
  }

  // Free slots = the day minus everything already placed.
  busy.sort((a, b) => a.start - b.start);
  const slots: Interval[] = []; let cursor = dayStart;
  for (const b of busy) { if (b.start > cursor) slots.push({ start: cursor, end: b.start }); cursor = Math.max(cursor, b.end); }
  if (cursor < dayEnd) slots.push({ start: cursor, end: dayEnd });

  // 2. Flexible tasks, most important first.
  const flexible = valid.filter((t) => !t.start).sort((a, b) => b.priority - a.priority || b.minutes - a.minutes);
  let slotIndex = 0; let pos = slots[0]?.start ?? dayEnd; let run = 0; // run = continuous focus minutes since the last break
  const placed: Array<{ task: PlanTask; start: number; end: number }> = [];
  const leftover = new Map<string, number>();
  const nextSlot = () => { slotIndex++; if (slotIndex < slots.length) { pos = slots[slotIndex].start; run = 0; } };

  for (const t of flexible) {
    let remaining = t.minutes;
    while (remaining > 0 && slotIndex < slots.length) {
      const slotEnd = slots[slotIndex].end;
      let room = slotEnd - pos;
      if (room <= 0) { nextSlot(); continue; }
      if (settings.breakEvery > 0 && run >= settings.breakEvery) {
        if (room > settings.breakMinutes + settings.minChunk) {
          if (settings.breakMinutes > 0) { blocks.push({ kind: 'break', title: 'Break', start: pos, end: pos + settings.breakMinutes }); pos += settings.breakMinutes; }
          run = 0; continue;
        }
        nextSlot(); continue;
      }
      room = slotEnd - pos;
      const stretch = settings.breakEvery > 0 ? settings.breakEvery - run : Infinity;
      const chunk = Math.min(remaining, room, stretch);
      // Avoid leaving a useless sliver (but a task's final bit may be small).
      if (chunk < remaining && chunk < settings.minChunk && room < remaining) { nextSlot(); continue; }
      if (chunk <= 0) { nextSlot(); continue; }
      placed.push({ task: t, start: pos, end: pos + chunk });
      pos += chunk; run += chunk; remaining -= chunk;
    }
    if (remaining > 0) leftover.set(t.id, remaining);
    else if (settings.buffer > 0 && slotIndex < slots.length) pos = Math.min(pos + settings.buffer, slots[slotIndex].end); // quiet gap after a finished task
  }

  const counts = new Map<string, number>();
  for (const p of placed) counts.set(p.task.id, (counts.get(p.task.id) ?? 0) + 1);
  const seen = new Map<string, number>();
  for (const p of placed) {
    const idx = (seen.get(p.task.id) ?? 0) + 1; seen.set(p.task.id, idx);
    const of = counts.get(p.task.id) ?? 1;
    blocks.push({ kind: 'task', title: p.task.title.trim(), start: p.start, end: p.end, taskId: p.task.id, priority: p.task.priority, ...(of > 1 ? { part: { index: idx, of } } : {}) });
  }
  for (const [id, minutes] of leftover) {
    const t = flexible.find((x) => x.id === id)!;
    problems.push({ taskId: id, title: t.title.trim(), reason: minutes === t.minutes ? 'There is no free time left today for this.' : 'Only part of it fits today.', minutesLeft: minutes });
  }

  blocks.sort((a, b) => a.start - b.start || a.end - b.end);
  const focusMinutes = blocks.filter((b) => b.kind === 'task' || b.kind === 'fixed').reduce((s, b) => s + (b.end - b.start), 0);
  const used = blocks.reduce((s, b) => s + (b.end - b.start), 0);
  return { blocks, problems, focusMinutes, freeMinutes: Math.max(dayEnd - dayStart - used, 0) };
}

// ── export ───────────────────────────────────────────────────────────

export const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

/** RFC 5545 text escaping. */
export const icsEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Fold a content line to at most 75 octets per line, never splitting a multi-byte character. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = []; let cur = ''; let bytes = 0; let limit = 75;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (bytes + b > limit) { parts.push(cur); cur = ''; bytes = 0; limit = 74; } // continuation lines start with a space
    cur += ch; bytes += b;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}

const stamp = (date: string, minutes: number) => `${date.replace(/-/g, '')}T${String(Math.floor(minutes / 60)).padStart(2, '0')}${String(minutes % 60).padStart(2, '0')}00`;

export interface IcsOptions { date: string; includeBreaks: boolean; reminderMinutes: number; now: Date }

/** A calendar file that Google Calendar, Apple Calendar and Outlook all import. Times are "floating" (your local time). */
export function toIcs(blocks: PlanBlock[], opts: IcsOptions): string {
  if (!isIsoDate(opts.date)) throw new RangeError('Choose a valid date.');
  const dtstamp = opts.now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TomatoAI//Day Planner//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  blocks.filter((b) => b.kind === 'task' || b.kind === 'fixed' || (opts.includeBreaks && (b.kind === 'break' || b.kind === 'lunch'))).forEach((b, i) => {
    const title = `${b.title}${b.part ? ` (${b.part.index}/${b.part.of})` : ''}`;
    lines.push('BEGIN:VEVENT', `UID:${opts.date}-${i}-${stamp(opts.date, b.start)}@tomatoai.in`, `DTSTAMP:${dtstamp}`, `DTSTART:${stamp(opts.date, b.start)}`, `DTEND:${stamp(opts.date, b.end)}`, `SUMMARY:${icsEscape(title)}`);
    if (b.priority) lines.push(`DESCRIPTION:${icsEscape(`Priority: ${['', 'Low', 'Medium', 'High'][b.priority]}. Planned with TomatoAI Day Planner.`)}`);
    if (opts.reminderMinutes > 0 && (b.kind === 'task' || b.kind === 'fixed')) lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(title)}`, `TRIGGER:-PT${opts.reminderMinutes}M`, 'END:VALARM');
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

export function toScheduleText(blocks: PlanBlock[], date: string): string {
  const head = `My plan for ${date}`;
  const rows = blocks.map((b) => `${formatTime12(b.start)} - ${formatTime12(b.end)}  ${b.title}${b.part ? ` (${b.part.index}/${b.part.of})` : ''}`);
  return [head, '', ...rows].join('\n');
}

export function toScheduleCsv(blocks: PlanBlock[], date: string): string {
  const cell = (v: string) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""');
  return ['Date,Start,End,Minutes,Type,Task', ...blocks.map((b) => `${date},${formatTime(b.start)},${formatTime(b.end)},${b.end - b.start},${b.kind},"${cell(`${b.title}${b.part ? ` (${b.part.index}/${b.part.of})` : ''}`)}"`)].join('\r\n') + '\r\n';
}
