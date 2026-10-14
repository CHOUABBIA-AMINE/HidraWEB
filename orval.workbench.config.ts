import { defineConfig } from 'orval';

export default defineConfig({
  workbench: {
    input: {
      target: './openapi/candidates/hidra-workbench-016d972725ac9a02a46f08ec024e0a4b0f95bda6.json',
    },
    output: {
      mode: 'single',
      target: './src/api/generated/workbench/workbench.ts',
      schemas: './src/api/generated/workbench/model',
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
