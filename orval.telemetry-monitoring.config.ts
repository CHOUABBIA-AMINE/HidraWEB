import { defineConfig } from 'orval';

export default defineConfig({
  telemetryMonitoring: {
    input: {
      target: './openapi/hidra-telemetry-monitoring-df8c012be9034886e53f2ec64c28946f18f67b31.json',
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
