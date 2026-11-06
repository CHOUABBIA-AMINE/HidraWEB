import { defineConfig } from 'orval';

export default defineConfig({ workflow: { input: { target: './openapi/candidates/hidra-workflow-5817406923e53761577ac41bbc3f318b517c3977.json' }, output: { mode: 'single', target: './src/api/generated/workflow/workflow.ts', schemas: './src/api/generated/workflow/model', client: 'react-query', httpClient: 'axios', clean: true, override: { mutator: { path: './src/api/client/hidraHttpClient.ts', name: 'hidraHttpClient' } } } } });
