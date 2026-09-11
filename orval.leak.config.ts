import { defineConfig } from 'orval';

export default defineConfig({ leak: { input: { target: './openapi/hidra-leak-ff92c6af819723f4965a8a631a633384be2c46e1.json' }, output: { mode: 'single', target: './src/api/generated/leak/leak.ts', schemas: './src/api/generated/leak/model', client: 'react-query', httpClient: 'axios', clean: true, override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } } } } });
