import { defineConfig } from 'orval';

export default defineConfig({
  identityOrganization: {
    input: {
      target: './openapi/candidates/hidra-identity-organization-18e7a7596aea1b26e958130996c8811ae7fe27e4.json',
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
