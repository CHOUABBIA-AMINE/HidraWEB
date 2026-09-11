import { defineConfig } from 'orval';

export default defineConfig({ hse: { input: { target: './openapi/hidra-hse-1bfa44ed5fd9fea43e86b8ac7b7ac85c6bdf611b.json' }, output: { mode: 'single', target: './src/api/generated/hse/hse.ts', schemas: './src/api/generated/hse/model', client: 'react-query', httpClient: 'axios', clean: true, override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } } } } });
