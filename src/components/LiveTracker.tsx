'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LiveTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const pingTracker = () => {
      if (document.visibilityState !== 'visible') return;
      fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: pathname || window.location.pathname,
          // userEmail can be added here if you get it from a global state/session
        }),
      }).catch(() => {});
    };

    pingTracker();
    const interval = setInterval(pingTracker, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', pingTracker);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', pingTracker);
    };
  }, [pathname]);

  return null;
}
