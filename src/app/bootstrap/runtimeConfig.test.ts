import { describe, expect, it } from 'vitest';

import { parseApiBaseUrl } from './runtimeConfig';

describe('parseApiBaseUrl', () => {
  it('accepts the same-origin root used by the production reverse proxy', () => {
    expect(parseApiBaseUrl('/')).toBe('/');
  });

  it('keeps absolute API origins valid for local development', () => {
    expect(parseApiBaseUrl('http://localhost:8080')).toBe('http://localhost:8080');
  });

  it('rejects arbitrary relative API paths', () => {
    expect(() => parseApiBaseUrl('/backend')).toThrow();
  });
});
