import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    { route: '/api/v1/telemetry/points/{pointId}/readings', methods: ['GET'], module: 'telemetry', resource: 'points', action: 'read', permission: 'telemetry:points:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/telemetry/reference/reading-states', methods: ['GET'], module: 'telemetry', resource: 'reference', action: 'read', permission: 'telemetry:reference:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/monitoring/rules', methods: ['GET'], module: 'monitoring', resource: 'rules', action: 'read', permission: 'monitoring:rules:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/monitoring/deviations', methods: ['GET'], module: 'monitoring', resource: 'deviations', action: 'read', permission: 'monitoring:deviations:read', enforcementStatus: 'backend-enforced' },
  ];
  const permissions = ['telemetry:points:read', 'telemetry:reference:read', 'monitoring:rules:read', 'monitoring:deviations:read'];
  const reading = { id: 'r-1', pointId: 'PT-1', numericValue: 42.5, unitId: 'bar', qualityCodeId: 'GOOD', state: 'TRUSTED', sourceTimestamp: '2026-09-11T12:00:00Z' };
  return { routes, permissions, reading };
});

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: vi.fn(async (config: { url?: string }) => {
    if (config.url?.endsWith('/security/permissions/catalog')) return { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes: fixtures.routes };
    if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
    if (config.url?.endsWith('/identity/me/permissions')) return fixtures.permissions;
    if (config.url === '/api/v1/telemetry/reference/reading-states') return ['TRUSTED'];
    if (config.url === '/api/v1/telemetry/reference/quality-codes') return [{ id: 'GOOD', code: 'GOOD', translations: {}, active: true }];
    if (config.url === '/api/v1/monitoring/rules') return { content: [{ id: 'rule-1', code: 'PRESSURE-HIGH', status: 'ACTIVE', ruleType: 'THRESHOLD', topologyAssetCode: 'FAC-1' }], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
    if (config.url === '/api/v1/monitoring/deviations') return { content: [{ id: 'dev-1', severity: 'HIGH', status: 'OPEN', topologyAssetCode: 'FAC-1', reasonCode: 'PRESSURE_HIGH', detectedAt: '2026-09-11T12:01:00Z' }], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
    if (config.url === '/api/v1/telemetry/points/PT-1/readings/latest') return fixtures.reading;
    if (config.url === '/api/v1/telemetry/points/PT-1/readings') return { content: [fixtures.reading], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
    if (config.url === '/api/v1/telemetry/points/PT-1/trend') return [fixtures.reading, { ...fixtures.reading, id: 'r-2', numericValue: 43.1, sourceTimestamp: '2026-09-11T12:02:00Z' }];
    throw new Error(`Unexpected request ${config.url}`);
  }),
}));

describe('HWEB-006 telemetry monitoring workspace', () => {
  it('loads monitoring and a selected telemetry point without inventing point discovery', async () => {
    render(<AppProviders><App /></AppProviders>);

    fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('heading', { name: /Vue d/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Opérations' }));

    expect(await screen.findByRole('heading', { name: 'Opérations · télémétrie & surveillance' })).toBeInTheDocument();
    expect(await screen.findByText('PRESSURE-HIGH')).toBeInTheDocument();
    expect(await screen.findByText('PRESSURE_HIGH')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Identifiant du point de télémétrie'), { target: { value: 'PT-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Charger le point' }));

    expect(await screen.findByText('42.5')).toBeInTheDocument();
    expect(screen.getAllByText('TRUSTED').length).toBeGreaterThan(0);
    expect(window.location.pathname).toBe('/operations');
  });
});
