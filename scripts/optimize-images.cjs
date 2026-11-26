// One-off image optimiser for the few huge files that every visitor downloads. Run: node scripts/optimize-images.cjs
// Writes compact WebP/JPEG versions next to the originals (the originals are kept).
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC = path.join(__dirname, '..', 'public');
const JOBS = [
  // The chat page's full-screen artwork (used as a CSS background, light and dark).
  { from: 'chatbot1.png', to: 'art/chatbot-light.webp', width: 1920, quality: 76 },
  { from: 'chatbot2.png', to: 'art/chatbot-dark.webp', width: 1920, quality: 76 },
  // Background of the content generator, outlier and optimize pages.
  // Slightly blurred here, once, so pages do not have to run a CSS blur filter over a full screen while scrolling.
  { from: 'generated-image.png', to: 'art/generated-image.webp', width: 1600, quality: 72, blur: 1.2 },
  // The dark theme's page background.
  { from: 'generated-image (1).png', to: 'art/generated-image-dark.webp', width: 1600, quality: 72, blur: 1.2 },
  // The default social-share image: 1200x630, small enough that WhatsApp and Slack accept it.
  { from: 'ab.png', to: 'og-default.jpg', width: 1200, height: 630, quality: 82, jpeg: true },
];

(async () => {
  for (const job of JOBS) {
    const src = path.join(PUBLIC, job.from);
    const dest = path.join(PUBLIC, job.to);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    let img = sharp(src).resize({ width: job.width, height: job.height, fit: job.height ? 'cover' : 'inside', position: 'centre', withoutEnlargement: !job.height });
    if (job.blur) img = img.blur(job.blur);
    img = job.jpeg ? img.jpeg({ quality: job.quality, mozjpeg: true }) : img.webp({ quality: job.quality, effort: 5 });
    await img.toFile(dest);
    const before = fs.statSync(src).size; const after = fs.statSync(dest).size;
    const meta = await sharp(dest).metadata();
    console.log(`${job.from.padEnd(22)} ${(before / 1024).toFixed(0).padStart(6)} kB -> ${job.to.padEnd(28)} ${(after / 1024).toFixed(0).padStart(5)} kB  ${meta.width}x${meta.height}`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
