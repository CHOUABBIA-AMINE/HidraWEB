import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/incident/incidents', methods: ['GET'], module: 'incident', resource: 'incidents', action: 'read', permission: 'incident:incidents:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/incident/incidents/{id}', methods: ['GET'], module: 'incident', resource: 'incidents', action: 'read', permission: 'incident:incidents:read', enforcementStatus: 'backend-enforced' },
];

const incident = {
  id: 'inc-1',
  incidentNumber: 'INC-2026-001',
  title: 'Pipeline pressure event',
  description: 'Pressure deviation under operational assessment.',
  status: 'OPEN',
  severityId: 'SEV-2',
  priorityId: 'P2',
  sourceType: 'ALARM',
  sourceReferenceCode: 'ALM-42',
  detectedAt: '2026-09-11T09:00:00Z',
  reportedAt: '2026-09-11T09:04:00Z',
  topologyAssetId: 'pipe-1',
  topologyAssetCode: 'PL-001',
  topologyAssetName: 'Pipeline Nord',
  responsibleOrganizationUnitCode: 'OPS-NORTH',
  responsibleOrganizationUnitName: 'North Operations',
  responsibleActorId: 'actor-1',
  responsibleActorName: 'Operator A',
  workflowInstanceId: 'wf-1',
  currentEscalationLevel: 1,
  createdAt: '2026-09-11T09:04:00Z',
  updatedAt: '2026-09-11T09:10:00Z',
};

async function mockEvents(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: ['incident:incidents:read'] }));
  await page.route('**/api/v1/incident/incidents?**', async (route) => {
    expect(route.request().method()).toBe('GET');
    const url = new URL(route.request().url());
    expect(url.searchParams.get('page')).toBe('0');
    expect(url.searchParams.get('size')).toBe('50');
    await route.fulfill({ json: { content: [incident], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } });
  });
  await page.route('**/api/v1/incident/incidents/inc-1', (route) => route.fulfill({ json: incident }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-009 loads incident register/detail and does not invent leak or HSE reads', async ({ page }) => {
  await mockEvents(page);
  await signIn(page);

  const eventsNavigation = page.getByRole('button', { name: 'Événements' }).filter({ visible: true });
  const count = await eventsNavigation.count();
  let clicked = false;
  for (let index = 0; index < count; index += 1) {
    const candidate = eventsNavigation.nth(index);
    if (await candidate.isEnabled()) {
      await candidate.click();
      clicked = true;
      break;
    }
  }
  expect(clicked).toBe(true);

  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole('heading', { name: 'Événements et incidents' })).toBeVisible();
  await expect(page.getByText('Pipeline pressure event')).toBeVisible();
  await page.getByRole('button', { name: 'Ouvrir' }).click();
  await expect(page.getByText('Pressure deviation under operational assessment.')).toBeVisible();
  await expect(page.getByText('North Operations')).toBeVisible();

  const leakRequests: string[] = [];
  const hseRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/leakdetection/')) leakRequests.push(request.url());
    if (request.url().includes('/hse/')) hseRequests.push(request.url());
  });

  await page.getByRole('tab', { name: 'Cas de fuite' }).click();
  await expect(page.getByText(/gap backend #63/)).toBeVisible();
  await page.getByRole('tab', { name: 'HSE' }).click();
  await expect(page.getByText(/gap backend #64/)).toBeVisible();
  expect(leakRequests).toHaveLength(0);
  expect(hseRequests).toHaveLength(0);
});
