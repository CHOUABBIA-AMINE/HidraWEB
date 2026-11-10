import { defineConfig } from 'orval';

export default defineConfig({
  identityOrganization: {
    input: {
      target: './openapi/candidates/hidra-identity-organization-720e9222b30fa45b7423ede9c9f141ab87298024.json',
    },
    output: {
      mode: 'single',
      target: './src/api/generated/identity-organization/identityOrganization.ts',
      schemas: './src/api/generated/identity-organization/model',
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
