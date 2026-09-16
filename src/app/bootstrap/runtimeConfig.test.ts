import { describe, expect, it } from 'vitest';

import { parseApiBaseUrl, parseCredentialProvider } from './runtimeConfig';

describe('parseApiBaseUrl', () => {
  it('accepts the same-origin root used by the production reverse proxy', () => {
    expect(parseApiBaseUrl('/')).toBe('/');
  });

  it('keeps absolute API origins valid for local development', () => {
    expect(parseApiBaseUrl('http://localhost:8080')).toBe('http://localhost:8080');
  });

  it('rejects arbitrary relative API paths', () => {
    expect(() => parseApiBaseUrl('/backend')).toThrow();
  });
});

describe('parseCredentialProvider', () => {
  it.each(['LOCAL', 'LDAP', 'ACTIVE_DIRECTORY'] as const)('accepts %s as a deployment credential provider', (provider) => {
    expect(parseCredentialProvider(provider)).toBe(provider);
  });

  it('rejects providers that do not use the credential login contract', () => {
    expect(() => parseCredentialProvider('OIDC')).toThrow();
  });
});
