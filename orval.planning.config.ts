import { defineConfig } from 'orval';

export default defineConfig({
  planning: {
    input: { target: './openapi/candidates/hidra-planning-d14c44fc527ea1115ad87baafa21a3264bf6950c.json' },
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
