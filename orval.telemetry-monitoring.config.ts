import { defineConfig } from 'orval';

export default defineConfig({
  telemetryMonitoring: {
    input: {
      target: './openapi/candidates/hidra-telemetry-monitoring-uxr24.json',
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
