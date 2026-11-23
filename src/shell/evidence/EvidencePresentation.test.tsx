import { cleanup, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { i18n } from '@/shared/i18n/i18n';
import { EvidenceTimeline } from '@/shell/evidence/EvidenceTimeline';
import { StatusWithProvenance } from '@/shell/evidence/StatusWithProvenance';

afterEach(cleanup);
const wrapper = (children: ReactNode) => <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;

describe('UXR-15 source-bound evidence presentation', () => {
  it('renders explicit status, source, timestamp, quality, units, revision and effective period', () => {
    render(wrapper(<StatusWithProvenance label="Pressure evidence" state={{
      kind: 'ready', value: {
        value: '41.2', status: 'TRUSTED', unit: 'bar', source: 'Telemetry owner',
        quality: 'GOOD', observedAt: '2026-11-20T10:00:00Z', receivedAt: '2026-11-20T10:00:02Z',
        revision: '17', effectiveFrom: '2026-11-01', effectiveTo: '2026-12-01',
      },
    }} />));
    const panel = screen.getByRole('region', { name: 'Pressure evidence' });
    expect(panel).toHaveTextContent('41.2');
    expect(panel).toHaveTextContent('TRUSTED');
    for (const value of ['Telemetry owner', 'GOOD', 'bar', '17', '2026-11-01', '2026-12-01']) {
      expect(panel).toHaveTextContent(value);
    }
    expect(panel).not.toHaveTextContent('Audit proof');
  });

  it('never retains private status when owner authorization or loading changes', () => {
    const renderState = (kind: 'ready' | 'denied' | 'loading' | 'failed') =>
      <StatusWithProvenance label="Current owner" state={kind === 'ready'
        ? { kind, value: { source: 'Private owner', value: 'RESTRICTED' } } : { kind }} />;
    const view = render(wrapper(renderState('ready')));
    expect(screen.getByText('RESTRICTED')).toBeInTheDocument();
    for (const state of ['denied', 'loading', 'failed'] as const) {
      view.rerender(wrapper(renderState(state)));
      expect(screen.queryByText('RESTRICTED')).not.toBeInTheDocument();
      expect(screen.queryByText('Private owner')).not.toBeInTheDocument();
    }
  });

  it('shows only owner-issued timeline entries and optional evidence metadata', () => {
    render(wrapper(<EvidenceTimeline label="Timeline" state={{ kind: 'ready', value: [
      { source: 'Workflow instance', title: 'APPROVE', occurredAt: '2026-11-20T11:00:00Z',
        actor: 'Reviewer', correlationId: 'corr-1', revision: '2' },
    ] }} />));
    const heading = screen.getByRole('heading', { name: 'Timeline' });
    const table = heading.parentElement?.querySelector('table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveTextContent('APPROVE');
    expect(table).toHaveTextContent('Workflow instance');
    expect(table).toHaveTextContent('corr-1');
    expect(table).toHaveTextContent('2');
    expect(table).not.toHaveTextContent('Quality: TRUSTED');
  });

  it('isolates no-record and denied/failed timeline states without stale rows', () => {
    const event = { source: 'Audit', title: 'Protected event' };
    const view = render(wrapper(<EvidenceTimeline label="Protected timeline" state={{ kind: 'ready', value: [event] }} />));
    expect(screen.getByText('Protected event')).toBeInTheDocument();
    view.rerender(wrapper(<EvidenceTimeline label="Protected timeline" state={{ kind: 'denied' }} />));
    expect(screen.queryByText('Protected event')).not.toBeInTheDocument();
    view.rerender(wrapper(<EvidenceTimeline label="Protected timeline" state={{ kind: 'ready', value: [] }} />));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    view.rerender(wrapper(<EvidenceTimeline label="Protected timeline" state={{ kind: 'failed' }} />));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
