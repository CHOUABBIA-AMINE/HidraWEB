import { join } from 'node:path';
import { defineConfig } from '@playwright/test';
import signedConfig from './playwright.uxr26.config';

const privateDir = process.env.HIDRA_UXR29_PRIVATE_DIR;
if (!privateDir || !process.env.HIDRA_UXR29_FIXTURE) throw new Error('UXR29 private fixture and output are required');

export default defineConfig({
  ...signedConfig,
  testMatch: 'uxr29-native.spec.ts',
  outputDir: join(privateDir, 'playwright'),
  workers: 1,
  retries: 0,
  timeout: 600_000,
});
