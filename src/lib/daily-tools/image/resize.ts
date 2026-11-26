/** Small pure helpers for the image converter. */

export type OutType = 'image/jpeg' | 'image/png' | 'image/webp';
export const EXT: Record<OutType, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/** Scale (w, h) down to fit inside maxW x maxH, keeping the shape. Never scales up. 0 or blank means "no limit" on that side. */
export function fitWithin(w: number, h: number, maxW: number, maxH: number): { w: number; h: number } {
  const limitW = maxW > 0 ? maxW : Infinity;
  const limitH = maxH > 0 ? maxH : Infinity;
  const scale = Math.min(1, limitW / w, limitH / h);
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

/** photo.jpeg + "image/webp" -> photo.webp, and avoid clashes inside one batch (photo.webp, photo-2.webp). */
export function outputName(original: string, type: OutType, taken: Set<string>): string {
  const stem = original.replace(/\.[^.]*$/, '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').trim().slice(0, 100) || 'image';
  let name = `${stem}.${EXT[type]}`;
  for (let i = 2; taken.has(name.toLowerCase()); i++) name = `${stem}-${i}.${EXT[type]}`;
  taken.add(name.toLowerCase());
  return name;
}

/** "Saved 62%" or "12% larger": honest in both directions (PNG -> JPG saves a lot; a tiny JPG -> PNG grows). */
export function savings(before: number, after: number): { pct: number; text: string; smaller: boolean } {
  if (before <= 0) return { pct: 0, text: '', smaller: false };
  const pct = Math.round((Math.abs(before - after) / before) * 100);
  if (after < before) return { pct, text: `${pct}% smaller`, smaller: true };
  if (after === before) return { pct: 0, text: 'same size', smaller: false };
  return { pct, text: `${pct}% larger`, smaller: false };
}
