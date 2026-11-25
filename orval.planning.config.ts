import { defineConfig } from 'orval';

export default defineConfig({
  planning: {
    input: { target: './openapi/candidates/hidra-planning-b451302179eb3a5877aefcb105dab0f3ccb47897.json' },
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
