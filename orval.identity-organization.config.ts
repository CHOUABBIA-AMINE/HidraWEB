import { defineConfig } from 'orval';

export default defineConfig({
  identityOrganization: {
    input: {
      target: './openapi/hidra-identity-organization-f8853fb17b17ff08baf16c4abdfdc810fcbaf01d.json',
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
