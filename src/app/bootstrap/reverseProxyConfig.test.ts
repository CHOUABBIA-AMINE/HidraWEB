/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const proxyTemplate = readFileSync(join(process.cwd(), 'deploy/nginx/hidraweb.conf.template'), 'utf8');
const securityHeadersTemplate = readFileSync(
  join(process.cwd(), 'deploy/nginx/hidra-security-headers.conf.template'),
  'utf8',
);

describe('same-origin reverse proxy template', () => {
  it('forwards the exact HidraAPI and realtime paths without SPA rewriting', () => {
    expect(proxyTemplate).toContain('location /api/');
    expect(proxyTemplate).toContain('location = /api/v1/realtime/sse');
    expect(proxyTemplate).toContain('location = /api/v1/realtime/ws');
    expect(proxyTemplate).toContain('proxy_pass ${HIDRA_API_UPSTREAM};');
  });

  it('keeps realtime transport requirements explicit', () => {
    expect(proxyTemplate).toContain('proxy_buffering off;');
    expect(proxyTemplate).toContain('proxy_set_header Upgrade $http_upgrade;');
    expect(proxyTemplate).toContain('proxy_set_header Connection "upgrade";');
  });

  it('uses SPA history fallback only for non-api browser routes', () => {
    expect(proxyTemplate).toContain('try_files $uri $uri/ /index.html;');
  });

  it('defines safe application-shell and fingerprinted-asset cache behavior', () => {
    expect(proxyTemplate).toContain('location ^~ /assets/');
    expect(proxyTemplate).toContain('public, max-age=31536000, immutable');
    expect(proxyTemplate).toContain('location = /index.html');
    expect(proxyTemplate).toContain('Cache-Control "no-cache"');
  });

  it('requires the checked-in browser security header policy', () => {
    expect(proxyTemplate).toContain('include /etc/nginx/snippets/hidra-security-headers.conf;');
    expect(securityHeadersTemplate).toContain('Strict-Transport-Security "max-age=63072000"');
    expect(securityHeadersTemplate).toContain("default-src 'self'");
    expect(securityHeadersTemplate).toContain("frame-ancestors 'none'");
    expect(securityHeadersTemplate).toContain("connect-src 'self' ${HIDRA_OIDC_ORIGIN}");
    expect(securityHeadersTemplate).toContain('upgrade-insecure-requests');
    expect(securityHeadersTemplate).toContain('X-Content-Type-Options "nosniff"');
    expect(securityHeadersTemplate).toContain('X-Frame-Options "DENY"');
    expect(securityHeadersTemplate).toContain('Referrer-Policy "strict-origin-when-cross-origin"');
    expect(securityHeadersTemplate).toContain('Permissions-Policy');
  });
});
