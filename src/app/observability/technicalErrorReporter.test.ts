import { afterEach, describe, expect, it } from 'vitest';

import {
  configureTechnicalErrorSink,
  installGlobalTechnicalErrorReporting,
  reportTechnicalError,
  toSafeDiagnosticPath,
  type TechnicalErrorReport,
} from '@/app/observability/technicalErrorReporter';

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  configureTechnicalErrorSink(undefined);
  window.history.replaceState({}, '', '/');
});

describe('technical error reporting', () => {
  it('emits a structured diagnostic report without URL query data', () => {
    const reports: Readonly<TechnicalErrorReport>[] = [];
    configureTechnicalErrorSink((report) => reports.push(report));
    window.history.replaceState({}, '', '/operations?token=must-not-leak');

    const report = reportTechnicalError({
      source: 'api',
      message: 'HidraAPI request failed.',
      errorName: 'HidraApiError',
      correlationId: ' corr-1 ',
      requestId: ' req-1 ',
      http: {
        method: 'post',
        path: '/api/v1/events?secret=must-not-leak#fragment',
        status: 500,
        code: 'INTERNAL_ERROR',
      },
    });

    expect(reports).toEqual([report]);
    expect(report.route).toBe('/operations');
    expect(report.correlationId).toBe('corr-1');
    expect(report.requestId).toBe('req-1');
    expect(report.http).toEqual({
      method: 'POST',
      path: '/api/v1/events',
      status: 500,
      code: 'INTERNAL_ERROR',
    });
    expect(JSON.stringify(report)).not.toContain('must-not-leak');
  });

  it('reports global browser failures without copying arbitrary exception messages', () => {
    const reports: Readonly<TechnicalErrorReport>[] = [];
    configureTechnicalErrorSink((report) => reports.push(report));
    cleanup = installGlobalTechnicalErrorReporting();

    window.dispatchEvent(
      new ErrorEvent('error', {
        error: new TypeError('sensitive runtime value'),
        message: 'sensitive runtime value',
      }),
    );

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      source: 'window',
      message: 'Unhandled browser error.',
      errorName: 'TypeError',
      route: '/',
    });
    expect(JSON.stringify(reports[0])).not.toContain('sensitive runtime value');
  });

  it('normalizes diagnostic paths to pathname-only values', () => {
    expect(toSafeDiagnosticPath('https://hidra.example/api/v1/items?token=secret#details')).toBe('/api/v1/items');
    expect(toSafeDiagnosticPath('/api/v1/items?token=secret')).toBe('/api/v1/items');
    expect(toSafeDiagnosticPath('')).toBeUndefined();
  });
});
