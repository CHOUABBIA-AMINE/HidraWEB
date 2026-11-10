import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@/app/auth/AuthProvider';
import { authenticationGateway, type HidraSessionResult } from '@/app/auth/authenticationGateway';
import { currentAuthorization, resolveAuthorizationHeader } from '@/app/auth/authorizationHeaderRegistry';
import { useAuth } from '@/app/auth/useAuth';

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: async () => ({}) }));

const principal = {
  userId: 'synthetic-user',
  authenticationType: 'IDENTITY_USER',
  authenticationAuthorities: [],
  permissions: ['telemetry:read'],
};
const start = Date.parse('2026-11-10T07:00:00Z');
const initial: HidraSessionResult = {
  accessToken: 'synthetic-initial',
  expiresAt: start + 60_000,
  authenticationType: 'LOCAL',
  principal,
  refresh: { token: 'a'.repeat(80), expiresAt: start + 300_000 },
};
const rotated: HidraSessionResult = {
  ...initial,
  accessToken: 'synthetic-replacement',
  expiresAt: start + 105_000,
  refresh: { token: 'b'.repeat(80), expiresAt: start + 300_000 },
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => { resolve = complete; });
  return { promise, resolve };
}

async function signedIn() {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}><AuthProvider>{children}</AuthProvider></QueryClientProvider>
  );
  const { result } = renderHook(useAuth, { wrapper });
  await act(() => result.current.authenticateCredentials('LOCAL', 'synthetic', 'synthetic-password'));
  expect(result.current.status).toBe('authenticated');
  return { result, queryClient };
}

describe('LOCAL browser session lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(start);
    vi.spyOn(authenticationGateway, 'loginLocal').mockResolvedValue(initial);
    vi.spyOn(authenticationGateway, 'loadCurrentPrincipal').mockResolvedValue(principal);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('coalesces renewal and publishes the bearer only after fresh identity and permissions', async () => {
    const verification = deferred<typeof principal>();
    const refresh = vi.spyOn(authenticationGateway, 'refreshLocal').mockResolvedValue(rotated);
    const { result, queryClient } = await signedIn();
    vi.mocked(authenticationGateway.loadCurrentPrincipal).mockReturnValueOnce(verification.promise);
    const renewal = currentAuthorization().renewal!;
    await act(async () => { await vi.advanceTimersByTimeAsync(45_000); });
    const pending = renewal.prepareRead();
    expect(pending).toBe(renewal.recoverRead('Bearer synthetic-initial'));
    expect(refresh).toHaveBeenCalledExactlyOnceWith(initial.refresh?.token);
    expect(resolveAuthorizationHeader()).toBe('Bearer synthetic-initial');
    await act(async () => {
      verification.resolve({ ...principal, permissions: [] });
      await pending;
    });
    expect(authenticationGateway.loadCurrentPrincipal).toHaveBeenLastCalledWith(rotated.accessToken);
    expect(resolveAuthorizationHeader()).toBe('Bearer synthetic-replacement');
    expect(result.current.session?.principal?.permissions).toEqual([]);
    expect(queryClient.getQueryData(['hidra', 'identity', 'me', 'permissions'])).toEqual([]);
  });

  it('discards a late refresh after sign-out and reports unconfirmed remote revocation', async () => {
    const inflight = deferred<HidraSessionResult>();
    vi.spyOn(authenticationGateway, 'refreshLocal').mockReturnValue(inflight.promise);
    const logout = vi.spyOn(authenticationGateway, 'logoutLocal').mockRejectedValue(new Error('transport failed'));
    const { result, queryClient } = await signedIn();
    queryClient.setQueryData(['hidra', 'test'], { protected: true });
    await act(async () => { await vi.advanceTimersByTimeAsync(45_000); });
    const pending = currentAuthorization().renewal?.pending();
    await act(async () => { result.current.signOut(); });
    expect(logout).toHaveBeenCalledExactlyOnceWith(initial.refresh?.token);
    expect(queryClient.getQueryData(['hidra', 'test'])).toBeUndefined();
    expect(result.current.error).toMatch(/could not be confirmed/);
    await act(async () => {
      inflight.resolve(rotated);
      await pending;
    });
    expect(result.current.status).toBe('anonymous');
    expect(resolveAuthorizationHeader()).toBeUndefined();
    expect(authenticationGateway.loadCurrentPrincipal).toHaveBeenCalledTimes(1);
  });

  it('invalidates an ambiguous refresh without retrying its proof', async () => {
    const refresh = vi.spyOn(authenticationGateway, 'refreshLocal').mockRejectedValue(new Error('timeout'));
    const { result } = await signedIn();
    await act(async () => { await vi.advanceTimersByTimeAsync(200_000); });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('anonymous');
    expect(resolveAuthorizationHeader()).toBeUndefined();
  });
});
