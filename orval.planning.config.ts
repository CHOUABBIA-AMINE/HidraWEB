import { defineConfig } from 'orval';

export default defineConfig({
  planning: {
    input: { target: './openapi/hidra-planning-c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55.json' },
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
