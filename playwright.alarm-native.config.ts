import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const endpoint = process.env.HIDRA_UXR26_API_URL ?? '';
const privateDir = process.env.HIDRA_F16_PRIVATE_DIR;
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(endpoint) || !privateDir) {
  throw new Error('F16 requires its disposable loopback API and private evidence directory.');
}

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'alarm-native-live.spec.ts',
  outputDir: join(privateDir, 'playwright'),
  workers: 1, retries: 0, forbidOnly: true, timeout: 300_000,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5173', ...devices['Desktop Chrome'],
    actionTimeout: 30_000, navigationTimeout: 30_000, trace: 'off', screenshot: 'off', video: 'off' },
  webServer: {
    command: 'npm run dev', url: 'http://127.0.0.1:5173/overview', reuseExistingServer: false,
    env: { HIDRA_E2E_AUTH_MOCK: '0', HIDRA_UXR26_API_URL: endpoint,
      VITE_HIDRA_API_BASE_URL: '/', VITE_HIDRA_AUTH_MODE: 'basic',
      VITE_HIDRA_CREDENTIAL_PROVIDER: 'LOCAL', VITE_HIDRA_DEFAULT_LOCALE: 'en' },
  },
});
