import { beforeEach, describe, expect, it, vi } from 'vitest';

import { completeOidcAuthorization, fetchOidcContract } from '@/app/auth/oidcClient';

const transactionKey = 'hidra.oidc.transaction';
const issuerUri = 'https://idp.example.test/tenant';
const tokenEndpoint = 'https://idp.example.test/oauth/token';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function jwt(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `header.${encoded}.signature`;
}

const productionContract = {
  authenticationMode: 'jwt',
  authorizationFlow: 'authorization_code_pkce',
  issuerUri,
  clientId: 'hidra-web',
  audience: 'hidra-api',
  scopes: ['openid', 'profile'],
  logoutUri: 'https://idp.example.test/logout',
  browserTokenStorage: 'memory',
  repositoryConfigurationComplete: true,
  externalIdpRegistrationRequired: true,
};

describe('OIDC production client', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('fails closed when the backend OIDC contract is incomplete', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      ...productionContract,
      repositoryConfigurationComplete: false,
    })));

    await expect(fetchOidcContract()).rejects.toThrow('not production-ready');
  });

  it('rejects a callback whose state does not match the stored PKCE transaction', async () => {
    sessionStorage.setItem(transactionKey, JSON.stringify({
      state: 'expected-state',
      nonce: 'nonce-1',
      codeVerifier: 'v'.repeat(64),
      issuerUri,
      clientId: 'hidra-web',
      redirectUri: 'https://app.example.test/auth/callback',
      returnTo: '/operations',
      createdAt: Date.now(),
    }));

    await expect(completeOidcAuthorization('?code=abc&state=wrong-state')).rejects.toThrow(
      'OIDC state validation failed',
    );
    expect(sessionStorage.getItem(transactionKey)).toBeNull();
  });

  it('exchanges a valid PKCE callback without a browser client secret or token persistence', async () => {
    const expiresAtSeconds = Math.floor(Date.now() / 1000) + 3600;
    sessionStorage.setItem(transactionKey, JSON.stringify({
      state: 'state-1',
      nonce: 'nonce-1',
      codeVerifier: 'v'.repeat(64),
      issuerUri,
      clientId: 'hidra-web',
      redirectUri: 'https://app.example.test/auth/callback',
      returnTo: '/operations',
      createdAt: Date.now(),
    }));

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(productionContract))
      .mockResolvedValueOnce(jsonResponse({
        authorization_endpoint: 'https://idp.example.test/oauth/authorize',
        token_endpoint: tokenEndpoint,
      }))
      .mockResolvedValueOnce(jsonResponse({
        access_token: jwt({ sub: 'user-1', exp: expiresAtSeconds }),
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'must-be-discarded',
        id_token: jwt({ nonce: 'nonce-1' }),
      }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await completeOidcAuthorization('?code=code-1&state=state-1');

    expect(result.returnTo).toBe('/operations');
    expect(result.logoutUri).toBe(productionContract.logoutUri);
    expect(result.expiresAt).toBe(expiresAtSeconds * 1000);
    expect(sessionStorage.getItem(transactionKey)).toBeNull();
    expect(localStorage.length).toBe(0);

    const tokenCall = fetchMock.mock.calls[2];
    expect(tokenCall?.[0]).toBe(tokenEndpoint);
    const init = tokenCall?.[1] as RequestInit;
    const body = init.body as URLSearchParams;
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code_verifier')).toBe('v'.repeat(64));
    expect(body.has('client_secret')).toBe(false);
  });
});
