import { defineConfig } from 'orval';

export default defineConfig({
  configuration: {
    input: { target: './openapi/hidra-configuration-0c8643c17b2648e8be85c658854f57ea0faab765.json' },
    output: {
      mode: 'single',
      target: './src/api/generated/configuration/configuration.ts',
      schemas: './src/api/generated/configuration/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});
