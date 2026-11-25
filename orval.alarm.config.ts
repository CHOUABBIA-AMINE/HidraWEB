import { defineConfig } from 'orval';

export default defineConfig({ alarm: { input: { target: './openapi/candidates/hidra-alarm-b451302179eb3a5877aefcb105dab0f3ccb47897.json' }, output: { mode: 'single', target: './src/api/generated/alarm/alarm.ts', schemas: './src/api/generated/alarm/model', client: 'react-query', httpClient: 'axios', clean: true, override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } } } } });
