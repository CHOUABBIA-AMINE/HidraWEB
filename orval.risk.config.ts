import { defineConfig } from 'orval';

export default defineConfig({
  risk: {
    input: { target: './openapi/hidra-risk-63f3f60974ce57eb8cd5e42910397615195624fb.json' },
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
