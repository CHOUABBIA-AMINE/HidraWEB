import { defineConfig } from 'orval';

export default defineConfig({
  events: {
    input: { target: './openapi/hidra-events-5c4c949fc73c0e15fcc8794beb2c6681931afc7e.json' },
    output: {
      mode: 'single',
      target: './src/api/generated/events/events.ts',
      schemas: './src/api/generated/events/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});
