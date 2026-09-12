import { defineConfig } from 'orval';

export default defineConfig({
  planning: {
    input: { target: './openapi/hidra-planning-7bbdb49dbc40c5637d93a05863e69f9576a2edba.yaml' },
    output: {
      mode: 'single',
      target: './src/api/generated/planning/planning.ts',
      schemas: './src/api/generated/planning/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});
