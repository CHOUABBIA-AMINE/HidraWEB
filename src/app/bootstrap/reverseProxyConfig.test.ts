/// <reference types="node" />

import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const proxyTemplate = readFileSync(new URL('../../../deploy/nginx/hidraweb.conf.template', import.meta.url), 'utf8');

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
});
