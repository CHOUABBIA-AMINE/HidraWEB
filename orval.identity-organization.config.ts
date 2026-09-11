import { defineConfig } from 'orval';

export default defineConfig({
  identityOrganization: {
    input: {
      target: './openapi/hidra-identity-organization-af4c3b4723619a25dd9a94f4d27f5a36adab982e.json',
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
