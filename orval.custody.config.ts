import { defineConfig } from 'orval';

export default defineConfig({
  custody: {
    input: { target: './openapi/candidates/hidra-custody-da4ce33ead7db40776049c861027947b61b96270.json' },
    output: {
      mode: 'single',
      target: './src/api/generated/custody/custody.ts',
      schemas: './src/api/generated/custody/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});
