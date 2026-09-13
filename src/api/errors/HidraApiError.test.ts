import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('normalizeHidraApiError', () => {
  it('prefers backend ProblemDetail diagnostic identifiers', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    const normalized = normalizeHidraApiError({
      message: 'Request failed',
      response: {
        status: 500,
        data: {
          title: 'INTERNAL_ERROR',
          code: 'INTERNAL_ERROR',
          correlationId: 'body-correlation',
          requestId: 'body-request',
        },
        headers: {
          'X-Correlation-Id': 'response-correlation',
          'X-Request-Id': 'response-request',
        },
      },
      config: {
        headers: {
          'X-Correlation-Id': 'request-correlation',
          'X-Request-Id': 'request-request',
        },
      },
    });

    expect(normalized.status).toBe(500);
    expect(normalized.correlationId).toBe('body-correlation');
    expect(normalized.requestId).toBe('body-request');
    expect(normalized.problem?.code).toBe('INTERNAL_ERROR');
  });

  it('uses echoed response headers when the body omits identifiers', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    const normalized = normalizeHidraApiError({
      message: 'Request failed',
      response: {
        status: 503,
        data: { title: 'Service unavailable' },
        headers: {
          'x-correlation-id': 'response-correlation',
          'x-request-id': 'response-request',
        },
      },
      config: {
        headers: {
          'X-Correlation-Id': 'request-correlation',
          'X-Request-Id': 'request-request',
        },
      },
    });

    expect(normalized.correlationId).toBe('response-correlation');
    expect(normalized.requestId).toBe('response-request');
  });

  it('retains request diagnostics for network failures without a response', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    const normalized = normalizeHidraApiError({
      message: 'Network Error',
      config: {
        headers: {
          'x-correlation-id': 'request-correlation',
          'x-request-id': 'request-request',
        },
      },
    });

    expect(normalized.message).toBe('Network Error');
    expect(normalized.status).toBeUndefined();
    expect(normalized.correlationId).toBe('request-correlation');
    expect(normalized.requestId).toBe('request-request');
  });
});
