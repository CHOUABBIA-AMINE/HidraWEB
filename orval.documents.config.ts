import { defineConfig } from 'orval';

export default defineConfig({
  documents: {
    input: { target: './openapi/hidra-documents-0c8643c17b2648e8be85c658854f57ea0faab765.json' },
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
