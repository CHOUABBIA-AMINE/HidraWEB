import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/performance/**/*.perf.ts'],
    isolate: true,
    maxWorkers: 1,
    minWorkers: 1,
    testTimeout: 10_000,
  },
});
