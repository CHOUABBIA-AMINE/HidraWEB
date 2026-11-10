import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  HIDRA_CORRELATION_ID_HEADER,
  HIDRA_REQUEST_ID_HEADER,
} from '@/api/client/diagnosticHeaders';
import { hidraAxios } from '@/api/client/hidraAxios';
import { HIDRA_AUTH_UNAUTHORIZED_EVENT } from '@/app/auth/authEvents';
import { registerAuthorizationHeaderFactory } from '@/app/auth/authorizationHeaderRegistry';
import {
  configureTechnicalErrorSink,
  type TechnicalErrorReport,
} from '@/app/observability/technicalErrorReporter';

afterEach(() => {
  configureTechnicalErrorSink(undefined);
  registerAuthorizationHeaderFactory(() => undefined);
});

describe('hidraAxios diagnostics', () => {
  it('generates correlation and request identifiers when absent', async () => {
    let correlationId: string | undefined;
    let requestId: string | undefined;

    await hidraAxios.request({
      method: 'GET',
      url: '/api/v1/test',
      adapter: async (config) => {
        correlationId = config.headers.get(HIDRA_CORRELATION_ID_HEADER) as string | undefined;
        requestId = config.headers.get(HIDRA_REQUEST_ID_HEADER) as string | undefined;
        return {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      },
    });

    expect(correlationId).toBeTruthy();
    expect(requestId).toBeTruthy();
    expect(correlationId).not.toBe(requestId);
  });

  it('preserves explicitly supplied diagnostic identifiers', async () => {
    await hidraAxios.request({
      method: 'GET',
      url: '/api/v1/test',
      headers: {
        [HIDRA_CORRELATION_ID_HEADER]: 'corr-fixed',
        [HIDRA_REQUEST_ID_HEADER]: 'req-fixed',
      },
      adapter: async (config) => {
        expect(config.headers.get(HIDRA_CORRELATION_ID_HEADER)).toBe('corr-fixed');
        expect(config.headers.get(HIDRA_REQUEST_ID_HEADER)).toBe('req-fixed');
        return {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      },
    });
  });

  it('reports network and server failures with safe structured diagnostics', async () => {
    const reports: Readonly<TechnicalErrorReport>[] = [];
    configureTechnicalErrorSink((report) => reports.push(report));

    await expect(
      hidraAxios.request({
        method: 'POST',
        url: '/api/v1/test?secret=must-not-leak',
        data: { secret: 'must-not-leak' },
        adapter: async (config) => {
          const correlationId = config.headers.get(HIDRA_CORRELATION_ID_HEADER) as string;
          const requestId = config.headers.get(HIDRA_REQUEST_ID_HEADER) as string;
          throw new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, undefined, {
            data: {
              title: 'INTERNAL_ERROR',
              status: 500,
              code: 'INTERNAL_ERROR',
            },
            status: 500,
            statusText: 'Internal Server Error',
            headers: new AxiosHeaders({
              [HIDRA_CORRELATION_ID_HEADER]: correlationId,
              [HIDRA_REQUEST_ID_HEADER]: requestId,
            }),
            config,
          });
        },
      }),
    ).rejects.toMatchObject({ status: 500 });

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      source: 'api',
      message: 'HidraAPI request failed.',
      errorName: 'HidraApiError',
      http: {
        method: 'POST',
        path: '/api/v1/test',
        status: 500,
        code: 'INTERNAL_ERROR',
      },
    });
    expect(reports[0].correlationId).toBeTruthy();
    expect(reports[0].requestId).toBeTruthy();
    expect(JSON.stringify(reports[0])).not.toContain('must-not-leak');
  });

  it('dispatches the unauthorized session event on backend HTTP 401', async () => {
    let unauthorizedEvents = 0;
    const listener = () => { unauthorizedEvents += 1; };
    window.addEventListener(HIDRA_AUTH_UNAUTHORIZED_EVENT, listener);

    try {
      await expect(
        hidraAxios.request({
          method: 'GET',
          url: '/api/v1/protected',
          adapter: async (config) => {
            throw new AxiosError('Unauthorized', 'ERR_BAD_RESPONSE', config, undefined, {
              data: { title: 'Unauthorized', status: 401 },
              status: 401,
              statusText: 'Unauthorized',
              headers: new AxiosHeaders(),
              config,
            });
          },
        }),
      ).rejects.toMatchObject({ status: 401 });

      expect(unauthorizedEvents).toBe(1);
    } finally {
      window.removeEventListener(HIDRA_AUTH_UNAUTHORIZED_EVENT, listener);
    }
  });

  it('preserves the authenticated session signal on backend HTTP 403', async () => {
    let unauthorizedEvents = 0;
    const listener = () => { unauthorizedEvents += 1; };
    window.addEventListener(HIDRA_AUTH_UNAUTHORIZED_EVENT, listener);

    try {
      await expect(
        hidraAxios.request({
          method: 'GET',
          url: '/api/v1/forbidden',
          adapter: async (config) => {
            throw new AxiosError('Forbidden', 'ERR_BAD_RESPONSE', config, undefined, {
              data: { title: 'Forbidden', status: 403 },
              status: 403,
              statusText: 'Forbidden',
              headers: new AxiosHeaders(),
              config,
            });
          },
        }),
      ).rejects.toMatchObject({ status: 403 });

      expect(unauthorizedEvents).toBe(0);
    } finally {
      window.removeEventListener(HIDRA_AUTH_UNAUTHORIZED_EVENT, listener);
    }
  });

});

function rejectHttp(config: InternalAxiosRequestConfig, status: number): never {
  throw new AxiosError('Request rejected', 'ERR_BAD_RESPONSE', config, undefined, {
    data: { status }, status, statusText: 'Rejected', headers: new AxiosHeaders(), config,
  });
}

describe('LOCAL session transport fencing', () => {
  it('replays a safe read once and preserves its diagnostic identifiers', async () => {
    let bearer = 'Bearer old';
    const recover = vi.fn(async () => { bearer = 'Bearer new'; return true; });
    registerAuthorizationHeaderFactory(() => bearer, {
      pending: () => undefined, prepareRead: () => undefined, recoverRead: recover,
    });
    const sent: Array<[unknown, unknown]> = [];
    await expect(hidraAxios.get('/api/v1/protected', {
      adapter: async config => {
        sent.push([config.headers.get('Authorization'), config.headers.get(HIDRA_REQUEST_ID_HEADER)]);
        return rejectHttp(config, 401);
      },
    })).rejects.toMatchObject({ status: 401 });
    expect(recover).toHaveBeenCalledExactlyOnceWith('Bearer old');
    expect(sent).toEqual([['Bearer old', expect.any(String)], ['Bearer new', sent[0][1]]]);
  });

  it('does not refresh authorization denials or replay mutations', async () => {
    const recover = vi.fn(async () => true);
    registerAuthorizationHeaderFactory(() => 'Bearer current', {
      pending: () => undefined, prepareRead: () => undefined, recoverRead: recover,
    });
    const read = vi.fn(async config => rejectHttp(config, 403));
    const write = vi.fn(async config => rejectHttp(config, 401));
    await expect(hidraAxios.get('/api/v1/protected', { adapter: read })).rejects.toMatchObject({ status: 403 });
    await expect(hidraAxios.post('/api/v1/protected', {}, { adapter: write })).rejects.toMatchObject({ status: 401 });
    expect(read).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(1);
    expect(recover).not.toHaveBeenCalled();
  });

  it('rejects late data after the active session has been cleared', async () => {
    registerAuthorizationHeaderFactory(() => 'Bearer old');
    await expect(hidraAxios.get('/api/v1/protected', {
      adapter: async config => {
        registerAuthorizationHeaderFactory(() => undefined);
        return { data: { protected: true }, status: 200, statusText: 'OK', headers: {}, config };
      },
    })).rejects.toMatchObject({ code: 'ERR_CANCELED' });
  });
});
