import axios, { type AxiosRequestConfig } from 'axios';

import {
  HIDRA_CORRELATION_ID_HEADER,
  HIDRA_REQUEST_ID_HEADER,
} from '@/api/client/diagnosticHeaders';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type {
  AuthenticationLoginRequest,
  AuthenticationLoginResponse,
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
  userId?: string;
  username?: string;
  displayName?: string;
  roles: readonly string[];
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
}

export interface AuthenticationGateway {
  loginLocal(credentials: AuthenticationCredentials): Promise<HidraSessionResult>;
  loginDirectory(
    provider: Exclude<CredentialProviderType, 'LOCAL'>,
    credentials: AuthenticationCredentials,
  ): Promise<HidraSessionResult>;
  completeOidcLogin(externalAccessToken: string): Promise<HidraSessionResult>;
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

  return {
    accessToken,
    expiresAt: parseExpiry(response.expiresAt),
    sessionId: response.sessionId,
    tokenType: response.tokenType,
    authenticationType,
    identityProviderId: response.identityProviderId,
    principal: {
      userId: response.userId,
      username: response.username,
      displayName: response.displayName,
      roles: response.roles ?? [],
      permissions: response.permissions ?? [],
    },
  };
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
};
