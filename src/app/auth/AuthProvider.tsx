import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { AuthContext, type AuthSession, type AuthSessionSource, type AuthStatus } from '@/app/auth/authContext';
import { authenticationGateway, type HidraSessionResult } from '@/app/auth/authenticationGateway';
import { bearerAuthorizationHeader } from '@/app/auth/authEncoding';
import { HIDRA_AUTH_UNAUTHORIZED_EVENT } from '@/app/auth/authEvents';
import { beginOidcAuthorization, completeOidcAuthorization } from '@/app/auth/oidcClient';
import { registerAuthorizationHeaderFactory } from '@/app/auth/authorizationHeaderRegistry';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { permissionEndpoints } from '@/features/permissions/api/permissionEndpoints';

const TOKEN_EXPIRY_SKEW_MS = 30_000;
const HIDRA_QUERY_ROOT = ['hidra'] as const;

function registerHeader(header?: string): void {
  registerAuthorizationHeaderFactory(() => header);
}

function principalLabel(result: HidraSessionResult): string {
  return (
    result.principal.displayName?.trim() ||
    result.principal.username?.trim() ||
    result.principal.userId?.trim() ||
    result.authenticationType
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

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current);
      expiryTimer.current = undefined;
    }
  }, []);

  const clearSession = useCallback(() => {
    clearExpiryTimer();
    registerHeader(undefined);
    logoutUri.current = undefined;
    queryClient.removeQueries({ queryKey: HIDRA_QUERY_ROOT });
    setSession(undefined);
    setStatus('anonymous');
  }, [clearExpiryTimer, queryClient]);

  const signOut = useCallback(() => {
    const externalLogoutUri = logoutUri.current;
    setError(undefined);
    if (runtimeConfig.authMode === 'disabled') {
      setSession({ principalLabel: 'Security disabled', source: 'disabled' });
      setStatus('authenticated');
      return;
    }
    clearSession();
    if (externalLogoutUri) window.location.assign(externalLogoutUri);
  }, [clearSession]);

  useEffect(() => {
    if (runtimeConfig.authMode === 'disabled') registerHeader(undefined);
    const unauthorizedListener = () => {
      clearSession();
      setError('The authenticated session is no longer valid. Sign in again.');
    };
    window.addEventListener(HIDRA_AUTH_UNAUTHORIZED_EVENT, unauthorizedListener);
    return () => {
      window.removeEventListener(HIDRA_AUTH_UNAUTHORIZED_EVENT, unauthorizedListener);
      clearExpiryTimer();
    };
  }, [clearExpiryTimer, clearSession]);

  const commitHidraSession = useCallback(
    async (result: HidraSessionResult, source: Exclude<AuthSessionSource, 'disabled'>) => {
      if (result.expiresAt && result.expiresAt <= Date.now() + TOKEN_EXPIRY_SKEW_MS) {
        throw new Error('The Hidra session is already expired or too close to expiry.');
      }

      clearExpiryTimer();
      queryClient.removeQueries({ queryKey: HIDRA_QUERY_ROOT });
      registerHeader(bearerAuthorizationHeader(result.accessToken));
      setError(undefined);
      setStatus('checking');

      try {
        await Promise.all([
          hidraHttpClient({ method: 'GET', url: permissionEndpoints.catalog }),
          hidraHttpClient({ method: 'GET', url: permissionEndpoints.routes }),
          hidraHttpClient({ method: 'GET', url: permissionEndpoints.effective }),
        ]);

        setSession({
          principalLabel: principalLabel(result),
          source,
          sessionId: result.sessionId,
          expiresAt: result.expiresAt,
          authenticationType: result.authenticationType,
          identityProviderId: result.identityProviderId,
          principal: result.principal,
        });
        setStatus('authenticated');

        if (result.expiresAt) {
          expiryTimer.current = setTimeout(() => {
            clearSession();
            setError('The Hidra session expired. Sign in again.');
          }, Math.max(0, result.expiresAt - Date.now() - TOKEN_EXPIRY_SKEW_MS));
        }
      } catch (cause) {
        const normalized = normalizeHidraApiError(cause);
        clearSession();
        setError(normalized.message);
        throw normalized;
      }
    },
    [clearExpiryTimer, clearSession, queryClient],
  );

  const authenticateBasic = useCallback(
    async (username: string, password: string) => {
      if (runtimeConfig.authMode !== 'basic') {
        throw new Error('Local authentication is not enabled for this HidraWeb runtime.');
      }
      setError(undefined);
      setStatus('checking');
      try {
        const result = await authenticationGateway.loginLocal({
          principal: username,
          credentials: password,
        });
        await commitHidraSession(result, 'basic');
      } catch (cause) {
        clearSession();
        const message = cause instanceof Error ? cause.message : 'Local sign-in failed.';
        setError(message);
        throw cause;
      }
    },
    [clearSession, commitHidraSession],
  );

  const beginOidcSignIn = useCallback(async (returnTo?: string) => {
    if (runtimeConfig.authMode !== 'jwt') throw new Error('OIDC is available only in JWT mode.');
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
      if (runtimeConfig.authMode !== 'jwt') throw new Error('OIDC is available only in JWT mode.');
      setStatus('checking');
      setError(undefined);
      try {
        const externalResult = await completeOidcAuthorization(search);
        const hidraSession = await authenticationGateway.completeOidcLogin(externalResult.accessToken);
        await commitHidraSession(hidraSession, 'jwt');
        logoutUri.current = externalResult.logoutUri;
        return externalResult.returnTo;
      } catch (cause) {
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
      status,
      session,
      error,
      authenticateBasic,
      beginOidcSignIn,
      completeOidcSignIn,
      signOut,
    }),
    [authenticateBasic, beginOidcSignIn, completeOidcSignIn, error, session, signOut, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
