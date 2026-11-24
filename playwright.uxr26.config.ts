import { defineConfig, devices } from '@playwright/test';

const endpoint = process.env.HIDRA_UXR26_API_URL ?? '';
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(endpoint)) {
  throw new Error('HIDRA_UXR26_API_URL must be the disposable loopback HidraAPI origin.');
}

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'uxr26-native.spec.ts',
  workers: 1,
  retries: 0,
  // Five signed sessions, two owner-checked decisions, publication and fresh
  // persisted readback are intentionally serialized. Bound the complete journey
  // independently of the owner's short database transaction deadlines.
  timeout: 600_000,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5173', ...devices['Desktop Chrome'], trace: 'off', screenshot: 'off', video: 'off' },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173/overview',
    reuseExistingServer: false,
    env: {
      HIDRA_E2E_AUTH_MOCK: '0',
      HIDRA_UXR26_API_URL: endpoint,
      VITE_HIDRA_API_BASE_URL: '/',
      VITE_HIDRA_AUTH_MODE: 'basic',
      VITE_HIDRA_CREDENTIAL_PROVIDER: 'LOCAL',
      VITE_HIDRA_DEFAULT_LOCALE: 'en',
    },
  },
});
