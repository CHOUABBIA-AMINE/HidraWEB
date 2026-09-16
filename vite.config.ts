import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

function e2eAuthenticationMockPlugin(): Plugin | undefined {
  if (process.env.HIDRA_E2E_AUTH_MOCK !== '1') return undefined;

  return {
    name: 'hidra-e2e-authentication-mock',
    configureServer(server) {
      server.middlewares.use('/api/v1/identity/authentication/login', (request, response, next) => {
        if (request.method !== 'POST') {
          next();
          return;
        }

        let body = '';
        request.setEncoding('utf8');
        request.on('data', (chunk: string) => {
          body += chunk;
        });
        request.on('end', () => {
          let payload: { providerType?: string; principal?: string; credentials?: string };
          try {
            payload = JSON.parse(body) as typeof payload;
          } catch {
            response.statusCode = 400;
            response.setHeader('Content-Type', 'application/problem+json');
            response.end(JSON.stringify({ status: 400, title: 'Bad Request' }));
            return;
          }

          if (payload.credentials === 'wrong') {
            response.statusCode = 401;
            response.setHeader('Content-Type', 'application/problem+json');
            response.end(JSON.stringify({ status: 401, title: 'Unauthorized' }));
            return;
          }

          const now = Date.now();
          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({
            sessionId: 'playwright-session',
            accessToken: 'hidra-playwright-jwt',
            tokenType: 'Bearer',
            issuedAt: new Date(now).toISOString(),
            expiresAt: new Date(now + 60 * 60 * 1000).toISOString(),
            userId: `e2e-${payload.principal ?? 'user'}`,
            username: payload.principal ?? 'user',
            displayName: payload.principal ?? 'User',
            authenticationType: payload.providerType ?? 'LOCAL',
            roles: [],
            permissions: [],
          }));
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), e2eAuthenticationMockPlugin()].filter(Boolean) as Plugin[],
  build: {
    manifest: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
});
