import { describe, expect, it } from 'vitest';

import { normalizeAuthenticationResponse } from '@/app/auth/authenticationGateway';

describe('HWEB-016-05 authentication gateway', () => {
  it('normalizes a backend authentication response into one Hidra session result', () => {
    const result = normalizeAuthenticationResponse(
      {
        accessToken: ' hidra-token ',
        authenticationType: 'LDAP',
        expiresAt: '2026-09-15T22:00:00Z',
        sessionId: 'session-1',
        userId: 'user-1',
        username: 'operator',
        displayName: 'Pipeline Operator',
        roles: ['OPERATOR'],
        permissions: ['telemetry:read'],
      },
      'LDAP',
    );

    expect(result).toEqual({
      accessToken: 'hidra-token',
      authenticationType: 'LDAP',
      expiresAt: Date.parse('2026-09-15T22:00:00Z'),
      sessionId: 'session-1',
      tokenType: undefined,
      identityProviderId: undefined,
      principal: {
        userId: 'user-1',
        username: 'operator',
        displayName: 'Pipeline Operator',
        roles: ['OPERATOR'],
        permissions: ['telemetry:read'],
      },
    });
  });

  it('rejects a response authenticated by a different provider instead of accepting fallback', () => {
    expect(() =>
      normalizeAuthenticationResponse(
        {
          accessToken: 'hidra-token',
          authenticationType: 'LOCAL',
        },
        'LDAP',
      ),
    ).toThrow('HidraAPI authenticated with LOCAL instead of LDAP.');
  });

  it('rejects an authentication response without a Hidra access token', () => {
    expect(() =>
      normalizeAuthenticationResponse(
        {
          authenticationType: 'OIDC',
        },
        'OIDC',
      ),
    ).toThrow('HidraAPI returned an authentication response without an access token.');
  });
});
