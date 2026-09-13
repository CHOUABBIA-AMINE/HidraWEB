import { defineConfig } from 'orval';

export default defineConfig({
  analytics: {
    input: { target: './openapi/hidra-analytics-0c8643c17b2648e8be85c658854f57ea0faab765.json' },
    output: {
      mode: 'single',
      target: './src/api/generated/analytics/analytics.ts',
      schemas: './src/api/generated/analytics/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});