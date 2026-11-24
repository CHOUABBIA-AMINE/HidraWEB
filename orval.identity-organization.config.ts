import { defineConfig } from 'orval';

export default defineConfig({
  identityOrganization: {
    input: {
      target: './openapi/candidates/hidra-identity-organization-7624bc900881ccd3957d07f5b1add3f28069bb6d.json',
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
