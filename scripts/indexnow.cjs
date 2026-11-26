#!/usr/bin/env node
/**
 * Tells search engines that use IndexNow (Bing, Yandex, Seznam, Naver, Yep and others) that your pages exist or changed.
 *
 * Run it AFTER the site is deployed, because the engines check that the key file is reachable on your live domain:
 *
 *   node scripts/indexnow.cjs --dry                 # shows what would be sent, sends nothing
 *   node scripts/indexnow.cjs                       # submits every URL in the live sitemap
 *   node scripts/indexnow.cjs --only=/tools         # only URLs whose path starts with /tools
 *   SITE_URL=https://example.com node scripts/indexnow.cjs
 *   node scripts/indexnow.cjs --sitemap=http://localhost:3002/sitemap.xml --dry   # read a local sitemap
 *
 * The key is the name of the file in /public (32 hex characters + .txt). It is public by design.
 * Google does not use IndexNow: submit /sitemap.xml once in Google Search Console instead (see SEO.md).
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => (args.find((a) => a.startsWith(`--${name}=`)) || '').split('=').slice(1).join('=') || null;

const SITE_URL = (process.env.SITE_URL || 'https://www.tomatoai.in').replace(/\/+$/, '');
const sitemapUrl = option('sitemap') || `${SITE_URL}/sitemap.xml`;
const only = option('only');
const dry = flag('dry');
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const publicDir = path.join(__dirname, '..', 'public');
const keyFile = fs.readdirSync(publicDir).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) { console.error('No IndexNow key file found in /public (expected <32 hex characters>.txt).'); process.exit(1); }
const key = keyFile.replace(/\.txt$/, '');
if (fs.readFileSync(path.join(publicDir, keyFile), 'utf8').trim() !== key) { console.error(`public/${keyFile} must contain exactly its own name (${key}).`); process.exit(1); }

const host = new URL(SITE_URL).host;
const keyLocation = `${SITE_URL}/${keyFile}`;

(async () => {
  const res = await fetch(sitemapUrl, { headers: { 'User-Agent': 'tomatoai-indexnow-script' } });
  if (!res.ok) { console.error(`Could not read ${sitemapUrl}: HTTP ${res.status}`); process.exit(1); }
  const xml = await res.text();
  let urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  urls = urls.filter((u) => { try { const x = new URL(u); return x.host === host && (!only || x.pathname.startsWith(only)); } catch { return false; } });
  urls = [...new Set(urls)];
  if (urls.length === 0) { console.error('No URLs to submit (check --sitemap, --only and SITE_URL).'); process.exit(1); }

  console.log(`Site: ${SITE_URL}\nKey file: ${keyLocation}\nURLs: ${urls.length}${only ? ` (path starts with ${only})` : ''}`);
  if (dry) { urls.slice(0, 8).forEach((u) => console.log('  ' + u)); if (urls.length > 8) console.log(`  ... and ${urls.length - 8} more`); console.log('\nDry run: nothing was sent.'); return; }

  // The engines fetch the key file to prove you own the site, so check it first and stop if it is not there.
  const probe = await fetch(keyLocation).catch(() => null);
  const served = probe && probe.ok ? (await probe.text()).trim() : null;
  if (served !== key) { console.error(`\nThe key file is not live at ${keyLocation} (got ${probe ? `HTTP ${probe.status}` : 'no answer'}). Deploy the site first, then run this again.`); process.exit(1); }

  for (let i = 0; i < urls.length; i += 9000) {
    const batch = urls.slice(i, i + 9000);
    const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host, key, keyLocation, urlList: batch }) });
    console.log(`Submitted ${batch.length} URLs: HTTP ${r.status}${r.status === 200 || r.status === 202 ? ' (accepted)' : ' (not accepted: see https://www.indexnow.org/documentation)'}`);
    if (![200, 202].includes(r.status)) process.exitCode = 1;
  }
})().catch((e) => { console.error(e.message || e); process.exit(1); });
