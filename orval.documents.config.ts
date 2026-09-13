import { defineConfig } from 'orval';

export default defineConfig({
  documents: {
    input: { target: './openapi/hidra-documents-725a451ae4880ccb4f2ec508709241f88cd4aea7.json' },
    output: {
      mode: 'single',
      target: './src/api/generated/documents/documents.ts',
      schemas: './src/api/generated/documents/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } },
    },
  },
});
