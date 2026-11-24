import { join } from 'node:path';
import { defineConfig } from '@playwright/test';

import signedConfig from './playwright.uxr26.config';

const privateDir = process.env.HIDRA_UXR28_PRIVATE_DIR;
if (!privateDir) throw new Error('UXR28 private output directory is required');

// Reuse the real loopback origin, zero retries and private diagnostics policy.
export default defineConfig({
  ...signedConfig,
  testMatch: 'uxr28-native.spec.ts',
  outputDir: join(privateDir, 'playwright'),
  timeout: 600_000,
});
