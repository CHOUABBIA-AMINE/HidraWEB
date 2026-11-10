import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from '@playwright/test';

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url));
const baseURL = 'http://127.0.0.1:4174';
const executablePath = process.env.HIDRA_PREVIEW_CHROMIUM;

export default defineConfig({
  testDir: '.',
  testMatch: 'network.spec.ts',
  outputDir: 'test-results',
  forbidOnly: Boolean(process.env.CI),
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: {
    command: 'npx vite preview --config preview/network/vite.config.ts',
    cwd: repositoryRoot,
    url: baseURL,
    reuseExistingServer: false,
  },
});
