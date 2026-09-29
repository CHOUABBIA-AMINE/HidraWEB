import { defineConfig } from 'orval';

export default defineConfig({
  planning: {
    input: { target: './openapi/hidra-planning-63f3f60974ce57eb8cd5e42910397615195624fb.yaml' },
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
