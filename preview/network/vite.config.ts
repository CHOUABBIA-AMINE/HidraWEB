import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  publicDir: false,
  envDir: false,
  plugins: [react()],
  build: { outDir: 'node_modules/.cache/network-preview', emptyOutDir: true },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
});
