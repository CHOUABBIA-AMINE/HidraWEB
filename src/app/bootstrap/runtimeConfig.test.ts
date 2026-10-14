import { describe, expect, it } from 'vitest';

import { parseApiBaseUrl, parseCredentialProvider, resolveEnabledAuthProviders } from './runtimeConfig';

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

describe('multi-provider exposure policy', () => {
  it('preserves existing single-provider deployment modes', () => {
    expect(resolveEnabledAuthProviders('basic', 'LDAP')).toEqual(['LDAP']);
    expect(resolveEnabledAuthProviders('jwt', 'LOCAL')).toEqual(['OIDC']);
    expect(resolveEnabledAuthProviders('disabled', 'LOCAL')).toEqual([]);
  });

  it('accepts explicitly approved credential and OIDC choices', () => {
    expect(resolveEnabledAuthProviders(
      'multi', 'LOCAL', 'LOCAL,LDAP,ACTIVE_DIRECTORY,OIDC', 'https://hidra.example.test/auth/callback',
    )).toEqual(['LOCAL', 'LDAP', 'ACTIVE_DIRECTORY', 'OIDC']);
  });

  it('rejects missing, unknown, repeated, empty, or single options', () => {
    expect(() => resolveEnabledAuthProviders('multi', 'LOCAL')).toThrow('VITE_HIDRA_ENABLED_AUTH_PROVIDERS');
    expect(() => resolveEnabledAuthProviders('multi', 'LOCAL', 'LOCAL,LOCAL')).toThrow('Duplicate');
    expect(() => resolveEnabledAuthProviders('multi', 'LOCAL', 'LOCAL,OKTA')).toThrow();
    expect(() => resolveEnabledAuthProviders('multi', 'LOCAL', 'LOCAL')).toThrow('at least two');
    expect(() => resolveEnabledAuthProviders('multi', 'LOCAL', 'LOCAL,')).toThrow('empty');
  });

  it('rejects OIDC without a registered redirect', () => {
    expect(() => resolveEnabledAuthProviders('multi', 'LOCAL', 'LOCAL,OIDC'))
      .toThrow('VITE_HIDRA_OIDC_REDIRECT_URI');
  });
});
