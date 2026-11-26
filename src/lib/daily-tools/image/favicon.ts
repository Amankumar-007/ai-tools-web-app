/**
 * Favicon pack building blocks. The pixel work (drawing the image at each size) happens on a canvas in the browser;
 * everything that is plain data (the .ico container, the manifest, the HTML snippet, the file list) lives here so it
 * can be tested exactly.
 */

export interface PngImage { size: number; data: Uint8Array }

/** Sizes bundled into favicon.ico (browsers pick the best one). */
export const ICO_SIZES = [16, 32, 48] as const;

export interface FaviconFile { name: string; size: number; purpose: string }

/** Every PNG in the pack, with its standard file name. */
export const PNG_FILES: FaviconFile[] = [
  { name: 'favicon-16x16.png', size: 16, purpose: 'Browser tab (standard density)' },
  { name: 'favicon-32x32.png', size: 32, purpose: 'Browser tab (high density) and Windows taskbar' },
  { name: 'favicon-48x48.png', size: 48, purpose: 'Windows site icon and Google search results' },
  { name: 'apple-touch-icon.png', size: 180, purpose: 'iPhone / iPad home screen' },
  { name: 'android-chrome-192x192.png', size: 192, purpose: 'Android home screen and PWA' },
  { name: 'android-chrome-512x512.png', size: 512, purpose: 'PWA splash screen and Play Store listing' },
];

/**
 * ICO container holding PNG-compressed images (supported by every browser since IE9 and by Windows since Vista).
 * Layout: 6-byte header, one 16-byte directory entry per image, then the PNG files back to back.
 */
export function buildIco(images: PngImage[]): Uint8Array {
  if (images.length === 0 || images.length > 255) throw new RangeError('An .ico needs between 1 and 255 images.');
  const headerSize = 6 + 16 * images.length;
  const total = headerSize + images.reduce((s, i) => s + i.data.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, images.length, true);
  let offset = headerSize;
  images.forEach((img, i) => {
    if (!Number.isInteger(img.size) || img.size < 1 || img.size > 256) throw new RangeError('.ico images must be 1 to 256 pixels.');
    const base = 6 + i * 16;
    out[base] = img.size === 256 ? 0 : img.size; // width (0 means 256)
    out[base + 1] = img.size === 256 ? 0 : img.size; // height
    out[base + 2] = 0; // palette colours
    out[base + 3] = 0; // reserved
    view.setUint16(base + 4, 1, true); // colour planes
    view.setUint16(base + 6, 32, true); // bits per pixel
    view.setUint32(base + 8, img.data.length, true);
    view.setUint32(base + 12, offset, true);
    out.set(img.data, offset);
    offset += img.data.length;
  });
  return out;
}

export interface ManifestOptions { name: string; shortName: string; themeColor: string; backgroundColor: string }

const HEX = /^#[0-9a-fA-F]{6}$/;
export const isHexColor = (v: string) => HEX.test(v);

const clean = (s: string, max: number) => s.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max);

export function webManifest(o: ManifestOptions): string {
  const name = clean(o.name, 60) || 'My site';
  return JSON.stringify({
    name,
    short_name: clean(o.shortName, 12) || name.slice(0, 12),
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: isHexColor(o.themeColor) ? o.themeColor : '#ffffff',
    background_color: isHexColor(o.backgroundColor) ? o.backgroundColor : '#ffffff',
    display: 'standalone',
  }, null, 2) + '\n';
}

/** The <head> lines that wire the icons up. Colours are validated, so nothing user-typed can break out of the attribute. */
export function htmlSnippet(o: { themeColor: string }): string {
  const color = isHexColor(o.themeColor) ? o.themeColor : '#ffffff';
  return [
    '<link rel="icon" href="/favicon.ico" sizes="48x48">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
    `<meta name="theme-color" content="${color}">`,
  ].join('\n') + '\n';
}

export function readme(): string {
  return `Your favicon pack
=================

1. Upload every file in this folder to the ROOT of your website (so /favicon.ico works).
2. Paste the lines from favicon-snippet.html into the <head> of every page.
   - Next.js: put favicon.ico in the app/ folder (or public/) and the PNGs in public/.
   - WordPress: Appearance > Customize > Site Identity > Site Icon (upload android-chrome-512x512.png).
3. Browsers cache favicons hard. If you do not see the new icon, clear the cache or open the site in a private window.

${PNG_FILES.map((f) => `${f.name.padEnd(30)} ${f.purpose}`).join('\n')}
${'favicon.ico'.padEnd(30)} Classic icon file (contains 16, 32 and 48 px)
${'site.webmanifest'.padEnd(30)} Web app manifest (name, colours, icons)
`;
}

// ── drawing geometry (pure, so the shape maths is tested) ────────────

export type IconShape = 'square' | 'rounded' | 'circle';
export type IconFit = 'contain' | 'cover';

/** Where the source image goes inside a square canvas of `size` pixels. */
export function placeImage(srcW: number, srcH: number, size: number, fit: IconFit, paddingPct: number): { x: number; y: number; w: number; h: number } {
  const pad = Math.max(0, Math.min(paddingPct, 40)) / 100;
  const inner = size * (1 - 2 * pad);
  const scale = fit === 'cover' ? Math.max(inner / srcW, inner / srcH) : Math.min(inner / srcW, inner / srcH);
  const w = srcW * scale; const h = srcH * scale;
  return { x: (size - w) / 2, y: (size - h) / 2, w, h };
}

/** Corner radius for each shape (as a fraction of the size). */
export function cornerRadius(shape: IconShape, size: number): number {
  return shape === 'circle' ? size / 2 : shape === 'rounded' ? size * 0.22 : 0;
}
