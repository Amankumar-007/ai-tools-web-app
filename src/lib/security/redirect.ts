/**
 * Where to send someone after signing in, taken from `?redirect=`. Only a path on this site is accepted: anything that
 * could leave it (`https://…`, `//other.site`, `/\other.site`, `javascript:`, `@other.site` glued onto our address)
 * falls back, so a crafted sign-in link cannot forward people to a look-alike site.
 */
export function safeRedirectPath(target: string | null | undefined, fallback: string): string {
  if (!target || target.length > 512) return fallback;
  // One leading slash, not followed by another slash or a backslash, and no control characters or spaces.
  if (!/^\/(?![/\\])[^\s\\\u0000-\u001f\u007f]*$/.test(target)) return fallback;
  try {
    // Resolve against a placeholder origin: whatever the browser would make of it must stay on that origin.
    const url = new URL(target, 'https://site.invalid');
    if (url.origin !== 'https://site.invalid') return fallback;
    // Tidying "/..//other.site" leaves "//other.site", which a browser reads as another website: refuse that too.
    if (url.pathname.startsWith('//')) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
