import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WorkbenchDetailPanel } from '@/features/workbench/components/WorkbenchDetailPanel';
import { i18n } from '@/shared/i18n/i18n';

const fixture = vi.hoisted(() => ({
  granted: true,
  failing: false,
  recordId: 'record-1',
  readCalls: 0,
}));
vi.mock('@/features/permissions/usePermissions', () => ({
  usePermissions: () => ({
    status: 'ready',
    can: () => fixture.granted,
  }),
}));
vi.mock('@/features/workbench/api/workbenchApi', () => ({
  workbenchQueryKeys: { detail: (m: string, r: string, id: string) => [m, r, id] },
  fetchWorkbenchRecord: async (module: string, resource: string) => {
    fixture.readCalls += 1;
    if (fixture.failing) throw { status: 403, message: 'Resource forbidden' };
    return {
      module, resource, id: fixture.recordId, attributes: { secret: 'Owner-issued value' },
    };
  },
}));
afterEach(() => {
  cleanup();
  fixture.granted = true;
  fixture.failing = false;
  fixture.recordId = 'record-1';
  fixture.readCalls = 0;
});

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <WorkbenchDetailPanel module="alarm" resource="events" id="record-1" />
      </QueryClientProvider>
    </I18nextProvider>,
  );
}

describe('UXR-14 fresh owner detail admission', () => {
  it('reads and shows only exact current owner record', async () => {
    mount();
    expect(await screen.findByText('Owner-issued value')).toBeInTheDocument();
    expect(fixture.readCalls).toBe(1);
  });

  it('never requests or displays detail if the current effective grant is absent', () => {
    fixture.granted = false;
    mount();
    expect(screen.getByText(/La capacité workbench correspondante/)).toBeInTheDocument();
    expect(fixture.readCalls).toBe(0);
    expect(screen.queryByText('Owner-issued value')).not.toBeInTheDocument();
  });

  it('suppresses denied owner detail and does not display a fallback value', async () => {
    fixture.failing = true;
    mount();
    await waitFor(() => expect(fixture.readCalls).toBe(1));
    expect(screen.queryByText('Owner-issued value')).not.toBeInTheDocument();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('rejects a response issued for a different record ID', async () => {
    fixture.recordId = 'another-record';
    mount();
    await waitFor(() => expect(fixture.readCalls).toBe(1));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Owner-issued value')).not.toBeInTheDocument();
  });
});
