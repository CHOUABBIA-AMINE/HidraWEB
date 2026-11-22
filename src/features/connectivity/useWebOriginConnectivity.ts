import { useEffect, useState } from 'react';

export type WebOriginConnectivity = 'checking' | 'reachable' | 'degraded' | 'offline' | 'reconnecting';

/** Same-origin static WEB probe only; it is NOT API, SSE, telemetry, or OT health. */
export async function probeWebOrigin(signal: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch('/', {
      method: 'HEAD',
      cache: 'no-store',
      credentials: 'same-origin',
      redirect: 'error',
      signal,
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** A bounded web-origin check plus browser network events; no domain subscriptions. */
export function useWebOriginConnectivity(): WebOriginConnectivity {
  const [status, setStatus] = useState<WebOriginConnectivity>(() =>
    navigator.onLine ? 'checking' : 'offline');

  useEffect(() => {
    let active = true;
    let sequence = 0;
    let controller: AbortController | undefined;
    const inspect = async (recovering = false) => {
      const requestId = ++sequence;
      controller?.abort();
      if (!navigator.onLine) return;
      const attemptController = new AbortController();
      controller = attemptController;
      if (recovering) setStatus('reconnecting');
      const timeout = window.setTimeout(() => attemptController.abort(), 5000);
      try {
        const reachable = await probeWebOrigin(attemptController.signal);
        if (active && sequence === requestId && navigator.onLine) {
          setStatus(reachable ? 'reachable' : 'degraded');
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };
    const offline = () => {
      ++sequence;
      controller?.abort();
      setStatus('offline');
    };
    const online = () => { void inspect(true); };
    const visible = () => {
      if (!document.hidden && navigator.onLine) void inspect();
    };
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    document.addEventListener('visibilitychange', visible);
    void inspect();
    const interval = window.setInterval(() => { void inspect(); }, 60_000);
    return () => {
      active = false;
      ++sequence;
      controller?.abort();
      window.clearInterval(interval);
      window.removeEventListener('offline', offline);
      window.removeEventListener('online', online);
      document.removeEventListener('visibilitychange', visible);
    };
  }, []);

  return status;
}
