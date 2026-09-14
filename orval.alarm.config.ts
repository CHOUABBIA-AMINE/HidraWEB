import { defineConfig } from 'orval';

export default defineConfig({ alarm: { input: { target: './openapi/hidra-alarm-725a451ae4880ccb4f2ec508709241f88cd4aea7.json' }, output: { mode: 'single', target: './src/api/generated/alarm/alarm.ts', schemas: './src/api/generated/alarm/model', client: 'react-query', httpClient: 'axios', clean: true, override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } } } } });
