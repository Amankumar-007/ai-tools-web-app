#!/usr/bin/env node
/**
 * Generates the admin credentials for the environment.
 *
 *   node scripts/admin-setup.cjs
 *
 * Asks for the admin password (hidden), then prints ADMIN_JWT_SECRET and
 * ADMIN_PASSWORD_HASH lines to paste into .env.local and into your hosting
 * provider's environment settings. The password itself is never stored.
 */
const crypto = require('node:crypto');

function askHidden(prompt) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) return reject(new Error('Run this in an interactive terminal.'));
    process.stdout.write(prompt);
    let value = '';
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\u0003') { process.stdout.write('\n'); process.exit(130); }
        if (ch === '\r' || ch === '\n') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.off('data', onData);
          process.stdout.write('\n');
          return resolve(value);
        }
        if (ch === '\u007f' || ch === '\b') value = value.slice(0, -1);
        else value += ch;
      }
    };
    process.stdin.on('data', onData);
  });
}

function weak(password) {
  if (password.length < 12) return 'Use at least 12 characters.';
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (classes < 3) return 'Mix at least three of: lowercase, uppercase, digits, symbols.';
  if (/password|admin|tomato|123456|qwerty/i.test(password)) return 'Avoid common words like "password", "admin" or "tomato".';
  return null;
}

(async () => {
  const password = await askHidden('Admin password (not shown): ');
  const problem = weak(password);
  if (problem) { console.error(`Too weak: ${problem}`); process.exit(1); }
  const again = await askHidden('Repeat password: ');
  if (again !== password) { console.error('Passwords do not match.'); process.exit(1); }

  const N = 16384, r = 8, p = 1;
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N, r, p, maxmem: 256 * 1024 * 1024 });
  const secret = crypto.randomBytes(48).toString('base64url');

  console.log('\nAdd these to .env.local and to your hosting environment variables:\n');
  console.log('ADMIN_EMAIL=you@example.com');
  console.log(`ADMIN_JWT_SECRET=${secret}`);
  console.log(`ADMIN_PASSWORD_HASH=scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${hash.toString('base64')}`);
  console.log('\nReplace you@example.com with the email you will sign in with. Keep these values secret.');
})().catch((e) => { console.error(e.message); process.exit(1); });
