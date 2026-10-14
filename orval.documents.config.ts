import { defineConfig } from 'orval';

export default defineConfig({
  documents: {
    input: { target: './openapi/candidates/hidra-documents-76b14cda4520f1eff242bd474c02ce4db317d385.json' },
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
