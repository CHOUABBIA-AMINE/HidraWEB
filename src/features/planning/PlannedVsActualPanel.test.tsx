import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PlannedVsActualPanel } from '@/features/planning/PlannedVsActualPanel';

const hidraHttpClient = vi.hoisted(() => vi.fn());
const grants = vi.hoisted(() => ({ comparison: true }));

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient }));
vi.mock('@/features/permissions/usePermissions', () => ({
  usePermissions: () => ({
    routes: [
      { route: '/api/v1/planning/revisions/{id}', methods: ['GET'], permission: 'planning:revisions:read' },
      { route: '/api/v1/planning/operational-plans/{id}', methods: ['GET'], permission: 'planning:operational-plans:read' },
      { route: '/api/v1/planning/targets/{id}', methods: ['GET'], permission: 'planning:targets:read' },
      { route: '/api/v1/planning/targets', methods: ['GET'], permission: 'planning:targets:read' },
      { route: '/api/v1/monitoring/deviations', methods: ['GET'], permission: 'monitoring:deviations:read' },
    ],
    can: (permission: string) => ['planning:targets:read', 'planning:revisions:read', 'planning:operational-plans:read'].includes(permission) || (grants.comparison && permission === 'monitoring:deviations:read'),
  }),
}));

function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><PlannedVsActualPanel revisionId="rev-2" /></QueryClientProvider>);
}

afterEach(cleanup);

describe('HWEB-010-05 planned-vs-actual panel', () => {
  beforeEach(() => {
    grants.comparison = true;
    hidraHttpClient.mockReset();
    hidraHttpClient.mockImplementation(async (config: { url?: string; params?: Record<string, unknown> }) => {
      if (config.url === '/api/v1/planning/revisions/rev-2') return { id: 'rev-2', planId: 'plan-1', status: 'APPROVED' };
      if (config.url === '/api/v1/planning/operational-plans/plan-1') return { id: 'plan-1', currentRevisionId: 'rev-2', approvedRevisionId: 'rev-2' };
      if (config.url === '/api/v1/planning/targets/target-1') return { id: 'target-1', revisionId: 'rev-2', unitId: 'm3/h', status: 'ACTIVE', telemetryPointId: 'point-1' };
      if (config.url === '/api/v1/planning/targets') {
        expect(config.params).toEqual({ revisionId: 'rev-2', page: 0, size: 50 });
        return {
          content: [{ id: 'target-1', revisionId: 'rev-2', telemetryPointId: 'point-1', telemetryPointCodeSnapshot: 'PT-001', targetValue: 100, unitId: 'm3/h', status: 'ACTIVE' }],
          page: 0,
          size: 50,
          totalElements: 1,
          totalPages: 1,
          hasNext: false,
        };
      }
      if (config.url === '/api/v1/monitoring/deviations') {
        expect(config.params).toEqual({ planTargetId: 'target-1', page: 0, size: 50 });
        return {
          content: [{ id: 'dev-1', planTargetId: 'target-1', trustedTelemetryReadingId: 'reading-9', telemetryPointId: 'point-1', actualValue: 105, expectedValue: 100, differenceValue: 5, differencePercent: 5, unitId: 'm3/h', severity: 'HIGH', status: 'OPEN', detectedAt: '2026-09-12T10:30:00Z' }],
          page: 0,
          size: 50,
          totalElements: 1,
          totalPages: 1,
          hasNext: false,
        };
      }
      throw new Error(`Unexpected request ${config.url}`);
    });
  });

  it('queries monitoring by exact planTargetId and renders backend comparison values without recomputing them', async () => {
    renderPanel();

    const targetSelect = await screen.findByLabelText('Plan target');
    fireEvent.mouseDown(targetSelect);
    fireEvent.click(await screen.findByText(/target-1 · PT-001 · 100 m3\/h/));

    await waitFor(() => expect(hidraHttpClient).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v1/monitoring/deviations',
      params: { planTargetId: 'target-1', page: 0, size: 50 },
    }));

    expect(await screen.findByText('105')).toBeInTheDocument();
    expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('m3/h')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getByText('reading-9')).toBeInTheDocument();
  });

it('does not issue a Monitoring request when the published grant is absent', async () => {
  grants.comparison = false;
  renderPanel();
  fireEvent.mouseDown(await screen.findByLabelText('Plan target'));
  fireEvent.click(await screen.findByText(/target-1 · PT-001/));
  expect(await screen.findByText(/do not allow monitoring-deviation reads/)).toBeInTheDocument();
  expect(hidraHttpClient.mock.calls.some(([config]) => config.url === '/api/v1/monitoring/deviations')).toBe(false);
});

});
