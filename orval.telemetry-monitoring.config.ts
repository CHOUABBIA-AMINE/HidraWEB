import { defineConfig } from 'orval';

export default defineConfig({
  telemetryMonitoring: {
    input: {
      target: './openapi/candidates/hidra-telemetry-monitoring-da4ce33ead7db40776049c861027947b61b96270.json',
    },
    output: {
      mode: 'single',
      target: './src/api/generated/telemetry-monitoring/telemetryMonitoring.ts',
      schemas: './src/api/generated/telemetry-monitoring/model',
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
