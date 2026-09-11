import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    { route: '/api/v1/incident/incidents', methods: ['GET'], module: 'incident', resource: 'incidents', action: 'read', permission: 'incident:incidents:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/leakdetection/candidates', methods: ['GET'], module: 'leakdetection', resource: 'candidates', action: 'read', permission: 'leakdetection:candidates:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/leakdetection/cases', methods: ['GET'], module: 'leakdetection', resource: 'cases', action: 'read', permission: 'leakdetection:cases:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/hse/cases', methods: ['GET'], module: 'hse', resource: 'cases', action: 'read', permission: 'hse:cases:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/hse/capas', methods: ['GET'], module: 'hse', resource: 'capas', action: 'read', permission: 'hse:capas:read', enforcementStatus: 'backend-enforced' },
  ];
  const incident = {
    id: 'inc-1', incidentNumber: 'INC-2026-001', title: 'Pipeline pressure event', description: 'Operational incident under investigation.',
    status: 'OPEN', sourceType: 'ALARM', severityId: 'SEV-2', priorityId: 'P1', topologyAssetId: 'PIPE-1', topologyAssetCode: 'PL-001',
    topologyAssetName: 'Pipeline Nord', responsibleActorId: 'actor-1', responsibleActorName: 'Operator One', workflowInstanceId: 'wf-1',
    occurredAt: '2026-09-11T10:00:00Z', updatedAt: '2026-09-11T11:00:00Z', currentEscalationLevel: 1,
  };
  const candidate = {
    id: 'cand-1', candidateNumber: 'LKC-001', status: 'OPEN', severityLevel: 'HIGH', confidenceScore: 0.91,
    topologyAssetId: 'PIPE-1', topologyAssetCode: 'PL-001', topologyAssetName: 'Pipeline Nord', suspectedAt: '2026-09-11T10:05:00Z',
    firstEvidenceAt: '2026-09-11T10:04:00Z', runId: 'run-1', profileId: 'profile-1', summary: 'Pressure imbalance candidate', correlationId: 'corr-leak-1', updatedAt: '2026-09-11T11:05:00Z',
  };
  const leakCase = {
    id: 'case-1', caseNumber: 'LEAK-001', primaryCandidateId: 'cand-1', topologyAssetId: 'PIPE-1', topologyAssetCode: 'PL-001',
    owningOrganizationUnitId: 'org-1', status: 'OPEN', severityLevel: 'HIGH', confidenceScore: 0.95, openedAt: '2026-09-11T10:10:00Z',
    openedByActorId: 'actor-2', correlationId: 'corr-leak-1', updatedAt: '2026-09-11T11:10:00Z',
  };
  const hseCase = {
    id: 'hse-1', caseNumber: 'HSE-2026-001', title: 'Pipeline release investigation', description: 'HSE investigation linked to the operational incident.',
    caseTypeId: 'ENVIRONMENTAL', severityId: 'SEV-2', priorityId: 'P1', status: 'OPEN', sourceType: 'INCIDENT', incidentReferenceId: 'inc-1',
    incidentCodeSnapshot: 'INC-2026-001', incidentTitleSnapshot: 'Pipeline pressure event', targetModule: 'topology', targetTypeCode: 'PIPELINE', targetId: 'PIPE-1',
    targetCodeSnapshot: 'PL-001', targetLabelSnapshot: 'Pipeline Nord', reportedByActorId: 'actor-3', reportedByDisplayNameSnapshot: 'HSE Officer',
    responsibleOrganizationUnitId: 'org-hse', responsibleOrganizationUnitNameSnapshot: 'HSE Department', workflowInstanceId: 'wf-hse-1', auditReferenceId: 'audit-hse-1',
    occurredAt: '2026-09-11T10:00:00Z', reportedAt: '2026-09-11T10:30:00Z', updatedAt: '2026-09-11T11:30:00Z',
  };
  const capa = {
    id: 'capa-1', hseCaseId: 'hse-1', actionNumber: 'CAPA-001', actionTypeId: 'CORRECTIVE', title: 'Inspect isolation valves', description: 'Verify isolation integrity.',
    ownerActorId: 'actor-4', ownerDisplayNameSnapshot: 'Maintenance Lead', ownerOrganizationUnitId: 'org-maint', ownerOrganizationUnitNameSnapshot: 'Maintenance',
    targetDate: '2026-09-15T00:00:00Z', verificationRequired: true, status: 'OPEN', linkedWorkOrderId: 'wo-1', workflowTaskId: 'task-hse-1', updatedAt: '2026-09-11T11:40:00Z',
  };
  return {
    routes,
    permissions: ['incident:incidents:read', 'leakdetection:candidates:read', 'leakdetection:cases:read', 'hse:cases:read', 'hse:capas:read'],
    incident, candidate, leakCase, hseCase, capa,
  };
});

const hidraHttpClient = vi.hoisted(() => vi.fn(async (config: { url?: string; method?: string }) => {
  if (config.url?.endsWith('/security/permissions/catalog')) return { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes: fixtures.routes };
  if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
  if (config.url?.endsWith('/identity/me/permissions')) return fixtures.permissions;
  if (config.url === '/api/v1/incident/incidents' && config.method === 'GET') return { content: [fixtures.incident], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  if (config.url === '/api/v1/incident/incidents/inc-1' && config.method === 'GET') return fixtures.incident;
  if (config.url === '/api/v1/leakdetection/candidates' && config.method === 'GET') return { content: [fixtures.candidate], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  if (config.url === '/api/v1/leakdetection/candidates/cand-1' && config.method === 'GET') return fixtures.candidate;
  if (config.url === '/api/v1/leakdetection/cases' && config.method === 'GET') return { content: [fixtures.leakCase], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  if (config.url === '/api/v1/leakdetection/cases/case-1' && config.method === 'GET') return fixtures.leakCase;
  if (config.url === '/api/v1/hse/cases' && config.method === 'GET') return { content: [fixtures.hseCase], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  if (config.url === '/api/v1/hse/cases/hse-1' && config.method === 'GET') return fixtures.hseCase;
  if (config.url === '/api/v1/hse/capas' && config.method === 'GET') return { content: [fixtures.capa], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  if (config.url === '/api/v1/hse/capas/capa-1' && config.method === 'GET') return fixtures.capa;
  throw new Error(`Unexpected request ${config.method} ${config.url}`);
}));

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient }));

describe('HWEB-009 events workspace', () => {
  beforeEach(() => {
    hidraHttpClient.mockClear();
    window.history.replaceState({}, '', '/overview');
  });

  it('loads backend-governed incident, leak, HSE and CAPA reads', async () => {
    render(<AppProviders><App /></AppProviders>);

    fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Événements & incidents' }));

    expect(await screen.findByRole('heading', { name: 'Events & Incidents' })).toBeInTheDocument();
    expect(await screen.findByText('INC-2026-001')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('Operator One')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Leak detection' }));
    expect(await screen.findByText('LKC-001')).toBeInTheDocument();
    expect(screen.getByText('LEAK-001')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Open' })[0]);
    expect(await screen.findByText('Pressure imbalance candidate')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Open' })[1]);
    expect(await screen.findByText('actor-2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'HSE' }));
    expect(await screen.findByText('HSE-2026-001')).toBeInTheDocument();
    expect(screen.getByText('CAPA-001')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Open' })[0]);
    expect(await screen.findByText('HSE Officer')).toBeInTheDocument();
    expect(screen.getByText('audit-hse-1')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Open' })[1]);
    expect(await screen.findByText('Maintenance Lead')).toBeInTheDocument();
    expect(screen.getByText('wo-1')).toBeInTheDocument();
    expect(screen.getByText('task-hse-1')).toBeInTheDocument();
  });
});
