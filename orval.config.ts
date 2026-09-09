import { defineConfig } from 'orval';

const openApiUrl = process.env.HIDRA_OPENAPI_URL ?? 'http://localhost:8080/v3/api-docs';

export default defineConfig({
  hidra: {
    input: {
      target: openApiUrl,
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: {
        mutator: {
          path: './src/api/client/hidraHttpClient.ts',
          name: 'hidraHttpClient',
        },
      },
    },
  },
});
