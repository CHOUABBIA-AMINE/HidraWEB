import { expect, test } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/modules', methods: ['GET'], module: 'modules',
    resource: 'resources', action: 'read', permission: 'modules:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/resources', methods: ['GET'], module: 'dynamic-module',
    resource: 'resources', action: 'read', permission: 'dynamic-module:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'dynamic-module',
    resource: 'dynamic-resource', action: 'read', permission: 'dynamic-module:dynamic-resource:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'dynamic-module',
    resource: 'dynamic-resource', action: 'read', permission: 'dynamic-module:dynamic-resource:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/search', methods: ['POST'], module: 'dynamic-module',
    resource: 'dynamic-resource', action: 'search', permission: 'dynamic-module:dynamic-resource:search', enforcementStatus: 'backend-enforced' },
];
const permissions = routes.map(route => route.permission);
const descriptor = {
  module: 'alarm', resource: 'alarm-events', idField: 'id',
  searchableFields: ['message', 'severity'], entityName: 'AlarmEvent',
  tableName: 'hidra_alarm_event', javaType: 'synthetic.AlarmEvent',
};
const record = {
  module: 'alarm', resource: 'alarm-events', id: 'a-1',
  attributes: { id: 'a-1', message: 'Synthetic private event', severity: 'HIGH' },
};
test('UXR-17 workbench authorizes pages, exact filters, totals and fail-closed denied refetch', async ({ page }) => {
  await page.route('**/api/v1/security/permissions/routes', route => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', route => route.fulfill({ json: {
    strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced',
    permissionFormat: '<module>:<resource>:<action>', routes,
  } }));
  await page.route('**/api/v1/identity/me/permissions', route => route.fulfill({ json: permissions }));
  await page.route('**/api/v1/workbench/modules', route => route.fulfill({ json: ['alarm'] }));
  await page.route('**/api/v1/workbench/alarm/resources', route => route.fulfill({ json: [descriptor] }));
  const requests: URL[] = [];
  await page.route('**/api/v1/workbench/alarm/alarm-events?**', route => {
    const url = new URL(route.request().url());
    requests.push(url);
    if (url.searchParams.get('q') === 'denied') return route.fulfill({ status: 403 });
    return route.fulfill({ json: {
      module: 'alarm', resource: 'alarm-events',
      page: 0, size: 50, totalElements: 1, totalPages: 1, items: [record],
    } });
  });
  await page.route('**/api/v1/workbench/alarm/alarm-events/a-1', route => route.fulfill({ json: record }));
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
  await page.getByRole('button', { name: 'Ouvrir l’atelier opérationnel' }).click();
  const register = page.getByRole('region', { name: 'alarm/alarm-events' });
  await expect(register.getByRole('table', { name: 'alarm/alarm-events' })).toContainText('Synthetic private event');
  expect(requests[0].searchParams.get('page')).toBe('0');
  expect(requests[0].searchParams.get('size')).toBe('50');
  await expect(register.getByRole('button', { name: 'Inspecter' })).toBeVisible();
  await expect(page.getByRole('button', { name: /export/i })).toHaveCount(0);

  await page.getByRole('textbox', { name: 'Recherche' }).fill('denied');
  await page.getByRole('button', { name: 'Rechercher', exact: true }).click();
  await expect(register.getByRole('alert')).toBeVisible();
  await expect(register.getByRole('table')).toHaveCount(0);
  await expect(page.getByText('Synthetic private event')).toHaveCount(0);
  await expect(register.getByRole('button', { name: 'Inspecter' })).toHaveCount(0);
  await expect.poll(() => requests.length).toBe(2);
});
