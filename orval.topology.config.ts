import { defineConfig } from 'orval';

export default defineConfig({
  topology: {
    input: {
      target: './openapi/hidra-topology-e5385f0e1f8bb88b48c8e1368962ef72ec6922ae.json',
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
