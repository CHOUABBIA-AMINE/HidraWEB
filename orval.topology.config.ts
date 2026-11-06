import { defineConfig } from 'orval';

export default defineConfig({
  topology: {
    input: {
      target: './openapi/candidates/hidra-topology-f1fdc206c916a5266f609810c045c6b5688bfd49.json',
    },
    output: {
      mode: 'single',
      target: './src/api/generated/topology/topology.ts',
      schemas: './src/api/generated/topology/model',
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
