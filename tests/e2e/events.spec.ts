import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/incident/incidents', methods: ['GET'], module: 'incident', resource: 'incidents', action: 'read', permission: 'incident:incidents:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/leakdetection/candidates', methods: ['GET'], module: 'leakdetection', resource: 'candidates', action: 'read', permission: 'leakdetection:candidates:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/leakdetection/cases', methods: ['GET'], module: 'leakdetection', resource: 'cases', action: 'read', permission: 'leakdetection:cases:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/hse/cases', methods: ['GET'], module: 'hse', resource: 'cases', action: 'read', permission: 'hse:cases:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/hse/capas', methods: ['GET'], module: 'hse', resource: 'capas', action: 'read', permission: 'hse:capas:read', enforcementStatus: 'backend-enforced' },
];
const effectivePermissions = ['incident:incidents:read', 'leakdetection:candidates:read', 'leakdetection:cases:read', 'hse:cases:read', 'hse:capas:read'];
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
  id: 'case-1', caseNumber: 'LEAK-001', primaryCandidateId: 'cand-1', topologyAssetId: 'PIPE-1', topologyAssetCode: 'PL-001', owningOrganizationUnitId: 'org-1',
  status: 'OPEN', severityLevel: 'HIGH', confidenceScore: 0.95, openedAt: '2026-09-11T10:10:00Z', openedByActorId: 'actor-2', correlationId: 'corr-leak-1', updatedAt: '2026-09-11T11:10:00Z',
};
const hseCase = {
  id: 'hse-1', caseNumber: 'HSE-2026-001', title: 'Pipeline release investigation', description: 'HSE investigation linked to the operational incident.',
  caseTypeId: 'ENVIRONMENTAL', severityId: 'SEV-2', priorityId: 'P1', status: 'OPEN', sourceType: 'INCIDENT', incidentReferenceId: 'inc-1', incidentCodeSnapshot: 'INC-2026-001',
  incidentTitleSnapshot: 'Pipeline pressure event', targetModule: 'topology', targetTypeCode: 'PIPELINE', targetId: 'PIPE-1', targetCodeSnapshot: 'PL-001', targetLabelSnapshot: 'Pipeline Nord',
  reportedByActorId: 'actor-3', reportedByDisplayNameSnapshot: 'HSE Officer', responsibleOrganizationUnitId: 'org-hse', responsibleOrganizationUnitNameSnapshot: 'HSE Department',
  workflowInstanceId: 'wf-hse-1', auditReferenceId: 'audit-hse-1', occurredAt: '2026-09-11T10:00:00Z', reportedAt: '2026-09-11T10:30:00Z', updatedAt: '2026-09-11T11:30:00Z',
};
const capa = {
  id: 'capa-1', hseCaseId: 'hse-1', actionNumber: 'CAPA-001', actionTypeId: 'CORRECTIVE', title: 'Inspect isolation valves', description: 'Verify isolation integrity.',
  ownerActorId: 'actor-4', ownerDisplayNameSnapshot: 'Maintenance Lead', ownerOrganizationUnitId: 'org-maint', ownerOrganizationUnitNameSnapshot: 'Maintenance',
  targetDate: '2026-09-15T00:00:00Z', verificationRequired: true, status: 'OPEN', linkedWorkOrderId: 'wo-1', workflowTaskId: 'task-hse-1', updatedAt: '2026-09-11T11:40:00Z',
};

async function mockEvents(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/incident/incidents?**', (route) => route.fulfill({ json: { content: [incident], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/incident/incidents/inc-1', (route) => route.fulfill({ json: incident }));
  await page.route('**/api/v1/leakdetection/candidates?**', (route) => route.fulfill({ json: { content: [candidate], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/leakdetection/candidates/cand-1', (route) => route.fulfill({ json: candidate }));
  await page.route('**/api/v1/leakdetection/cases?**', (route) => route.fulfill({ json: { content: [leakCase], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/leakdetection/cases/case-1', (route) => route.fulfill({ json: leakCase }));
  await page.route('**/api/v1/hse/cases?**', (route) => route.fulfill({ json: { content: [hseCase], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/hse/cases/hse-1', (route) => route.fulfill({ json: hseCase }));
  await page.route('**/api/v1/hse/capas?**', (route) => route.fulfill({ json: { content: [capa], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/hse/capas/capa-1', (route) => route.fulfill({ json: capa }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-009 exposes published incident, leak, HSE and CAPA reads', async ({ page }) => {
  await mockEvents(page);
  await signIn(page);

  await page.getByRole('button', { name: 'Événements & incidents' }).click();
  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole('heading', { name: 'Events & Incidents' })).toBeVisible();
  await expect(page.getByText('INC-2026-001')).toBeVisible();

  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByText('Operator One')).toBeVisible();
  await expect(page.getByText('Pipeline Nord', { exact: true }).last()).toBeVisible();

  await page.getByRole('tab', { name: 'Leak detection' }).click();
  await expect(page.getByText('LKC-001')).toBeVisible();
  await expect(page.getByText('LEAK-001')).toBeVisible();
  await page.getByRole('button', { name: 'Open' }).first().click();
  await expect(page.getByText('Pressure imbalance candidate')).toBeVisible();
  await page.getByRole('button', { name: 'Open' }).last().click();
  await expect(page.getByText('actor-2')).toBeVisible();

  await page.getByRole('tab', { name: 'HSE' }).click();
  await expect(page.getByText('HSE-2026-001')).toBeVisible();
  await expect(page.getByText('CAPA-001')).toBeVisible();
  await page.getByRole('button', { name: 'Open' }).first().click();
  await expect(page.getByText('HSE Officer')).toBeVisible();
  await expect(page.getByText('audit-hse-1')).toBeVisible();
  await page.getByRole('button', { name: 'Open' }).last().click();
  await expect(page.getByText('wo-1')).toBeVisible();
  await expect(page.getByText('task-hse-1')).toBeVisible();
});
