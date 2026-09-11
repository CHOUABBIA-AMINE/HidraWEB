import { defineConfig } from 'orval';

export default defineConfig({ alarm: { input: { target: './openapi/hidra-alarm-af4c3b4723619a25dd9a94f4d27f5a36adab982e.json' }, output: { mode: 'single', target: './src/api/generated/alarm/alarm.ts', schemas: './src/api/generated/alarm/model', client: 'react-query', httpClient: 'axios', clean: true, override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } } } } });
