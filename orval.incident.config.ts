import { defineConfig } from 'orval';

export default defineConfig({
  incident: {
    input: { target: './openapi/hidra-incident-5c4c949fc73c0e15fcc8794beb2c6681931afc7e.json' },
    output: {
      mode: 'single',
      target: './src/api/generated/incident/incident.ts',
      schemas: './src/api/generated/incident/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});
