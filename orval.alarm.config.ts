import { defineConfig } from 'orval';

export default defineConfig({ alarm: { input: { target: './openapi/hidra-alarm-5028a90248ddf3a04d344308f6cfc2510f1d0ca2.json' }, output: { mode: 'single', target: './src/api/generated/alarm/alarm.ts', schemas: './src/api/generated/alarm/model', client: 'react-query', httpClient: 'axios', clean: true, override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } } } } });
