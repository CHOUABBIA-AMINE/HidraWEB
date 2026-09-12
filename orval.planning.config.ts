import { defineConfig } from 'orval';

export default defineConfig({
  planning: {
    input: { target: './openapi/hidra-planning-df8c012be9034886e53f2ec64c28946f18f67b31.json' },
    output: {
      mode: 'single',
      target: './src/api/generated/planning/planning.ts',
      schemas: './src/api/generated/planning/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});
