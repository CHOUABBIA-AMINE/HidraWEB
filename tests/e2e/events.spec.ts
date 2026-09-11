import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/incident/incidents', methods: ['GET'], module: 'incident', resource: 'incidents', action: 'read', permission: 'incident:incidents:read', enforcementStatus: 'backend-enforced' },
];
const effectivePermissions = ['incident:incidents:read'];
const incident = {
  id: 'inc-1', incidentNumber: 'INC-2026-001', title: 'Pipeline pressure event', description: 'Operational incident under investigation.',
  status: 'OPEN', sourceType: 'ALARM', severityId: 'SEV-2', priorityId: 'P1', topologyAssetId: 'PIPE-1', topologyAssetCode: 'PL-001',
  topologyAssetName: 'Pipeline Nord', responsibleActorId: 'actor-1', responsibleActorName: 'Operator One', workflowInstanceId: 'wf-1',
  occurredAt: '2026-09-11T10:00:00Z', updatedAt: '2026-09-11T11:00:00Z', currentEscalationLevel: 1,
};

async function mockEvents(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/incident/incidents?**', (route) => route.fulfill({ json: { content: [incident], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/incident/incidents/inc-1', (route) => route.fulfill({ json: incident }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-009 exposes only published incident reads and keeps leak/HSE query gaps explicit', async ({ page }) => {
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
  await expect(page.getByText(/issue #63/)).toBeVisible();
  await page.getByRole('tab', { name: 'HSE' }).click();
  await expect(page.getByText(/issue #64/)).toBeVisible();
});
