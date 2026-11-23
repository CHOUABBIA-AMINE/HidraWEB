import { defineConfig } from 'orval';

export default defineConfig({
  integrity: {
    input: { target: './openapi/candidates/hidra-integrity-uxr25.json' },
    output: {
      mode: 'single',
      target: './src/api/generated/integrity/integrity.ts',
      schemas: './src/api/generated/integrity/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});
