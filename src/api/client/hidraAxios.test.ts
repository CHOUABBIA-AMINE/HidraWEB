import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';

import {
  HIDRA_CORRELATION_ID_HEADER,
  HIDRA_REQUEST_ID_HEADER,
} from '@/api/client/diagnosticHeaders';
import { hidraAxios } from '@/api/client/hidraAxios';
import {
  configureTechnicalErrorSink,
  type TechnicalErrorReport,
} from '@/app/observability/technicalErrorReporter';

afterEach(() => {
  configureTechnicalErrorSink(undefined);
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
});
