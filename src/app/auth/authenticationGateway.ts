import axios, { type AxiosRequestConfig } from 'axios';

import {
  HIDRA_CORRELATION_ID_HEADER,
  HIDRA_REQUEST_ID_HEADER,
} from '@/api/client/diagnosticHeaders';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { HidraApiError, normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type {
  AuthenticationLoginRequest,
  AuthenticationLoginResponse,
  PrincipalView,
  RefreshTokenRequest,
} from '@/api/generated/identity-organization/model';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';

export type ProviderType =
  | 'LOCAL'
  | 'LDAP'
  | 'ACTIVE_DIRECTORY'
  | 'OIDC'
  | 'OAUTH2'
  | 'SAML2'
  | 'KEYCLOAK'
  | 'AZURE_AD'
  | 'OKTA';

export type CredentialProviderType = 'LOCAL' | 'LDAP' | 'ACTIVE_DIRECTORY';

export interface AuthenticationCredentials {
  principal: string;
  credentials: string;
}

export interface HidraPrincipalView {
  authenticationName?: string;
  authenticationType?: string;
  userId?: string;
  username?: string;
  displayName?: string;
  employeeReferenceId?: string;
  authenticationAuthorities: readonly string[];
  permissions: readonly string[];
}

export interface HidraSessionResult {
  accessToken: string;
  expiresAt?: number;
  sessionId?: string;
  tokenType?: string;
  authenticationType: ProviderType;
  identityProviderId?: string;
  principal: HidraPrincipalView;
  refresh?: { token: string; expiresAt: number };
}

export interface AuthenticationGateway {
  loginLocal(credentials: AuthenticationCredentials): Promise<HidraSessionResult>;
  loginDirectory(
    provider: Exclude<CredentialProviderType, 'LOCAL'>,
    credentials: AuthenticationCredentials,
  ): Promise<HidraSessionResult>;
  completeOidcLogin(externalAccessToken: string): Promise<HidraSessionResult>;
  loadCurrentPrincipal(accessToken?: string): Promise<HidraPrincipalView>;
  refreshLocal(refreshToken: string): Promise<HidraSessionResult>;
  logoutLocal(refreshToken: string): Promise<void>;
}

const authenticationExchangeClient = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  headers: { Accept: 'application/json' },
});

function requestConfig(authorization?: string): AxiosRequestConfig {
  return {
    headers: {
      [HIDRA_CORRELATION_ID_HEADER]: globalThis.crypto.randomUUID(),
      [HIDRA_REQUEST_ID_HEADER]: globalThis.crypto.randomUUID(),
      ...(authorization ? { Authorization: authorization } : {}),
    },
  };
}

function parseExpiry(expiresAt?: string): number | undefined {
  if (!expiresAt) return undefined;
  const parsed = Date.parse(expiresAt);
  if (!Number.isFinite(parsed)) throw new Error('HidraAPI returned an invalid authentication expiry.');
  return parsed;
}

export function normalizeAuthenticationResponse(
  response: AuthenticationLoginResponse,
  expectedType?: ProviderType,
): HidraSessionResult {
  const accessToken = response.accessToken?.trim();
  if (!accessToken) throw new Error('HidraAPI returned an authentication response without an access token.');

  const authenticationType = response.authenticationType as ProviderType | undefined;
  if (!authenticationType) {
    throw new Error('HidraAPI returned an authentication response without an authentication type.');
  }
  if (expectedType && authenticationType !== expectedType) {
    throw new Error(`HidraAPI authenticated with ${authenticationType} instead of ${expectedType}.`);
  }

  const result: HidraSessionResult = {
    accessToken,
    expiresAt: parseExpiry(response.expiresAt),
    sessionId: response.sessionId,
    tokenType: response.tokenType,
    authenticationType,
    identityProviderId: response.identityProviderId,
    principal: {
      authenticationName: response.username,
      authenticationType,
      userId: response.userId,
      username: response.username,
      displayName: response.displayName,
      authenticationAuthorities: response.roles ?? [],
      permissions: response.permissions ?? [],
    },
  };
  const refreshExpiresAt = response.refreshExpiresAt && Date.parse(response.refreshExpiresAt);
  if (authenticationType === 'LOCAL' && typeof response.refreshToken === 'string'
      && response.refreshToken.length === 80 && !/\s/.test(response.refreshToken)
      && typeof refreshExpiresAt === 'number' && refreshExpiresAt > Date.now()) {
    result.refresh = { token: response.refreshToken, expiresAt: refreshExpiresAt };
  }
  return result;
}

export function normalizeCurrentPrincipal(
  response: PrincipalView,
  effectivePermissions: readonly string[],
): HidraPrincipalView {
  return {
    authenticationName: response.authenticationName,
    authenticationType: response.authenticationType,
    userId: response.userId,
    username: response.username,
    displayName: response.displayName,
    employeeReferenceId: response.employeeReferenceId,
    authenticationAuthorities: response.authenticationAuthorities ?? [],
    permissions: [...effectivePermissions],
  };
}

async function loadCurrentPrincipal(accessToken?: string): Promise<HidraPrincipalView> {
  const get = async <T,>(url: string): Promise<T> => {
    if (accessToken === undefined) return hidraHttpClient<T>({ method: 'GET', url });
    const { data } = await authenticationExchangeClient.get<T>(url, {
      ...requestConfig(`Bearer ${accessToken}`), timeout: 15_000,
    });
    return data;
  };
  const [principal, permissions] = await Promise.all([
    get<PrincipalView>('/api/v1/identity/me'),
    get<string[]>('/api/v1/identity/me/permissions'),
  ]);
  return normalizeCurrentPrincipal(principal, permissions);
}

async function exchangeLocalProof<T>(operation: 'refresh' | 'logout', refreshToken: string): Promise<T> {
  const request: RefreshTokenRequest = { refreshToken };
  try {
    const response = await authenticationExchangeClient.post<T>(
      `/api/v1/identity/authentication/${operation}`, request, { ...requestConfig(), timeout: 15_000 },
    );
    if (response.status !== (operation === 'refresh' ? 200 : 204)) {
      throw new HidraApiError('Unexpected LOCAL session response.', { status: response.status });
    }
    return response.data;
  } catch (cause) {
    const { status } = normalizeHidraApiError(cause);
    throw new HidraApiError('The LOCAL session request failed.', { status });
  }
}

async function postAuthentication<T>(
  url: string,
  data?: unknown,
  authorization?: string,
): Promise<T> {
  try {
    const response = await authenticationExchangeClient.post<T>(url, data, requestConfig(authorization));
    return response.data;
  } catch (cause) {
    throw normalizeHidraApiError(cause);
  }
}

async function loginWithCredentials(
  providerType: CredentialProviderType,
  input: AuthenticationCredentials,
): Promise<HidraSessionResult> {
  const principal = input.principal.trim();
  if (!principal || !input.credentials) throw new Error('Principal and credentials are required.');

  const request: AuthenticationLoginRequest = {
    providerType,
    principal,
    credentials: input.credentials,
  };
  const response = await postAuthentication<AuthenticationLoginResponse>(
    '/api/v1/identity/authentication/login',
    request,
  );
  return normalizeAuthenticationResponse(response, providerType);
}

export const authenticationGateway: AuthenticationGateway = {
  loginLocal(credentials) {
    return loginWithCredentials('LOCAL', credentials);
  },

  loginDirectory(provider, credentials) {
    return loginWithCredentials(provider, credentials);
  },

  async completeOidcLogin(externalAccessToken) {
    const token = externalAccessToken.trim();
    if (!token) throw new Error('An external OIDC access token is required.');

    const response = await postAuthentication<AuthenticationLoginResponse>(
      '/api/v1/identity/authentication/oidc/complete',
      undefined,
      `Bearer ${token}`,
    );
    return normalizeAuthenticationResponse(response, 'OIDC');
  },

  loadCurrentPrincipal,

  async refreshLocal(refreshToken) {
    const response = await exchangeLocalProof<AuthenticationLoginResponse>('refresh', refreshToken);
    return normalizeAuthenticationResponse(response, 'LOCAL');
  },

  async logoutLocal(refreshToken) {
    await exchangeLocalProof<void>('logout', refreshToken);
  },
};
