import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { AuthContext, type AuthSession, type AuthStatus } from '@/app/auth/authContext';
import { basicAuthorizationHeader, bearerAuthorizationHeader, jwtPrincipalLabel } from '@/app/auth/authEncoding';
import { HIDRA_AUTH_UNAUTHORIZED_EVENT } from '@/app/auth/authEvents';
import { registerAuthorizationHeaderFactory } from '@/app/auth/authorizationHeaderRegistry';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { permissionEndpoints } from '@/features/permissions/api/permissionEndpoints';

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

  const signOut = useCallback(() => {
    registerHeader(undefined);
    setError(undefined);
    if (runtimeConfig.authMode === 'disabled') {
      setSession({ principalLabel: 'Security disabled', source: 'disabled' });
      setStatus('authenticated');
      return;
    }
    setSession(undefined);
    setStatus('anonymous');
  }, []);

  useEffect(() => {
    if (runtimeConfig.authMode === 'disabled') {
      registerHeader(undefined);
    }

    const unauthorizedListener = () => signOut();
    window.addEventListener(HIDRA_AUTH_UNAUTHORIZED_EVENT, unauthorizedListener);
    return () => window.removeEventListener(HIDRA_AUTH_UNAUTHORIZED_EVENT, unauthorizedListener);
  }, [signOut]);

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
      registerHeader(undefined);
      setSession(undefined);
      setStatus('anonymous');
      setError(normalized.message);
      throw normalized;
    }
  }, []);

  const authenticateBasic = useCallback(
    async (username: string, password: string) => {
      if (runtimeConfig.authMode !== 'basic') {
        throw new Error('Basic authentication is not enabled for this HidraWeb runtime.');
      }
      const normalizedUsername = username.trim();
      if (!normalizedUsername || !password) {
        throw new Error('Username and password are required.');
      }
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
      if (!normalizedToken) {
        throw new Error('A JWT access token is required.');
      }
      await verifyAndCommit(bearerAuthorizationHeader(normalizedToken), {
        principalLabel: jwtPrincipalLabel(normalizedToken),
        source: 'jwt',
      });
    },
    [verifyAndCommit],
  );

  const value = useMemo(
    () => ({
      mode: runtimeConfig.authMode,
      status,
      session,
      error,
      authenticateBasic,
      authenticateJwt,
      signOut,
    }),
    [authenticateBasic, authenticateJwt, error, session, signOut, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
