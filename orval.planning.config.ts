import { defineConfig } from 'orval';

export default defineConfig({
  planning: {
    input: { target: './openapi/hidra-planning-6ef581f557e42e8d96b03ccf429562e646f2e321.json' },
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
