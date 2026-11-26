/** Save a Blob (or bytes) to the user's device, from the browser, without any server. */

export function safeName(name: string, fallback = 'file'): string {
  const cleaned = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/\s+/g, ' ').trim().replace(/^\.+/, '').slice(0, 120)
  return cleaned || fallback
}

export function baseName(fileName: string): string {
  return safeName(fileName.replace(/\.[^.]*$/, ''), 'file')
}

export function downloadBlob(data: Blob | Uint8Array | string, fileName: string, type = 'application/octet-stream'): void {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = safeName(fileName)
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 2 : 1)} MB`
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the image.'))), type, quality))
}

/** Load an image file into an element, honouring EXIF rotation. Rejects with a friendly message for unreadable files. */
export async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    if (typeof createImageBitmap === 'function' && file.type !== 'image/svg+xml') return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch { /* fall through to <img> */ }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`"${file.name}" could not be opened as an image. HEIC photos are not supported by browsers: export it as JPG first.`))
      img.src = url
    })
  } finally { setTimeout(() => URL.revokeObjectURL(url), 5_000) }
}

export const imageSize = (img: ImageBitmap | HTMLImageElement) => ({ w: 'naturalWidth' in img ? img.naturalWidth : img.width, h: 'naturalHeight' in img ? img.naturalHeight : img.height })

/** Hard ceiling on pixels we will put on a canvas: browsers fail silently or crash far above this on phones. */
export const MAX_PIXELS = 50_000_000
