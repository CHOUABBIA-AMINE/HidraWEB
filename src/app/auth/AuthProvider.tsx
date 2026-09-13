import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { AuthContext, type AuthSession, type AuthStatus } from '@/app/auth/authContext';
import { basicAuthorizationHeader, bearerAuthorizationHeader, jwtPrincipalLabel } from '@/app/auth/authEncoding';
import { HIDRA_AUTH_UNAUTHORIZED_EVENT } from '@/app/auth/authEvents';
import { beginOidcAuthorization, completeOidcAuthorization } from '@/app/auth/oidcClient';
import { registerAuthorizationHeaderFactory } from '@/app/auth/authorizationHeaderRegistry';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { permissionEndpoints } from '@/features/permissions/api/permissionEndpoints';

const TOKEN_EXPIRY_SKEW_MS = 30_000;

function registerHeader(header?: string): void {
  registerAuthorizationHeaderFactory(() => header);
}

export function AuthProvider({ children }: PropsWithChildren) {
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
    setSession(undefined);
    setStatus('anonymous');
  }, [clearExpiryTimer]);

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

  const verifyAndCommit = useCallback(async (header: string, nextSession: AuthSession) => {
    registerHeader(header);
    setError(undefined);
    setStatus('checking');
    try {
      await hidraHttpClient({ method: 'GET', url: permissionEndpoints.routes });
      setSession(nextSession);
      setStatus('authenticated');
    } catch (cause) {
      const normalized = normalizeHidraApiError(cause);
      clearSession();
      setError(normalized.message);
      throw normalized;
    }
  }, [clearSession]);

  const authenticateBasic = useCallback(
    async (username: string, password: string) => {
      if (runtimeConfig.authMode !== 'basic') {
        throw new Error('Basic authentication is not enabled for this HidraWeb runtime.');
      }
      const normalizedUsername = username.trim();
      if (!normalizedUsername || !password) throw new Error('Username and password are required.');
      await verifyAndCommit(basicAuthorizationHeader(normalizedUsername, password), {
        principalLabel: normalizedUsername,
        source: 'basic',
      });
    },
    [verifyAndCommit],
  );

  const authenticateJwt = useCallback(
    async (accessToken: string) => {
      if (runtimeConfig.authMode !== 'jwt') {
        throw new Error('JWT authentication is not enabled for this HidraWeb runtime.');
      }
      const normalizedToken = accessToken.trim();
      if (!normalizedToken) throw new Error('A JWT access token is required.');
      await verifyAndCommit(bearerAuthorizationHeader(normalizedToken), {
        principalLabel: jwtPrincipalLabel(normalizedToken),
        source: 'jwt',
      });
    },
    [verifyAndCommit],
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

  const completeOidcSignIn = useCallback(async (search: string) => {
    if (runtimeConfig.authMode !== 'jwt') throw new Error('OIDC is available only in JWT mode.');
    setStatus('checking');
    setError(undefined);
    try {
      const result = await completeOidcAuthorization(search);
      if (result.expiresAt && result.expiresAt <= Date.now() + TOKEN_EXPIRY_SKEW_MS) {
        throw new Error('The OIDC access token is already expired or too close to expiry.');
      }
      await verifyAndCommit(bearerAuthorizationHeader(result.accessToken), {
        principalLabel: jwtPrincipalLabel(result.accessToken),
        source: 'jwt',
      });
      logoutUri.current = result.logoutUri;
      clearExpiryTimer();
      if (result.expiresAt) {
        expiryTimer.current = setTimeout(() => {
          clearSession();
          setError('The enterprise access token expired. Sign in again.');
        }, Math.max(0, result.expiresAt - Date.now() - TOKEN_EXPIRY_SKEW_MS));
      }
      return result.returnTo;
    } catch (cause) {
      clearSession();
      const message = cause instanceof Error ? cause.message : 'Enterprise sign-in failed.';
      setError(message);
      throw cause;
    }
  }, [clearExpiryTimer, clearSession, verifyAndCommit]);

  const value = useMemo(
    () => ({
      mode: runtimeConfig.authMode,
      status,
      session,
      error,
      authenticateBasic,
      authenticateJwt,
      beginOidcSignIn,
      completeOidcSignIn,
      signOut,
    }),
    [authenticateBasic, authenticateJwt, beginOidcSignIn, completeOidcSignIn, error, session, signOut, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
