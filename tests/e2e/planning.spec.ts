import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/planning/periods', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/periods/{id}', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/operational-plans', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/operational-plans/{id}', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/revisions', methods: ['GET'], module: 'planning', resource: 'revisions', action: 'read', permission: 'planning:revisions:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/revisions/{id}', methods: ['GET'], module: 'planning', resource: 'revisions', action: 'read', permission: 'planning:revisions:read', enforcementStatus: 'backend-enforced' },
];
const effectivePermissions = ['planning:periods:read', 'planning:operational-plans:read', 'planning:revisions:read'];
const period = { id: 'period-1', code: 'PLN-2026-Q4', nameFr: 'Planification T4 2026', periodStart: '2026-10-01T00:00:00Z', periodEnd: '2026-12-31T23:59:59Z', timeZone: 'Africa/Algiers', status: 'OPEN', periodTypeId: 'QUARTER', createdByActorId: 'planner-1' };
const plan = { id: 'plan-1', periodId: 'period-1', code: 'OP-2026-Q4-NORTH', nameFr: 'Plan Nord T4', topologyScopeType: 'PIPELINE', topologyScopeId: 'pipe-1', topologyScopeCode: 'PL-NORTH', topologyScopeNameSnapshot: 'Pipeline Nord', status: 'DRAFT', currentRevisionId: 'rev-2', approvedRevisionId: 'rev-1', responsibleOrganizationUnitId: 'org-trc', createdByActorId: 'planner-1' };
const revision = { id: 'rev-2', planId: 'plan-1', revisionNumber: 2, revisionCode: 'R02', baseRevisionId: 'rev-1', status: 'SUBMITTED', changeReasonCodeId: 'OPS_CHANGE', changeReasonText: 'Updated throughput assumptions', submittedAt: '2026-09-12T10:00:00Z', submittedByActorId: 'planner-2', workflowInstanceId: 'wf-plan-2' };

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
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('planner');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-010-03 exposes backend-published planning revision history and detail', async ({ page }) => {
  await mockPlanning(page);
  await signIn(page);
  await page.getByRole('button', { name: 'Planification' }).click();
  await page.getByRole('tab', { name: 'Operational plans' }).click();
  await expect(page.getByText('OP-2026-Q4-NORTH')).toBeVisible();
  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByRole('heading', { name: 'Revision history' })).toBeVisible();
  await expect(page.getByText('R02')).toBeVisible();
  await expect(page.getByText('Updated throughput assumptions')).toBeVisible();
  await page.getByRole('button', { name: 'Open revision' }).click();
  await expect(page.getByText('wf-plan-2')).toBeVisible();
  await expect(page.getByText('planner-2')).toBeVisible();
});
