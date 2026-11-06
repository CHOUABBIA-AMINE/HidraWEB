import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['foundation-context-live.spec.ts', 'foundation-topology-live.spec.ts', 'foundation-configuration-live.spec.ts'],
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 90_000,
  reporter: [['list']],
  outputDir: 'test-results/foundation-native',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'off', screenshot: 'off', video: 'off',
  },
  projects: [{ name: 'chromium-native', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173/overview',
    reuseExistingServer: false,
    env: {
      HIDRA_E2E_AUTH_MOCK: '0',
      HIDRA_FOUNDATION_NATIVE_E2E: '1',
      VITE_HIDRA_API_BASE_URL: '/',
      VITE_HIDRA_AUTH_MODE: 'basic',
      VITE_HIDRA_CREDENTIAL_PROVIDER: 'LOCAL',
      VITE_HIDRA_DEFAULT_LOCALE: 'fr',
    },
  },
});
