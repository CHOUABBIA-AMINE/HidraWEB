import { defineConfig } from 'orval';

export default defineConfig({
  reporting: {
    input: { target: './openapi/hidra-reporting-0c8643c17b2648e8be85c658854f57ea0faab765.json' },
    output: {
      mode: 'single',
      target: './src/api/generated/reporting/reporting.ts',
      schemas: './src/api/generated/reporting/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});
