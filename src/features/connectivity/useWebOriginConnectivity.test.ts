import { afterEach, describe, expect, it, vi } from 'vitest';

import { probeWebOrigin } from '@/features/connectivity/useWebOriginConnectivity';

afterEach(() => { vi.unstubAllGlobals(); });

describe('UXR-10 WEB-origin reachability', () => {
  it('probes the current WEB origin with bounded non-cached HEAD, not an API or realtime endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const signal = new AbortController().signal;
    await expect(probeWebOrigin(signal)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('/', {
      method: 'HEAD', cache: 'no-store', credentials: 'same-origin',
      redirect: 'error', signal,
    });
  });

  it('treats a non-2xx WEB response, network error, or aborted probe as degraded', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockRejectedValueOnce(new TypeError('network'))
      .mockRejectedValueOnce(new DOMException('aborted', 'AbortError'));
    vi.stubGlobal('fetch', fetchMock);
    const signal = new AbortController().signal;
    await expect(probeWebOrigin(signal)).resolves.toBe(false);
    await expect(probeWebOrigin(signal)).resolves.toBe(false);
    await expect(probeWebOrigin(signal)).resolves.toBe(false);
  });
});
