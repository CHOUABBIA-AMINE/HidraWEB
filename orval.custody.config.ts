import { defineConfig } from 'orval';

export default defineConfig({
  custody: {
    input: { target: './openapi/hidra-custody-2e6f93c14e330c8cc839a5de75ecc7b893f9872c.json' },
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
