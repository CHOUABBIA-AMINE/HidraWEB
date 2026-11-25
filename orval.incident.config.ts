import { defineConfig } from 'orval';

export default defineConfig({
  incident: {
    input: { target: './openapi/candidates/hidra-incident-b451302179eb3a5877aefcb105dab0f3ccb47897.json' },
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
