// Real-time in-memory visitor tracking for Tomato AI
export interface RealLiveSession {
  id: string;
  ip: string;
  country: string;
  city: string;
  currentPath: string;
  device: string;
  browser: string;
  os: string;
  durationSeconds: number;
  lastActive: string;
  lastActiveTimestamp: number;
  isRegisteredUser: boolean;
  userEmail?: string;
}

// Global store for active visitors (persists in Node.js server memory)
const globalVisitorStore = new Map<string, RealLiveSession>();

// Parse User-Agent string cleanly
function parseUserAgent(ua: string) {
  let device = 'Desktop';
  let browser = 'Browser';
  let os = 'OS';

  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';
  else device = 'Desktop';

  if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/edg/i.test(ua)) browser = 'Edge';

  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os/i.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ios/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { device: `${device} (${os})`, browser, os };
}

export function recordLiveVisitor(
  ip: string,
  path: string,
  userAgent: string,
  userEmail?: string
) {
  const now = Date.now();
  const cleanIp = ip.replace(/^::ffff:/, '') || '127.0.0.1';
  const sessionId = `${cleanIp}_${userEmail || 'guest'}`;

  const { device, browser, os } = parseUserAgent(userAgent || '');

  const existing = globalVisitorStore.get(sessionId);
  const firstSeen = existing ? now - existing.durationSeconds * 1000 : now;
  const durationSeconds = Math.max(1, Math.floor((now - firstSeen) / 1000));

  globalVisitorStore.set(sessionId, {
    id: sessionId,
    ip: cleanIp === '::1' || cleanIp === '127.0.0.1' ? '127.0.0.1 (Localhost)' : cleanIp,
    country: cleanIp === '127.0.0.1' || cleanIp === '::1' ? 'Local Development' : 'Live Visitor',
    city: cleanIp === '127.0.0.1' || cleanIp === '::1' ? 'Localhost' : 'Online',
    currentPath: path,
    device,
    browser,
    os,
    durationSeconds,
    lastActive: 'Just now',
    lastActiveTimestamp: now,
    isRegisteredUser: !!userEmail,
    userEmail,
  });

  // Hard cap so the store can never grow without bound; the oldest session goes first.
  const MAX_SESSIONS = 5000;
  while (globalVisitorStore.size > MAX_SESSIONS) {
    const oldest = globalVisitorStore.keys().next().value;
    if (oldest === undefined) break;
    globalVisitorStore.delete(oldest);
  }

  // Clean up sessions inactive for more than 15 minutes
  const EXPIRY_MS = 15 * 60 * 1000;
  for (const [key, session] of globalVisitorStore.entries()) {
    if (now - session.lastActiveTimestamp > EXPIRY_MS) {
      globalVisitorStore.delete(key);
    }
  }
}

export function getRealActiveVisitors(): RealLiveSession[] {
  const now = Date.now();
  const EXPIRY_MS = 15 * 60 * 1000;
  const active: RealLiveSession[] = [];

  for (const [key, session] of globalVisitorStore.entries()) {
    if (now - session.lastActiveTimestamp <= EXPIRY_MS) {
      active.push(session);
    } else {
      globalVisitorStore.delete(key);
    }
  }

  return active;
}
