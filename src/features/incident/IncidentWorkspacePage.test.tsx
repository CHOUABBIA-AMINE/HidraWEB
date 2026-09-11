import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    { route: '/api/v1/incident/incidents', methods: ['GET'], module: 'incident', resource: 'incidents', action: 'read', permission: 'incident:incidents:read', enforcementStatus: 'backend-enforced' },
  ];
  const incident = {
    id: 'inc-1', incidentNumber: 'INC-2026-001', title: 'Pipeline pressure event', description: 'Operational incident under investigation.',
    status: 'OPEN', sourceType: 'ALARM', severityId: 'SEV-2', priorityId: 'P1', topologyAssetId: 'PIPE-1', topologyAssetCode: 'PL-001',
    topologyAssetName: 'Pipeline Nord', responsibleActorId: 'actor-1', responsibleActorName: 'Operator One', workflowInstanceId: 'wf-1',
    occurredAt: '2026-09-11T10:00:00Z', updatedAt: '2026-09-11T11:00:00Z', currentEscalationLevel: 1,
  };
  return { routes, permissions: ['incident:incidents:read'], incident };
});

const hidraHttpClient = vi.hoisted(() => vi.fn(async (config: { url?: string; method?: string }) => {
  if (config.url?.endsWith('/security/permissions/catalog')) return { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes: fixtures.routes };
  if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
  if (config.url?.endsWith('/identity/me/permissions')) return fixtures.permissions;
  if (config.url === '/api/v1/incident/incidents' && config.method === 'GET') return { content: [fixtures.incident], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  if (config.url === '/api/v1/incident/incidents/inc-1' && config.method === 'GET') return fixtures.incident;
  throw new Error(`Unexpected request ${config.method} ${config.url}`);
}));

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient }));

describe('HWEB-009 incident workspace', () => {
  beforeEach(() => {
    hidraHttpClient.mockClear();
    window.history.replaceState({}, '', '/overview');
  });

  it('loads the backend-governed incident register and detail while leaving leak/HSE reads blocked', async () => {
    render(<AppProviders><App /></AppProviders>);

    fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Événements & incidents' }));

    expect(await screen.findByRole('heading', { name: 'Events & Incidents' })).toBeInTheDocument();
    expect(await screen.findByText('INC-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Pipeline pressure event')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('Operator One')).toBeInTheDocument();
    expect(screen.getByText('wf-1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Leak detection' }));
    expect(await screen.findByText(/issue #63/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'HSE' }));
    expect(await screen.findByText(/issue #64/)).toBeInTheDocument();
  });
});
