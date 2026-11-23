import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { i18n } from '@/shared/i18n/i18n';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { TrustedAssetMonitoring } from './TrustedAssetMonitoring';

const { pointsRoute, access } = vi.hoisted(() => {
  const pointsRoute = '/api/v1/telemetry/assets/{assetType}/{assetId}/points';
  return { pointsRoute, access: { canRead: true } };
});
vi.mock('@/app/auth/useAuth', () => ({
  useAuth: () => ({ status: 'authenticated', session: { principal: { userId: 'reader' } } }),
}));
vi.mock('@/features/permissions/usePermissions', () => ({
  usePermissions: () => ({
    status: 'ready',
    can: (permission: string) => permission === 'telemetry:assets:read' && access.canRead,
    routes: [pointsRoute, pointsRoute + '/{pointId}/trusted-readings/latest',
      pointsRoute + '/{pointId}/trusted-readings/history'].map(route => ({
      route, module: 'telemetry', permission: 'telemetry:assets:read', methods: ['GET'],
    })),
  }),
}));
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: vi.fn() }));

const facility = { scopeId: 1, principalId: 'reader', companyPartyId: 'company-a', type: 'FACILITY', targetId: 'station-a' };
const root = '/api/v1/telemetry/assets/FACILITY/station-a/points';
const at = '2026-01-01T00:00:00.123456Z';
const binding = { id: 'binding-a' };

function renderMonitoring() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>
    <I18nextProvider i18n={i18n}><TrustedAssetMonitoring /></I18nextProvider>
  </QueryClientProvider>);
}

afterEach(() => {
  cleanup();
  useShellUiStore.getState().setOperationalContext(undefined);
  vi.resetAllMocks();
  access.canRead = true;
});

describe('UXR-24 trusted monitoring', () => {
  it('uses the owner discovery and history cursors and drops evidence when the scope changes', async () => {
    useShellUiStore.getState().setOperationalContext(facility);
    vi.mocked(hidraHttpClient).mockImplementation(async ({ url, params }) => {
      if (url === root) return params.afterPointId
        ? { at, points: [{ pointId: 'point-b', binding }] }
        : { at, points: [{ pointId: 'point-a', binding }], nextPointId: 'point-a' };
      if (url === root + '/point-b/trusted-readings/latest') return {
        status: 'STALE', maxAgeSeconds: 120,
        observation: { numericValue: 44, unitId: 'bar', ageSeconds: 130, freshness: 'STALE', binding },
      };
      if (url === root + '/point-b/trusted-readings/history') return params.afterTrustedId
        ? { observations: [{ trustedId: 'trusted-b', numericValue: 41, unitId: 'bar', binding }] }
        : { observations: [{ trustedId: 'trusted-a', numericValue: 42, unitId: 'bar', binding }],
          next: { observedAt: at, trustedId: 'trusted-a' } };
      if (url === '/api/v1/telemetry/assets/EQUIPMENT/equipment-b/points') {
        throw Error('Resource unavailable');
      }
      throw Error(`Unexpected request ${url}`);
    });
    renderMonitoring();
    const next = await screen.findByRole('button', { name: 'Page suivante' });
    fireEvent.click(next);
    await waitFor(() => expect(hidraHttpClient).toHaveBeenCalledWith(expect.objectContaining({
      url: root, params: { companyPartyId: 'company-a', limit: '20', at, afterPointId: 'point-a' },
    })));
    const point = screen.getByRole('combobox', { name: 'Point mis en service' });
    await waitFor(() => expect(point).not.toHaveAttribute('aria-disabled', 'true'));
    fireEvent.mouseDown(point);
    fireEvent.click(await screen.findByRole('option', { name: 'point-b' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Âge maximal (secondes)' }), { target: { value: '120' } });
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer le seuil' }));
    expect(await screen.findByText(/44 bar.*STALE.*130 s.*binding-a/)).toBeInTheDocument();
    expect(hidraHttpClient).toHaveBeenCalledWith(expect.objectContaining({
      url: root + '/point-b/trusted-readings/latest', params: { companyPartyId: 'company-a', maxAgeSeconds: '120' },
    }));
    fireEvent.change(screen.getByLabelText('Depuis'), { target: { value: '2026-01-01T00:00' } });
    fireEvent.change(screen.getByLabelText('Jusqu’à'), { target: { value: '2026-01-02T00:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Historique' }));
    expect(await screen.findByText(/42 bar/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Page suivante' }));
    expect(await screen.findByText(/41 bar/)).toBeInTheDocument();
    expect(hidraHttpClient).toHaveBeenCalledWith(expect.objectContaining({
      url: root + '/point-b/trusted-readings/history',
      params: expect.objectContaining({ companyPartyId: 'company-a', afterObservedAt: at, afterTrustedId: 'trusted-a' }),
    }));
    act(() => useShellUiStore.getState().setOperationalContext({
      ...facility, scopeId: 2, companyPartyId: 'company-b', type: 'EQUIPMENT', targetId: 'equipment-b',
    }));
    expect(screen.queryByText(/44 bar|41 bar/)).toBeNull();
    expect(await screen.findByText('Impossible de charger les données depuis HidraAPI.')).toBeInTheDocument();
    expect(hidraHttpClient).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/v1/telemetry/assets/EQUIPMENT/equipment-b/points',
      params: { companyPartyId: 'company-b', limit: '20' },
    }));
    expect(vi.mocked(hidraHttpClient).mock.calls.every(([request]) => request.url?.includes('/telemetry/assets/'))).toBe(true);
  });

  it('does not query when the selected scope belongs to another principal or the read grant is absent', () => {
    useShellUiStore.getState().setOperationalContext({ ...facility, principalId: 'another-user' });
    const view = renderMonitoring();
    expect(screen.getByText('Sélectionnez un contexte opérationnel autorisé.')).toBeInTheDocument();
    access.canRead = false;
    act(() => useShellUiStore.getState().setOperationalContext(facility));
    expect(view.container).toBeEmptyDOMElement();
    expect(hidraHttpClient).not.toHaveBeenCalled();
  });
});
