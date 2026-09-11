import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/planning/periods', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/periods/{id}', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/operational-plans', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/operational-plans/{id}', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
];
const effectivePermissions = ['planning:periods:read', 'planning:operational-plans:read'];
const period = {
  id: 'period-1', code: 'PLN-2026-Q4', nameFr: 'Planification T4 2026', nameEn: 'Q4 2026 Planning',
  periodStart: '2026-10-01T00:00:00Z', periodEnd: '2026-12-31T23:59:59Z', timeZone: 'Africa/Algiers',
  status: 'OPEN', periodTypeId: 'QUARTER', createdByActorId: 'planner-1', createdAt: '2026-09-12T08:00:00Z', updatedAt: '2026-09-12T09:00:00Z',
};
const plan = {
  id: 'plan-1', periodId: 'period-1', code: 'OP-2026-Q4-NORTH', nameFr: 'Plan Nord T4', nameEn: 'North Q4 Plan',
  topologyScopeType: 'PIPELINE', topologyScopeId: 'pipe-1', topologyScopeCode: 'PL-NORTH', topologyScopeNameSnapshot: 'Pipeline Nord',
  status: 'DRAFT', currentRevisionId: 'rev-1', responsibleOrganizationUnitId: 'org-trc', createdByActorId: 'planner-1',
  createdAt: '2026-09-12T08:30:00Z', updatedAt: '2026-09-12T09:30:00Z',
};

async function mockPlanning(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/planning/periods?**', (route) => route.fulfill({ json: { content: [period], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/planning/periods/period-1', (route) => route.fulfill({ json: period }));
  await page.route('**/api/v1/planning/operational-plans?**', (route) => route.fulfill({ json: { content: [plan], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/planning/operational-plans/plan-1', (route) => route.fulfill({ json: plan }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('planner');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-010 exposes planning period and operational plan workspaces', async ({ page }) => {
  await mockPlanning(page);
  await signIn(page);

  await page.getByRole('button', { name: 'Planification' }).click();
  await expect(page).toHaveURL(/\/planning$/);
  await expect(page.getByRole('heading', { name: 'Planning' })).toBeVisible();
  await expect(page.getByText('PLN-2026-Q4')).toBeVisible();

  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByText('QUARTER')).toBeVisible();
  await expect(page.getByText('planner-1')).toBeVisible();

  await page.getByRole('tab', { name: 'Operational plans' }).click();
  await expect(page.getByText('OP-2026-Q4-NORTH')).toBeVisible();
  await expect(page.getByText('Pipeline Nord')).toBeVisible();
  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByText('rev-1')).toBeVisible();
  await expect(page.getByText('org-trc')).toBeVisible();
});
