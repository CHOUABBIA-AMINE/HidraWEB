import { defineConfig } from 'orval';

export default defineConfig({
  workbench: {
    input: {
      target: './openapi/hidra-workbench-f8853fb17b17ff08baf16c4abdfdc810fcbaf01d.json',
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
