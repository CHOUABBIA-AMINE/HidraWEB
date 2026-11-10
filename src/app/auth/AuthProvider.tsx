import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { AuthContext, type AuthSession, type AuthSessionSource, type AuthStatus } from '@/app/auth/authContext';
import type { HidraPrincipalView, HidraSessionResult } from '@/app/auth/authenticationGateway';
import { bearerAuthorizationHeader } from '@/app/auth/authEncoding';
import { HIDRA_AUTH_UNAUTHORIZED_EVENT } from '@/app/auth/authEvents';
import { beginOidcAuthorization, completeOidcAuthorization } from '@/app/auth/oidcClient';
import { registerAuthorizationHeaderFactory, type AuthorizationRenewal } from '@/app/auth/authorizationHeaderRegistry';
import { runtimeConfig, type HidraCredentialProvider } from '@/app/bootstrap/runtimeConfig';
import { permissionEndpoints } from '@/features/permissions/api/permissionEndpoints';

const TOKEN_EXPIRY_SKEW_MS = 30_000;
const HIDRA_QUERY_ROOT = ['hidra'] as const;

async function loadAuthenticationGateway() {
  return (await import('@/app/auth/authenticationGateway')).authenticationGateway;
}

type RenewableSession = HidraSessionResult & {
  expiresAt: number;
  refresh: NonNullable<HidraSessionResult['refresh']>;
};

function isRenewable(result: HidraSessionResult): result is RenewableSession {
  return result.authenticationType === 'LOCAL' && result.expiresAt !== undefined && result.refresh !== undefined;
}

function renewalTime(expiresAt: number): number {
  return expiresAt - Math.min(TOKEN_EXPIRY_SKEW_MS, (expiresAt - Date.now()) / 4);
}

function sessionView(result: HidraSessionResult, source: 'basic' | 'jwt', principal: HidraPrincipalView): AuthSession {
  return {
    principalLabel: principalLabel(principal, result.authenticationType),
    source,
    sessionId: result.sessionId,
    expiresAt: result.expiresAt,
    authenticationType: result.authenticationType,
    identityProviderId: result.identityProviderId,
    principal,
  };
}

function principalLabel(principal: HidraPrincipalView, authenticationType: string): string {
  return (
    principal.displayName?.trim() ||
    principal.username?.trim() ||
    principal.userId?.trim() ||
    principal.authenticationName?.trim() ||
    authenticationType
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>(
    runtimeConfig.authMode === 'disabled' ? 'authenticated' : 'anonymous',
  );
  const [session, setSession] = useState<AuthSession | undefined>(
    runtimeConfig.authMode === 'disabled'
      ? { principalLabel: 'Security disabled', source: 'disabled' }
      : undefined,
  );
  const [error, setError] = useState<string>();
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const logoutUri = useRef<string | undefined>(undefined);
  const epoch = useRef(0);
  const bearer = useRef<string | undefined>(undefined);
  const localSession = useRef<{
    credentials: RenewableSession;
    principal: HidraPrincipalView;
    renewAt: number;
  } | undefined>(undefined);
  const pendingRenewal = useRef<Promise<boolean> | undefined>(undefined);

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current);
      expiryTimer.current = undefined;
    }
  }, []);

  const discardCredentials = useCallback(() => {
    clearExpiryTimer();
    epoch.current++;
    bearer.current = undefined;
    localSession.current = undefined;
    pendingRenewal.current = undefined;
    registerAuthorizationHeaderFactory(() => undefined);
    logoutUri.current = undefined;
  }, [clearExpiryTimer]);

  const clearSession = useCallback(() => {
    discardCredentials();
    queryClient.removeQueries({ queryKey: HIDRA_QUERY_ROOT });
    queryClient.getMutationCache().clear();
    setSession(undefined);
    setStatus('anonymous');
  }, [discardCredentials, queryClient]);

  const signOut = useCallback(() => {
    const externalLogoutUri = logoutUri.current;
    const proof = localSession.current?.credentials.refresh.token;
    setError(undefined);
    if (runtimeConfig.authMode === 'disabled') {
      setSession({ principalLabel: 'Security disabled', source: 'disabled' });
      setStatus('authenticated');
      return;
    }
    clearSession();
    if (proof) {
      // The pinned API accepts a known proof from the family even after it has rotated.
      const signedOutEpoch = epoch.current;
      void loadAuthenticationGateway().then(gateway => gateway.logoutLocal(proof)).catch(() => {
        if (epoch.current === signedOutEpoch) {
          setError('Signed out locally. HidraAPI logout could not be confirmed.');
        }
      });
    }
    if (externalLogoutUri) window.location.assign(externalLogoutUri);
  }, [clearSession]);

  useEffect(() => {
    if (runtimeConfig.authMode === 'disabled') registerAuthorizationHeaderFactory(() => undefined);
    const unauthorizedListener = () => {
      clearSession();
      setError('The authenticated session is no longer valid. Sign in again.');
    };
    window.addEventListener(HIDRA_AUTH_UNAUTHORIZED_EVENT, unauthorizedListener);
    return () => {
      window.removeEventListener(HIDRA_AUTH_UNAUTHORIZED_EVENT, unauthorizedListener);
      discardCredentials();
    };
  }, [clearSession, discardCredentials]);

  const renewLocal = useCallback(function renew(): Promise<boolean> | undefined {
    if (pendingRenewal.current) return pendingRenewal.current;
    const previous = localSession.current;
    if (!previous) return undefined;
    const started = epoch.current;
    const operation = (async () => {
      try {
        if (previous.credentials.refresh.expiresAt <= Date.now()) {
          throw new Error('LOCAL renewal deadline elapsed.');
        }
        const authenticationGateway = await loadAuthenticationGateway();
        if (epoch.current !== started) return false;
        const next = await authenticationGateway.refreshLocal(previous.credentials.refresh.token);
        if (epoch.current !== started) return false;
        if (!isRenewable(next) || next.expiresAt <= Date.now()
            || next.refresh.expiresAt !== previous.credentials.refresh.expiresAt
            || next.refresh.token === previous.credentials.refresh.token
            || next.accessToken === previous.credentials.accessToken) {
          throw new Error('Invalid LOCAL renewal response.');
        }
        const principal = await authenticationGateway.loadCurrentPrincipal(next.accessToken);
        if (epoch.current !== started) return false;
        if (!principal.userId || principal.userId !== previous.principal.userId
            || principal.userId !== next.principal.userId || next.expiresAt <= Date.now()) {
          throw new Error('LOCAL session identity changed during renewal.');
        }
        const previousPermissions = new Set(previous.principal.permissions);
        if (previousPermissions.size !== new Set(principal.permissions).size
            || principal.permissions.some(permission => !previousPermissions.has(permission))) {
          queryClient.removeQueries({ queryKey: HIDRA_QUERY_ROOT });
          queryClient.getMutationCache().clear();
        }

        const renewAt = renewalTime(next.expiresAt);
        bearer.current = bearerAuthorizationHeader(next.accessToken);
        localSession.current = { credentials: next, principal, renewAt };
        queryClient.setQueryData(['hidra', 'identity', 'me', 'permissions'], [...principal.permissions]);
        setSession(sessionView(next, 'basic', principal));
        clearExpiryTimer();
        expiryTimer.current = setTimeout(() => { void renew(); }, Math.max(0, renewAt - Date.now()));
        return true;
      } catch (cause) {
        if (epoch.current === started) {
          const throttled = normalizeHidraApiError(cause).status === 429;
          clearSession();
          setError(throttled
            ? 'Session renewal is temporarily unavailable. Sign in again.'
            : 'The LOCAL session could not be renewed. Sign in again.');
        }
        return false;
      }
    })();
    pendingRenewal.current = operation;
    void operation.finally(() => {
      if (pendingRenewal.current === operation) pendingRenewal.current = undefined;
    });
    return operation;
  }, [clearExpiryTimer, clearSession, queryClient]);

  const commitHidraSession = useCallback(
    async (result: HidraSessionResult, source: Exclude<AuthSessionSource, 'disabled'>, started: number) => {
      if (epoch.current !== started) return;
      const renewable = source === 'basic' && isRenewable(result);
      const now = Date.now();
      if (result.expiresAt && result.expiresAt <= now + (renewable ? 0 : TOKEN_EXPIRY_SKEW_MS)) {
        throw new Error('The Hidra session is already expired or too close to expiry.');
      }

      const renewal: AuthorizationRenewal | undefined = renewable ? {
        pending: () => pendingRenewal.current,
        prepareRead: () => {
          if (pendingRenewal.current) return pendingRenewal.current;
          const active = localSession.current;
          return active && Date.now() >= active.renewAt ? renewLocal() : undefined;
        },
        recoverRead: (sentAuthorization) => {
          if (pendingRenewal.current) return pendingRenewal.current;
          const active = localSession.current;
          if (!active) return undefined;
          if (sentAuthorization !== bearer.current) return Promise.resolve(true);
          return Date.now() >= active.renewAt ? renewLocal() : undefined;
        },
      } : undefined;
      bearer.current = bearerAuthorizationHeader(result.accessToken);
      registerAuthorizationHeaderFactory(() => bearer.current, renewal);

      const authenticationGateway = await loadAuthenticationGateway();
      if (epoch.current !== started) return;
      const [principal] = await Promise.all([
        authenticationGateway.loadCurrentPrincipal(),
        hidraHttpClient({ method: 'GET', url: permissionEndpoints.catalog }),
        hidraHttpClient({ method: 'GET', url: permissionEndpoints.routes }),
      ]);
      if (epoch.current !== started) return;
      if (renewable && (!principal.userId || principal.userId !== result.principal.userId)) {
        throw new Error('The LOCAL session identity could not be verified.');
      }
      if (result.expiresAt && result.expiresAt <= Date.now()) {
        throw new Error('The Hidra session expired during sign-in.');
      }
      setSession(sessionView(result, source, principal));
      setStatus('authenticated');

      if (renewable) {
        const renewAt = renewalTime(result.expiresAt);
        localSession.current = { credentials: result, principal, renewAt };
        expiryTimer.current = setTimeout(() => { void renewLocal(); }, Math.max(0, renewAt - Date.now()));
      } else if (result.expiresAt) {
        expiryTimer.current = setTimeout(() => {
          clearSession();
          setError('The Hidra session expired. Sign in again.');
        }, Math.max(0, result.expiresAt - Date.now() - TOKEN_EXPIRY_SKEW_MS));
      }
    },
    [clearSession, renewLocal],
  );

  const authenticateCredentials = useCallback(
    async (provider: HidraCredentialProvider, principal: string, credentials: string) => {
      if ((runtimeConfig.authMode !== 'basic' && runtimeConfig.authMode !== 'multi') ||
          !runtimeConfig.enabledAuthProviders.includes(provider)) {
        throw new Error(`Authentication provider ${provider} is not enabled for this HidraWeb runtime.`);
      }

      clearSession();
      const started = epoch.current;
      setError(undefined);
      setStatus('checking');
      try {
        const authenticationGateway = await loadAuthenticationGateway();
        if (epoch.current !== started) return;
        const input = { principal, credentials };
        const result = provider === 'LOCAL'
          ? await authenticationGateway.loginLocal(input)
          : await authenticationGateway.loginDirectory(provider, input);
        await commitHidraSession(result, 'basic', started);
      } catch (cause) {
        if (epoch.current !== started) throw cause;
        clearSession();
        const message = cause instanceof Error ? cause.message : `${provider} sign-in failed.`;
        setError(message);
        throw cause;
      }
    },
    [clearSession, commitHidraSession],
  );

  const beginOidcSignIn = useCallback(async (returnTo?: string) => {
    if (!runtimeConfig.enabledAuthProviders.includes('OIDC')) throw new Error('OIDC is not enabled for this HidraWeb runtime.');
    setError(undefined);
    setStatus('checking');
    try {
      await beginOidcAuthorization(returnTo);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to start enterprise sign-in.';
      setError(message);
      setStatus('anonymous');
      throw cause;
    }
  }, []);

  const completeOidcSignIn = useCallback(
    async (search: string) => {
      if (!runtimeConfig.enabledAuthProviders.includes('OIDC')) throw new Error('OIDC is not enabled for this HidraWeb runtime.');
      clearSession();
      const started = epoch.current;
      setStatus('checking');
      setError(undefined);
      try {
        const externalResult = await completeOidcAuthorization(search);
        const authenticationGateway = await loadAuthenticationGateway();
        if (epoch.current !== started) return externalResult.returnTo;
        const hidraSession = await authenticationGateway.completeOidcLogin(externalResult.accessToken);
        await commitHidraSession(hidraSession, 'jwt', started);
        if (epoch.current === started) logoutUri.current = externalResult.logoutUri;
        return externalResult.returnTo;
      } catch (cause) {
        if (epoch.current !== started) throw cause;
        clearSession();
        const message = cause instanceof Error ? cause.message : 'Enterprise sign-in failed.';
        setError(message);
        throw cause;
      }
    },
    [clearSession, commitHidraSession],
  );

  const value = useMemo(
    () => ({
      mode: runtimeConfig.authMode,
      credentialProvider: runtimeConfig.credentialProvider,
      enabledAuthProviders: runtimeConfig.enabledAuthProviders,
      status,
      session,
      error,
      authenticateCredentials,
      beginOidcSignIn,
      completeOidcSignIn,
      signOut,
    }),
    [authenticateCredentials, beginOidcSignIn, completeOidcSignIn, error, session, signOut, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
