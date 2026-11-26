import { NextRequest, NextResponse } from 'next/server';
import { readJsonLimited } from '@/lib/security/body';

// Only real raster images, sent as a data URL. Remote URLs are refused: passing one to
// Cloudinary would make it fetch arbitrary addresses on our behalf.
const IMAGE_DATA_URL = /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const MAX_DATA_URL_CHARS = 7_000_000; // about 5 MB of image

/** Requires a signed-in user (enforced by the middleware) and is rate limited there. */
export async function POST(request: NextRequest) {
  const read = await readJsonLimited<{ image?: unknown }>(request, 8 * 1024 * 1024);
  if (!read.ok) return NextResponse.json({ error: read.error }, { status: read.status });

  const image = read.data && typeof read.data === 'object' ? (read.data as { image?: unknown }).image : undefined;
  if (typeof image !== 'string' || image.length > MAX_DATA_URL_CHARS || !IMAGE_DATA_URL.test(image)) {
    return NextResponse.json({ error: 'Upload a PNG, JPEG, WebP or GIF image under 5 MB.' }, { status: 400 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return NextResponse.json({ error: 'Image uploads are not configured.' }, { status: 503 });

  try {
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'ml_default');

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(20_000),
    });
    if (!uploadResponse.ok) throw new Error(`Cloudinary responded ${uploadResponse.status}`);

    const uploadData = (await uploadResponse.json()) as { secure_url?: string };
    if (!uploadData.secure_url) throw new Error('No URL returned');
    return NextResponse.json({ url: uploadData.secure_url });
  } catch (error) {
    console.error('Upload error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 502 });
  }
}
