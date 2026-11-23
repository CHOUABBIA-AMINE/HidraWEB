import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/telemetry/points/{pointId}/readings', methods: ['GET'], module: 'telemetry', resource: 'points', action: 'read', permission: 'telemetry:points:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/telemetry/reference/reading-states', methods: ['GET'], module: 'telemetry', resource: 'reference', action: 'read', permission: 'telemetry:reference:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/monitoring/rules', methods: ['GET'], module: 'monitoring', resource: 'rules', action: 'read', permission: 'monitoring:rules:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/monitoring/deviations', methods: ['GET'], module: 'monitoring', resource: 'deviations', action: 'read', permission: 'monitoring:deviations:read', enforcementStatus: 'backend-enforced' },
];

const effectivePermissions = [
  'telemetry:points:read',
  'telemetry:reference:read',
  'monitoring:rules:read',
  'monitoring:deviations:read',
];

const catalog = {
  strategy: 'derived-route-permission-catalog',
  enforcement: 'backend-enforced by HidraRouteAuthorizationInterceptor',
  permissionFormat: '<module>:<resource>:<action>',
  routes,
};

const reading = {
  id: 'reading-1',
  pointId: 'PT-1',
  numericValue: 42.5,
  unitId: 'bar',
  qualityCodeId: 'GOOD',
  state: 'TRUSTED',
  sourceTimestamp: '2026-09-11T12:00:00Z',
};

async function mockPermissions(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: catalog }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
}

async function mockOperations(page: Page) {
  await page.route('**/api/v1/telemetry/reference/reading-states', (route) => route.fulfill({ json: ['TRUSTED'] }));
  await page.route('**/api/v1/telemetry/reference/quality-codes', (route) => route.fulfill({ json: [{ id: 'GOOD', code: 'GOOD', translations: {}, active: true }] }));
  await page.route('**/api/v1/monitoring/rules?**', (route) => route.fulfill({ json: { content: [{ id: 'rule-1', code: 'PRESSURE-HIGH', status: 'ACTIVE', ruleType: 'THRESHOLD', topologyAssetCode: 'FAC-1' }], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/monitoring/deviations?**', (route) => route.fulfill({ json: { content: [{ id: 'dev-1', severity: 'HIGH', status: 'OPEN', topologyAssetCode: 'FAC-1', reasonCode: 'PRESSURE_HIGH', detectedAt: '2026-09-11T12:01:00Z' }], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/telemetry/points/PT-1/readings/latest', (route) => route.fulfill({ json: reading }));
  await page.route('**/api/v1/telemetry/points/PT-1/readings?**', (route) => route.fulfill({ json: { content: [reading], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/telemetry/points/PT-1/trend?**', (route) => route.fulfill({ json: [reading, { ...reading, id: 'reading-2', numericValue: 43.1, sourceTimestamp: '2026-09-11T12:02:00Z' }] }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-006 loads monitoring and telemetry through published contracts', async ({ page }) => {
  await mockPermissions(page);
  await mockOperations(page);
  await signIn(page);

  // Disambiguate the Operations workspace from the OPÉRATIONS accordion group.
  await page.getByRole('navigation', { name: 'Navigation principale' })
    .getByRole('button', { name: 'Opérations', exact: true }).click();
  await expect(page).toHaveURL(/\/operations$/);
  await expect(page.getByRole('heading', { name: 'Opérations · télémétrie & surveillance' })).toBeVisible();
  await expect(page.getByText('PRESSURE-HIGH')).toBeVisible();
  await expect(page.getByText('PRESSURE_HIGH')).toBeVisible();

  await page.getByLabel('Identifiant du point de télémétrie').fill('PT-1');
  await page.getByRole('button', { name: 'Charger le point' }).click();

  await expect(page.getByText('42.5').first()).toBeVisible();
  await expect(page.getByText('TRUSTED').first()).toBeVisible();
  await expect(page).toHaveURL(/\/operations$/);
});

test('HWEB-006 hides telemetry controls when only monitoring grants are available', async ({ page }) => {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: catalog }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: ['monitoring:rules:read', 'monitoring:deviations:read'] }));
  await mockOperations(page);
  await signIn(page);

  // Disambiguate the Operations workspace from the OPÉRATIONS accordion group.
  await page.getByRole('navigation', { name: 'Navigation principale' })
    .getByRole('button', { name: 'Opérations', exact: true }).click();
  await expect(page.getByText('Accès télémétrie indisponible pour cet utilisateur.')).toBeVisible();
  await expect(page.getByText('PRESSURE-HIGH')).toBeVisible();
});

test('UXR-15 loads legacy evidence and trend on demand with owner provenance', async ({ page }) => {
  await mockPermissions(page);
  await mockOperations(page);
  let historyReads = 0;
  let trendReads = 0;
  await page.route('**/api/v1/telemetry/points/PT-1/readings?**', route => {
    historyReads += 1;
    return route.fulfill({ json: {
      content: [reading], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false,
    } });
  });
  await page.route('**/api/v1/telemetry/points/PT-1/trend?**', route => {
    trendReads += 1;
    return route.fulfill({ json: [
      reading, { ...reading, id: 'reading-2', numericValue: 43.1, sourceTimestamp: '2026-09-11T12:02:00Z' },
    ] });
  });
  await signIn(page);
  await page.getByRole('navigation', { name: 'Navigation principale' })
    .getByRole('button', { name: 'Opérations', exact: true }).click();
  await page.getByLabel('Identifiant du point de télémétrie').fill('PT-1');
  await page.getByRole('button', { name: 'Charger le point' }).click();
  const summary = page.getByRole('region', { name: 'Dernière lecture' });
  await expect(summary).toContainText('42.5');
  await expect(summary).toContainText('HidraAPI Telemetry / point readings (legacy)');
  await expect(summary).toContainText('GOOD');
  expect(historyReads).toBe(0);
  expect(trendReads).toBe(0);

  await page.getByRole('button', { name: 'Historique' }).click();
  const timeline = page.getByRole('table', { name: 'Historique' });
  await expect(timeline).toContainText('42.5');
  await expect(timeline).toContainText('GOOD');
  await expect.poll(() => historyReads).toBe(1);
  expect(trendReads).toBe(0);

  await page.getByRole('button', { name: 'Tendance' }).click();
  await expect(page.getByText('Données du contrat de lectures historiques, non qualifiées comme flux de confiance.')).toBeVisible();
  await expect(page.locator('svg[aria-label="Tendance"]')).toBeVisible();
  await expect.poll(() => trendReads).toBe(1);
});
