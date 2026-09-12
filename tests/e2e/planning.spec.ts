import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/planning/periods', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/periods/{id}', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/operational-plans', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/operational-plans/{id}', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/revisions', methods: ['GET'], module: 'planning', resource: 'revisions', action: 'read', permission: 'planning:revisions:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/revisions/{id}', methods: ['GET'], module: 'planning', resource: 'revisions', action: 'read', permission: 'planning:revisions:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/targets', methods: ['GET'], module: 'planning', resource: 'targets', action: 'read', permission: 'planning:targets:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/monitoring/deviations', methods: ['GET'], module: 'monitoring', resource: 'deviations', action: 'read', permission: 'monitoring:deviations:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/revisions/{revisionId}/approval', methods: ['GET'], module: 'planning', resource: 'revisions', action: 'read', permission: 'planning:revisions:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/revisions/{revisionId}/approval/actions/{transitionId}/execute', methods: ['POST'], module: 'planning', resource: 'revisions', action: 'execute', permission: 'planning:revisions:execute', enforcementStatus: 'backend-enforced' },
];
const effectivePermissions = ['planning:periods:read', 'planning:operational-plans:read', 'planning:revisions:read', 'planning:targets:read', 'monitoring:deviations:read', 'planning:revisions:execute', 'planning:revisions:approve'];
const period = { id: 'period-1', code: 'PLN-2026-Q4', nameFr: 'Planification T4 2026', periodStart: '2026-10-01T00:00:00Z', periodEnd: '2026-12-31T23:59:59Z', timeZone: 'Africa/Algiers', status: 'OPEN', periodTypeId: 'QUARTER', createdByActorId: 'planner-1' };
const plan = { id: 'plan-1', periodId: 'period-1', code: 'OP-2026-Q4-NORTH', nameFr: 'Plan Nord T4', topologyScopeType: 'PIPELINE', topologyScopeId: 'pipe-1', topologyScopeCode: 'PL-NORTH', topologyScopeNameSnapshot: 'Pipeline Nord', status: 'DRAFT', currentRevisionId: 'rev-2', approvedRevisionId: 'rev-1', responsibleOrganizationUnitId: 'org-trc', createdByActorId: 'planner-1' };
const revision = { id: 'rev-2', planId: 'plan-1', revisionNumber: 2, revisionCode: 'R02', baseRevisionId: 'rev-1', status: 'SUBMITTED', changeReasonCodeId: 'OPS_CHANGE', changeReasonText: 'Updated throughput assumptions', submittedAt: '2026-09-12T10:00:00Z', submittedByActorId: 'planner-2', workflowInstanceId: 'wf-plan-2' };
const approval = {
  revisionId: 'rev-2',
  revisionStatus: 'SUBMITTED',
  workflowInstanceId: 'wf-plan-2',
  workflowInstanceStatus: 'IN_PROGRESS',
  currentTaskId: 'task-plan-2',
  currentTaskUpdatedAt: '2026-09-12T10:05:00Z',
  actions: [{ transitionId: 'transition-approve', decision: 'APPROVE', reasonRequired: false, commentRequired: true, requiredPermissionCode: 'planning:revisions:approve', permitted: true }],
};
const target = { id: 'target-1', revisionId: 'rev-2', telemetryPointId: 'point-1', telemetryPointCodeSnapshot: 'PT-001', targetValue: 100, unitId: 'm3/h', status: 'ACTIVE' };
const deviation = { id: 'dev-1', planTargetId: 'target-1', trustedTelemetryReadingId: 'reading-9', actualValue: 105, expectedValue: 100, differenceValue: 5, differencePercent: 5, unitId: 'm3/h', severity: 'HIGH', status: 'OPEN', detectedAt: '2026-09-12T10:30:00Z' };

async function mockPlanning(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/planning/periods?**', (route) => route.fulfill({ json: { content: [period], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/planning/periods/period-1', (route) => route.fulfill({ json: period }));
  await page.route('**/api/v1/planning/operational-plans?**', (route) => route.fulfill({ json: { content: [plan], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/planning/operational-plans/plan-1', (route) => route.fulfill({ json: plan }));
  await page.route('**/api/v1/planning/revisions?**', (route) => route.fulfill({ json: { content: [revision], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/planning/revisions/rev-2', (route) => route.fulfill({ json: revision }));
  await page.route('**/api/v1/planning/targets?**', async (route) => {
    const requestUrl = new URL(route.request().url());
    expect(requestUrl.searchParams.get('revisionId')).toBe('rev-2');
    await route.fulfill({ json: { content: [target], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } });
  });
  await page.route('**/api/v1/monitoring/deviations?**', async (route) => {
    const requestUrl = new URL(route.request().url());
    expect(requestUrl.searchParams.get('planTargetId')).toBe('target-1');
    expect(requestUrl.searchParams.get('page')).toBe('0');
    expect(requestUrl.searchParams.get('size')).toBe('50');
    await route.fulfill({ json: { content: [deviation], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } });
  });
  await page.route('**/api/v1/planning/revisions/rev-2/approval', (route) => route.fulfill({ json: approval }));
  await page.route('**/api/v1/planning/revisions/rev-2/approval/actions/transition-approve/execute', async (route) => {
    const request = route.request();
    expect(request.method()).toBe('POST');
    expect(await request.postDataJSON()).toEqual({
      expectedTaskUpdatedAt: '2026-09-12T10:05:00Z',
      commentText: 'Approved in browser test.',
    });
    await route.fulfill({ json: { revisionId: 'rev-2', revisionStatus: 'APPROVED', workflowInstanceId: 'wf-plan-2', workflowInstanceStatus: 'COMPLETED', transitionId: 'transition-approve', decision: 'APPROVE', executedAt: '2026-09-12T10:06:00Z' } });
  });
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('planner');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openRevision(page: Page) {
  await page.getByRole('button', { name: 'Planification' }).click();
  await page.getByRole('tab', { name: 'Operational plans' }).click();
  await expect(page.getByText('OP-2026-Q4-NORTH')).toBeVisible();
  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByRole('heading', { name: 'Revision history' })).toBeVisible();
  await page.getByRole('button', { name: 'Open revision' }).click();
}

test('HWEB-010-04 executes only backend-published revision approval actions with the authoritative task version', async ({ page }) => {
  await mockPlanning(page);
  await signIn(page);
  await openRevision(page);
  await expect(page.getByRole('heading', { name: 'Revision approval' })).toBeVisible();
  await expect(page.getByText('task-plan-2')).toBeVisible();
  await page.getByRole('button', { name: 'APPROVE' }).click();
  await page.getByLabel('Comment').fill('Approved in browser test.');
  await page.getByRole('button', { name: 'Execute APPROVE' }).click();
  await expect(page.getByText('APPROVE · revision APPROVED')).toBeVisible();
});

test('HWEB-010-05 requests and renders monitoring-owned planned-vs-actual values by exact planTargetId', async ({ page }) => {
  await mockPlanning(page);
  await signIn(page);
  await openRevision(page);
  await expect(page.getByRole('heading', { name: 'Planned vs actual' })).toBeVisible();
  await page.getByLabel('Plan target').click();
  await page.getByRole('option', { name: /target-1 · PT-001 · 100 m3\/h/ }).click();
  const comparison = page.getByRole('table', { name: 'Planned versus actual deviations' });
  await expect(comparison).toContainText('105');
  await expect(comparison).toContainText('100');
  await expect(comparison).toContainText('5');
  await expect(comparison).toContainText('m3/h');
  await expect(comparison).toContainText('HIGH');
  await expect(comparison).toContainText('OPEN');
  await expect(comparison).toContainText('reading-9');
});
