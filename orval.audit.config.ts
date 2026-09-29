import { defineConfig } from 'orval';

export default defineConfig({
  audit: {
    input: { target: './openapi/hidra-audit-63f3f60974ce57eb8cd5e42910397615195624fb.json' },
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
