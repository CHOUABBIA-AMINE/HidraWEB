import { defineConfig } from 'orval';

export default defineConfig({ workflow: { input: { target: './openapi/hidra-workflow-6e3f3b2829bb63f0d004c8bc9ba386d05eb3edcc.json' }, output: { mode: 'single', target: './src/api/generated/workflow/workflow.ts', schemas: './src/api/generated/workflow/model', client: 'react-query', httpClient: 'axios', clean: true, override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } } } } });
