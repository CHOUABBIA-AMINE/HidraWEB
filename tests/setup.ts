import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import type { AuthenticationGateway, AuthenticationCredentials } from '@/app/auth/authenticationGateway';

vi.mock('@/app/auth/authenticationGateway', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const realGateway = actual.authenticationGateway as AuthenticationGateway;

  return {
    ...actual,
    authenticationGateway: {
      ...realGateway,
      loginLocal: vi.fn(async (credentials: AuthenticationCredentials) => ({
        accessToken: 'hidra-unit-test-jwt',
        authenticationType: 'LOCAL' as const,
        expiresAt: Date.now() + 60 * 60 * 1000,
        sessionId: 'unit-test-session',
        tokenType: 'Bearer',
        principal: {
          userId: `unit-${credentials.principal.trim() || 'user'}`,
          username: credentials.principal.trim() || 'user',
          displayName: credentials.principal.trim() || 'User',
          roles: [],
          permissions: [],
        },
      })),
    },
  };
});
