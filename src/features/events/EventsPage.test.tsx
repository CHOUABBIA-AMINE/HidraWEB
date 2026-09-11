import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    { route: '/api/v1/incident/incidents', methods: ['GET'], module: 'incident', resource: 'incidents', action: 'read', permission: 'incident:incidents:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/incident/incidents/{id}', methods: ['GET'], module: 'incident', resource: 'incidents', action: 'read', permission: 'incident:incidents:read', enforcementStatus: 'backend-enforced' },
  ];
  const incident = {
    id: 'inc-1',
    incidentNumber: 'INC-2026-001',
    title: 'Pipeline pressure event',
    description: 'Pressure deviation under operational assessment.',
    status: 'OPEN', severityId: 'SEV-2', priorityId: 'P2', sourceType: 'ALARM', sourceReferenceCode: 'ALM-42',
    detectedAt: '2026-09-11T09:00:00Z', reportedAt: '2026-09-11T09:04:00Z',
    topologyAssetId: 'pipe-1', topologyAssetCode: 'PL-001', topologyAssetName: 'Pipeline Nord',
    responsibleOrganizationUnitCode: 'OPS-NORTH', responsibleOrganizationUnitName: 'North Operations',
    responsibleActorId: 'actor-1', responsibleActorName: 'Operator A', workflowInstanceId: 'wf-1', currentEscalationLevel: 1,
    createdAt: '2026-09-11T09:04:00Z', updatedAt: '2026-09-11T09:10:00Z',
  };
  return { routes, incident };
});

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: vi.fn(async (config: { url?: string; method?: string; params?: unknown }) => {
    if (config.url?.endsWith('/security/permissions/catalog')) return { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes: fixtures.routes };
    if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
    if (config.url?.endsWith('/identity/me/permissions')) return ['incident:incidents:read'];
    if (config.url === '/api/v1/incident/incidents') return { content: [fixtures.incident], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
    if (config.url === '/api/v1/incident/incidents/inc-1') return fixtures.incident;
    throw new Error(`Unexpected request ${config.method ?? 'GET'} ${config.url}`);
  }),
}));

describe('HWEB-009 events workspace', () => {
  it('loads the authoritative incident register/detail and keeps leak/HSE reads explicitly blocked', async () => {
    render(<AppProviders><App /></AppProviders>);

    fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('heading', { name: /Vue d/ })).toBeInTheDocument();
    const eventsNavigation = screen.getAllByRole('button', { name: 'Événements & incidents' }).find((button) => !button.hasAttribute('disabled') && button.getAttribute('aria-disabled') !== 'true');
    expect(eventsNavigation).toBeDefined();
    fireEvent.click(eventsNavigation!);

    expect(await screen.findByRole('heading', { name: 'Événements et incidents' })).toBeInTheDocument();
    expect(await screen.findByText('Pipeline pressure event')).toBeInTheDocument();
    expect(screen.getByText('INC-2026-001')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir' }));
    expect(await screen.findByText('Pressure deviation under operational assessment.')).toBeInTheDocument();
    expect(await screen.findByText('North Operations')).toBeInTheDocument();

    await waitFor(() => expect(vi.mocked(hidraHttpClient)).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET', url: '/api/v1/incident/incidents', params: { page: 0, size: 50 },
    })));
    expect(vi.mocked(hidraHttpClient)).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET', url: '/api/v1/incident/incidents/inc-1' }));

    fireEvent.click(screen.getByRole('tab', { name: 'Cas de fuite' }));
    expect(await screen.findByText(/gap backend #63/)).toBeInTheDocument();
    expect(vi.mocked(hidraHttpClient).mock.calls.some(([config]) => String((config as { url?: string }).url).includes('/leakdetection/'))).toBe(false);

    fireEvent.click(screen.getByRole('tab', { name: 'HSE' }));
    expect(await screen.findByText(/gap backend #64/)).toBeInTheDocument();
    expect(vi.mocked(hidraHttpClient).mock.calls.some(([config]) => String((config as { url?: string }).url).includes('/hse/'))).toBe(false);
    expect(window.location.pathname).toBe('/events');
  });
});
