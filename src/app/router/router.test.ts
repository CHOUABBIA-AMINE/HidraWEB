import { afterEach, describe, expect, it, vi } from 'vitest';

describe('authentication route registration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it.each([
    ['basic', '', false],
    ['basic', 'https://hidra.example.test/auth/callback', false],
    ['jwt', '', false],
    ['jwt', 'https://hidra.example.test/auth/callback', true],
  ] as const)('registers the OIDC callback in %s mode with a redirect URI of "%s": %s', async (mode, redirectUri, configured) => {
    vi.stubEnv('VITE_HIDRA_AUTH_MODE', mode);
    vi.stubEnv('VITE_HIDRA_OIDC_REDIRECT_URI', redirectUri);

    const { router } = await import('./router');
    try {
      const routes = router.routes.map(({ path }) => path);
      expect(routes).toContain('/login');
      expect(routes.includes('/auth/callback')).toBe(configured);
    } finally {
      router.dispose();
    }
  });
});
