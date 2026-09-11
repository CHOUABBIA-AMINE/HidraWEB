import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    { route: '/api/v1/planning/periods', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/planning/periods/{id}', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/planning/operational-plans', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/planning/operational-plans/{id}', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
  ];
  const period = {
    id: 'period-1',
    code: 'PLN-2026-Q4',
    nameFr: 'Planification T4 2026',
    nameEn: 'Q4 2026 Planning',
    periodStart: '2026-10-01T00:00:00Z',
    periodEnd: '2026-12-31T23:59:59Z',
    timeZone: 'Africa/Algiers',
    status: 'OPEN',
    periodTypeId: 'QUARTER',
    createdByActorId: 'planner-1',
    createdAt: '2026-09-12T08:00:00Z',
    updatedAt: '2026-09-12T09:00:00Z',
  };
  const plan = {
    id: 'plan-1',
    periodId: 'period-1',
    code: 'OP-2026-Q4-NORTH',
    nameFr: 'Plan Nord T4',
    nameEn: 'North Q4 Plan',
    topologyScopeType: 'PIPELINE',
    topologyScopeId: 'pipe-1',
    topologyScopeCode: 'PL-NORTH',
    topologyScopeNameSnapshot: 'Pipeline Nord',
    status: 'DRAFT',
    currentRevisionId: 'rev-1',
    approvedRevisionId: undefined,
    responsibleOrganizationUnitId: 'org-trc',
    createdByActorId: 'planner-1',
    createdAt: '2026-09-12T08:30:00Z',
    updatedAt: '2026-09-12T09:30:00Z',
  };
  return { routes, period, plan, permissions: ['planning:periods:read', 'planning:operational-plans:read'] };
});

const hidraHttpClient = vi.hoisted(() => vi.fn(async (config: { url?: string; method?: string }) => {
  if (config.url?.endsWith('/security/permissions/catalog')) {
    return { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes: fixtures.routes };
  }
  if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
  if (config.url?.endsWith('/identity/me/permissions')) return fixtures.permissions;
  if (config.url === '/api/v1/planning/periods' && config.method === 'GET') {
    return { content: [fixtures.period], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  }
  if (config.url === '/api/v1/planning/periods/period-1' && config.method === 'GET') return fixtures.period;
  if (config.url === '/api/v1/planning/operational-plans' && config.method === 'GET') {
    return { content: [fixtures.plan], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  }
  if (config.url === '/api/v1/planning/operational-plans/plan-1' && config.method === 'GET') return fixtures.plan;
  throw new Error(`Unexpected request ${config.method} ${config.url}`);
}));

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient }));

describe('HWEB-010 planning workspace', () => {
  beforeEach(() => {
    hidraHttpClient.mockClear();
    window.history.replaceState({}, '', '/overview');
  });

  it('loads planning period and operational plan list/detail reads from HidraAPI', async () => {
    render(<AppProviders><App /></AppProviders>);

    fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'planner' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Planification' }));

    expect(await screen.findByRole('heading', { name: 'Planning' })).toBeInTheDocument();
    expect(await screen.findByText('PLN-2026-Q4')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('planner-1')).toBeInTheDocument();
    expect(screen.getByText('QUARTER')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Operational plans' }));
    expect(await screen.findByText('OP-2026-Q4-NORTH')).toBeInTheDocument();
    expect(screen.getByText('Pipeline Nord')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('rev-1')).toBeInTheDocument();
    expect(screen.getByText('org-trc')).toBeInTheDocument();
  });
});
