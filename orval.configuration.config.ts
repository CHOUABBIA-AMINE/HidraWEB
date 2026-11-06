import { defineConfig } from 'orval';

export default defineConfig({
  configuration: {
    input: { target: './openapi/candidates/hidra-configuration-f1fdc206c916a5266f609810c045c6b5688bfd49.json' },
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
