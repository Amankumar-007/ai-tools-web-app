export function getBestLogoUrl(website: string, customLogo?: string): string {
  if (customLogo && customLogo.trim().length > 0) {
    return customLogo;
  }

  try {
    const hostname = new URL(website.startsWith('http') ? website : `https://${website}`).hostname;
    const cleanHostname = hostname.replace('www.', '');
    // Use Google S2 favicons — reliable, always returns something
    return `https://www.google.com/s2/favicons?domain=${cleanHostname}&sz=128`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=example.com&sz=128`;
  }
}

export function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/** Logo sources tried in order when an image cannot load. */
export function getLogoFallbackChain(website: string, storedLogo?: string): string[] {
  try {
    const parsed = new URL(website.startsWith('http') ? website : `https://${website}`);
    const cleanHostname = parsed.hostname.replace(/^www\./, '');
    const googleFavicon = `https://www.google.com/s2/favicons?domain=${cleanHostname}&sz=128`;
    const customLogo = storedLogo?.trim();

    return [...new Set([
      ...(customLogo && !customLogo.includes('google.com/s2/favicons') ? [customLogo] : []),
      `https://logo.clearbit.com/${cleanHostname}`,
      `https://icon.horse/icon/${cleanHostname}`,
      `${parsed.origin}/favicon.ico`,
      googleFavicon,
    ])];
  } catch {
    return storedLogo?.trim() ? [storedLogo] : [];
  }
}

