import { defineConfig } from 'orval';

export default defineConfig({ leak: { input: { target: './openapi/candidates/hidra-leak-b451302179eb3a5877aefcb105dab0f3ccb47897.json' }, output: { mode: 'single', target: './src/api/generated/leak/leak.ts', schemas: './src/api/generated/leak/model', client: 'react-query', httpClient: 'axios', clean: true, override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } } } } });
