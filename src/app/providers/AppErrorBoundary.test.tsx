import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  configureTechnicalErrorSink,
  type TechnicalErrorReport,
} from '@/app/observability/technicalErrorReporter';
import { AppErrorBoundary } from '@/app/providers/AppErrorBoundary';

afterEach(() => {
  configureTechnicalErrorSink(undefined);
  vi.restoreAllMocks();
});

describe('AppErrorBoundary', () => {
  it('reports an unexpected render failure and exposes only a support reference', async () => {
    const reports: Readonly<TechnicalErrorReport>[] = [];
    configureTechnicalErrorSink((report) => reports.push(report));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    function BrokenView(): never {
      throw new Error('sensitive render detail');
    }

    render(
      <AppErrorBoundary>
        <BrokenView />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('HidraWeb encountered an unexpected error.')).toBeInTheDocument();
    expect(screen.getByText('The application could not render this view safely.')).toBeInTheDocument();
    expect(screen.queryByText('sensitive render detail')).not.toBeInTheDocument();

    await waitFor(() => expect(screen.getByText(/Support reference:/)).toBeInTheDocument());
    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      source: 'react',
      message: 'Unhandled React render error.',
      errorName: 'Error',
    });
    expect(screen.getByText(`Support reference: ${reports[0].eventId}`)).toBeInTheDocument();
  });
});
