/** Reads a YouTube video id out of any common link form. Pure. */

const ID = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeId(input: string): string | null {
  const text = input.trim();
  if (!text || text.length > 500) return null;
  if (ID.test(text)) return text; // a bare id
  let url: URL;
  try { url = new URL(/^[a-z]+:\/\//i.test(text) ? text : `https://${text}`); } catch { return null; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  let candidate: string | null = null;
  if (host === 'youtu.be') candidate = url.pathname.split('/')[1] ?? null;
  else if (host === 'youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.pathname === '/watch' || url.pathname === '/watch/') candidate = url.searchParams.get('v');
    else if (['shorts', 'embed', 'live', 'v', 'e'].includes(parts[0] ?? '')) candidate = parts[1] ?? null;
  }
  return candidate && ID.test(candidate) ? candidate : null;
}

export interface ThumbSize { key: string; label: string; file: string; width: number; height: number }

/** Largest first. Not every video has every size (maxres exists only for HD uploads). */
export const THUMB_SIZES: ThumbSize[] = [
  { key: 'maxres', label: 'Max resolution', file: 'maxresdefault.jpg', width: 1280, height: 720 },
  { key: 'sd', label: 'Standard', file: 'sddefault.jpg', width: 640, height: 480 },
  { key: 'hq', label: 'High quality', file: 'hqdefault.jpg', width: 480, height: 360 },
  { key: 'mq', label: 'Medium', file: 'mqdefault.jpg', width: 320, height: 180 },
  { key: 'default', label: 'Small', file: 'default.jpg', width: 120, height: 90 },
];

export const thumbUrl = (id: string, file: string) => `https://i.ytimg.com/vi/${id}/${file}`;
