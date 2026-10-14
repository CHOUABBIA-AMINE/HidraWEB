import { defineConfig } from 'orval';

export default defineConfig({
  risk: {
    input: { target: './openapi/candidates/hidra-risk-81d46bcb8bc8821f67eafbb26cd1279f6d091457.json' },
    output: {
      mode: 'single',
      target: './src/api/generated/risk/risk.ts',
      schemas: './src/api/generated/risk/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});
