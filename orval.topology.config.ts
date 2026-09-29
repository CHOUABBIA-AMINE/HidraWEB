import { defineConfig } from 'orval';

export default defineConfig({
  topology: {
    input: {
      target: './openapi/hidra-topology-63f3f60974ce57eb8cd5e42910397615195624fb.json',
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
