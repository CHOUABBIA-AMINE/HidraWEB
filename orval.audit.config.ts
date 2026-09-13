import { defineConfig } from 'orval';

export default defineConfig({
  audit: {
    input: { target: './openapi/hidra-audit-0c8643c17b2648e8be85c658854f57ea0faab765.json' },
    output: {
      mode: 'single',
      target: './src/api/generated/audit/audit.ts',
      schemas: './src/api/generated/audit/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});
