import { defineConfig } from 'orval';

export default defineConfig({ leak: { input: { target: './openapi/hidra-leak-63f3f60974ce57eb8cd5e42910397615195624fb.json' }, output: { mode: 'single', target: './src/api/generated/leak/leak.ts', schemas: './src/api/generated/leak/model', client: 'react-query', httpClient: 'axios', clean: true, override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } } } } });
