import { defineConfig } from 'orval';

export default defineConfig({ workflow: { input: { target: './openapi/hidra-workflow-63f3f60974ce57eb8cd5e42910397615195624fb.json' }, output: { mode: 'single', target: './src/api/generated/workflow/workflow.ts', schemas: './src/api/generated/workflow/model', client: 'react-query', httpClient: 'axios', clean: true, override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } } } } });
