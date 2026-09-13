import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/performance/**/*.perf.ts'],
    isolate: true,
    maxWorkers: 1,
    minWorkers: 1,
    testTimeout: 10_000,
  },
});
