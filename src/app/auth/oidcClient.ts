import { z } from 'zod';

import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';

const OIDC_TRANSACTION_KEY = 'hidra.oidc.transaction';
const OIDC_TRANSACTION_MAX_AGE_MS = 10 * 60 * 1000;

const oidcContractSchema = z.object({
  authenticationMode: z.string(),
  authorizationFlow: z.string(),
  issuerUri: z.string().url().nullable(),
  clientId: z.string().min(1).nullable(),
  audience: z.string().nullable(),
  scopes: z.array(z.string()),
  logoutUri: z.string().url().nullable(),
  browserTokenStorage: z.string(),
  repositoryConfigurationComplete: z.boolean(),
  externalIdpRegistrationRequired: z.boolean(),
});

const discoverySchema = z.object({
  authorization_endpoint: z.string().url(),
  token_endpoint: z.string().url(),
});

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
  id_token: z.string().optional(),
});

const transactionSchema = z.object({
  state: z.string().min(1),
  nonce: z.string().min(1),
  codeVerifier: z.string().min(43),
  issuerUri: z.string().url(),
  clientId: z.string().min(1),
  redirectUri: z.string().url(),
  returnTo: z.string().startsWith('/'),
  createdAt: z.number(),
});

export type OidcContract = z.infer<typeof oidcContractSchema>;

export interface OidcCallbackResult {
  accessToken: string;
  expiresAt?: number;
  returnTo: string;
  logoutUri?: string;
}

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function randomUrlSafe(bytes = 32): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return base64Url(buffer);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return base64Url(new Uint8Array(digest));
}

async function jsonFetch(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`OIDC request failed with HTTP ${response.status}.`);
  }
  return response.json();
}

export async function fetchOidcContract(): Promise<OidcContract> {
  const url = new URL('/api/v1/security/oidc', runtimeConfig.apiBaseUrl).toString();
  const contract = oidcContractSchema.parse(await jsonFetch(url));
  if (
    contract.authenticationMode !== 'jwt' ||
    contract.authorizationFlow !== 'authorization_code_pkce' ||
    contract.browserTokenStorage !== 'memory' ||
    !contract.repositoryConfigurationComplete ||
    !contract.externalIdpRegistrationRequired ||
    !contract.issuerUri ||
    !contract.clientId
  ) {
    throw new Error('The HidraAPI enterprise OIDC contract is not production-ready.');
  }
  return contract;
}

async function fetchDiscovery(issuerUri: string) {
  const issuer = issuerUri.endsWith('/') ? issuerUri : `${issuerUri}/`;
  const discoveryUrl = new URL('.well-known/openid-configuration', issuer).toString();
  return discoverySchema.parse(await jsonFetch(discoveryUrl));
}

function saveTransaction(transaction: z.infer<typeof transactionSchema>): void {
  sessionStorage.setItem(OIDC_TRANSACTION_KEY, JSON.stringify(transaction));
}

function takeTransaction(): z.infer<typeof transactionSchema> {
  const raw = sessionStorage.getItem(OIDC_TRANSACTION_KEY);
  sessionStorage.removeItem(OIDC_TRANSACTION_KEY);
  if (!raw) throw new Error('OIDC transaction state is missing or expired.');
  const transaction = transactionSchema.parse(JSON.parse(raw));
  if (Date.now() - transaction.createdAt > OIDC_TRANSACTION_MAX_AGE_MS) {
    throw new Error('OIDC transaction state has expired.');
  }
  return transaction;
}

function parseJwtPayload(token: string): Record<string, unknown> | undefined {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return undefined;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function validateNonce(idToken: string | undefined, expectedNonce: string): void {
  if (!idToken) return;
  const payload = parseJwtPayload(idToken);
  if (!payload || payload.nonce !== expectedNonce) {
    throw new Error('OIDC ID-token nonce validation failed.');
  }
}

function accessTokenExpiry(accessToken: string, expiresIn?: number): number | undefined {
  const payload = parseJwtPayload(accessToken);
  if (typeof payload?.exp === 'number') return payload.exp * 1000;
  if (typeof expiresIn === 'number' && Number.isFinite(expiresIn) && expiresIn > 0) {
    return Date.now() + expiresIn * 1000;
  }
  return undefined;
}

export async function beginOidcAuthorization(returnTo = '/overview'): Promise<never> {
  if (!runtimeConfig.oidcRedirectUri) {
    throw new Error('VITE_HIDRA_OIDC_REDIRECT_URI is required for enterprise OIDC authentication.');
  }
  const contract = await fetchOidcContract();
  const discovery = await fetchDiscovery(contract.issuerUri!);
  const codeVerifier = randomUrlSafe(64);
  const state = randomUrlSafe();
  const nonce = randomUrlSafe();
  const safeReturnTo = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/overview';
  saveTransaction({
    state,
    nonce,
    codeVerifier,
    issuerUri: contract.issuerUri!,
    clientId: contract.clientId!,
    redirectUri: runtimeConfig.oidcRedirectUri,
    returnTo: safeReturnTo,
    createdAt: Date.now(),
  });

  const authorizationUrl = new URL(discovery.authorization_endpoint);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('client_id', contract.clientId!);
  authorizationUrl.searchParams.set('redirect_uri', runtimeConfig.oidcRedirectUri);
  authorizationUrl.searchParams.set('scope', contract.scopes.join(' '));
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('nonce', nonce);
  authorizationUrl.searchParams.set('code_challenge', await sha256(codeVerifier));
  authorizationUrl.searchParams.set('code_challenge_method', 'S256');
  window.location.assign(authorizationUrl.toString());
  throw new Error('OIDC redirect did not navigate away from the current document.');
}

export async function completeOidcAuthorization(search: string): Promise<OidcCallbackResult> {
  const params = new URLSearchParams(search);
  const oidcError = params.get('error');
  if (oidcError) {
    takeTransaction();
    throw new Error(`OIDC authorization failed: ${params.get('error_description') ?? oidcError}`);
  }

  const code = params.get('code');
  const returnedState = params.get('state');
  if (!code || !returnedState) throw new Error('OIDC callback is missing code or state.');

  const transaction = takeTransaction();
  if (returnedState !== transaction.state) throw new Error('OIDC state validation failed.');

  const contract = await fetchOidcContract();
  if (contract.issuerUri !== transaction.issuerUri || contract.clientId !== transaction.clientId) {
    throw new Error('OIDC contract changed during the authorization transaction.');
  }
  const discovery = await fetchDiscovery(transaction.issuerUri);
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: transaction.clientId,
    redirect_uri: transaction.redirectUri,
    code_verifier: transaction.codeVerifier,
  });
  const tokenResponse = tokenResponseSchema.parse(
    await jsonFetch(discovery.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }),
  );
  if (tokenResponse.token_type && tokenResponse.token_type.toLowerCase() !== 'bearer') {
    throw new Error('OIDC token endpoint returned a non-Bearer access token.');
  }
  validateNonce(tokenResponse.id_token, transaction.nonce);
  return {
    accessToken: tokenResponse.access_token,
    expiresAt: accessTokenExpiry(tokenResponse.access_token, tokenResponse.expires_in),
    returnTo: transaction.returnTo,
    logoutUri: contract.logoutUri ?? undefined,
  };
}
