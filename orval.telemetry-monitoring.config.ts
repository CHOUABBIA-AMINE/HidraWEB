import { defineConfig } from 'orval';

export default defineConfig({
  telemetryMonitoring: {
    input: {
      target: './openapi/hidra-telemetry-monitoring-63f3f60974ce57eb8cd5e42910397615195624fb.json',
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
