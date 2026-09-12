import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    { route: '/api/v1/planning/periods', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/planning/periods/{id}', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/planning/operational-plans', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/planning/operational-plans/{id}', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/planning/revisions', methods: ['GET'], module: 'planning', resource: 'revisions', action: 'read', permission: 'planning:revisions:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/planning/revisions/{id}', methods: ['GET'], module: 'planning', resource: 'revisions', action: 'read', permission: 'planning:revisions:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/planning/revisions/{revisionId}/approval', methods: ['GET'], module: 'planning', resource: 'revisions', action: 'read', permission: 'planning:revisions:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/planning/revisions/{revisionId}/approval/actions/{transitionId}/execute', methods: ['POST'], module: 'planning', resource: 'revisions', action: 'execute', permission: 'planning:revisions:execute', enforcementStatus: 'backend-enforced' },
  ];
  const period = { id: 'period-1', code: 'PLN-2026-Q4', nameFr: 'Planification T4 2026', nameEn: 'Q4 2026 Planning', periodStart: '2026-10-01T00:00:00Z', periodEnd: '2026-12-31T23:59:59Z', timeZone: 'Africa/Algiers', status: 'OPEN', periodTypeId: 'QUARTER', createdByActorId: 'planner-1', createdAt: '2026-09-12T08:00:00Z', updatedAt: '2026-09-12T09:00:00Z' };
  const plan = { id: 'plan-1', periodId: 'period-1', code: 'OP-2026-Q4-NORTH', nameFr: 'Plan Nord T4', nameEn: 'North Q4 Plan', topologyScopeType: 'PIPELINE', topologyScopeId: 'pipe-1', topologyScopeCode: 'PL-NORTH', topologyScopeNameSnapshot: 'Pipeline Nord', status: 'DRAFT', currentRevisionId: 'rev-2', approvedRevisionId: 'rev-1', responsibleOrganizationUnitId: 'org-trc', createdByActorId: 'planner-1', createdAt: '2026-09-12T08:30:00Z', updatedAt: '2026-09-12T09:30:00Z' };
  const revision = { id: 'rev-2', planId: 'plan-1', revisionNumber: 2, revisionCode: 'R02', baseRevisionId: 'rev-1', status: 'SUBMITTED', changeReasonCodeId: 'OPS_CHANGE', changeReasonText: 'Updated throughput assumptions', submittedAt: '2026-09-12T10:00:00Z', submittedByActorId: 'planner-2', workflowInstanceId: 'wf-plan-2', createdAt: '2026-09-12T09:45:00Z', updatedAt: '2026-09-12T10:00:00Z' };
  const approval = {
    revisionId: 'rev-2',
    revisionStatus: 'SUBMITTED',
    workflowInstanceId: 'wf-plan-2',
    workflowInstanceStatus: 'IN_PROGRESS',
    currentTaskId: 'task-plan-2',
    currentTaskUpdatedAt: '2026-09-12T10:05:00Z',
    actions: [{ transitionId: 'transition-approve', decision: 'APPROVE', reasonRequired: false, commentRequired: true, requiredPermissionCode: 'planning:revisions:approve', permitted: true }],
  };
  const state: { executeRequest?: unknown } = {};
  return {
    routes,
    period,
    plan,
    revision,
    approval,
    state,
    permissions: ['planning:periods:read', 'planning:operational-plans:read', 'planning:revisions:read', 'planning:revisions:execute', 'planning:revisions:approve'],
  };
});

const hidraHttpClient = vi.hoisted(() => vi.fn(async (config: { url?: string; method?: string; params?: Record<string, unknown>; data?: unknown }) => {
  if (config.url?.endsWith('/security/permissions/catalog')) return { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes: fixtures.routes };
  if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
  if (config.url?.endsWith('/identity/me/permissions')) return fixtures.permissions;
  if (config.url === '/api/v1/planning/periods' && config.method === 'GET') return { content: [fixtures.period], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  if (config.url === '/api/v1/planning/periods/period-1' && config.method === 'GET') return fixtures.period;
  if (config.url === '/api/v1/planning/operational-plans' && config.method === 'GET') return { content: [fixtures.plan], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  if (config.url === '/api/v1/planning/operational-plans/plan-1' && config.method === 'GET') return fixtures.plan;
  if (config.url === '/api/v1/planning/revisions' && config.method === 'GET' && config.params?.planId === 'plan-1') return { content: [fixtures.revision], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  if (config.url === '/api/v1/planning/revisions/rev-2' && config.method === 'GET') return fixtures.revision;
  if (config.url === '/api/v1/planning/revisions/rev-2/approval' && config.method === 'GET') return fixtures.approval;
  if (config.url === '/api/v1/planning/revisions/rev-2/approval/actions/transition-approve/execute' && config.method === 'POST') {
    fixtures.state.executeRequest = config.data;
    return { revisionId: 'rev-2', revisionStatus: 'APPROVED', workflowInstanceId: 'wf-plan-2', workflowInstanceStatus: 'COMPLETED', transitionId: 'transition-approve', decision: 'APPROVE', executedAt: '2026-09-12T10:06:00Z' };
  }
  throw new Error(`Unexpected request ${config.method} ${config.url}`);
}));

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient }));

describe('HWEB-010 planning workspace', () => {
  beforeEach(() => {
    hidraHttpClient.mockClear();
    fixtures.state.executeRequest = undefined;
    window.history.replaceState({}, '', '/overview');
  });

  it('loads planning revision approval from the authoritative revision-scoped backend contract and executes a published action', async () => {
    render(<AppProviders><App /></AppProviders>);
    fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'planner' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Planification' }));

    expect(await screen.findByText('PLN-2026-Q4')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Operational plans' }));
    expect(await screen.findByText('OP-2026-Q4-NORTH')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(await screen.findByRole('heading', { name: 'Revision history' })).toBeInTheDocument();
    expect(await screen.findByText('R02')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open revision' }));

    expect(await screen.findByRole('heading', { name: 'Revision approval' })).toBeInTheDocument();
    expect(await screen.findByText('task-plan-2')).toBeInTheDocument();
    expect(screen.getByText('2026-09-12T10:05:00Z')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'APPROVE' }));
    fireEvent.change(screen.getByLabelText('Comment'), { target: { value: 'Approved against current operating assumptions.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Execute APPROVE' }));

    expect(await screen.findByText('APPROVE · revision APPROVED')).toBeInTheDocument();
    await waitFor(() => expect(fixtures.state.executeRequest).toEqual({
      expectedTaskUpdatedAt: '2026-09-12T10:05:00Z',
      commentText: 'Approved against current operating assumptions.',
      reasonId: undefined,
      decisionNote: undefined,
      correlationId: undefined,
    }));
  });
});
