import { defineConfig } from 'orval';

export default defineConfig({
  analytics: {
    input: { target: './openapi/candidates/hidra-analytics-76b14cda4520f1eff242bd474c02ce4db317d385.json' },
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