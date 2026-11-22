import { expect, test, type Page } from '@playwright/test';

const permissionRoutes = [
  { route: '/api/v1/topology/map/layers', methods: ['GET'], module: 'topology', resource: 'map',
    action: 'read', permission: 'topology:map:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/modules', methods: ['GET'], module: 'modules', resource: 'resources',
    action: 'read', permission: 'modules:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/resources', methods: ['GET'], module: 'dynamic-module', resource: 'resources',
    action: 'read', permission: 'dynamic-module:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'dynamic-module', resource: 'dynamic-resource',
    action: 'read', permission: 'dynamic-module:dynamic-resource:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'dynamic-module', resource: 'dynamic-resource',
    action: 'read', permission: 'dynamic-module:dynamic-resource:read', enforcementStatus: 'backend-enforced' },
];
async function login(page: Page, grants: string[]) {
  await page.route('**/api/v1/security/permissions/routes', handler => handler.fulfill({ json: permissionRoutes }));
  await page.route('**/api/v1/security/permissions/catalog', handler => handler.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced',
      permissionFormat: '<module>:<resource>:<action>', routes: permissionRoutes },
  }));
  await page.route('**/api/v1/identity/me/permissions', handler => handler.fulfill({ json: grants }));
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble', level: 1 })).toBeVisible();
}

test('UXR-14 legacy map inspector labels selected owner feature and restores keyboard focus', async ({ page }) => {
  const feature = {
    type: 'Feature', id: 'facility-1', geometry: { type: 'Point', coordinates: [2.1, 36.7] },
    properties: { layer: 'facilities', entityType: 'facility', entityId: 'facility-1', code: 'FAC-1' },
  };
  const layer = { id: 'facilities', label: 'Facilities', geometryType: 'Point',
    description: 'Facilities', featuresEndpoint: '/api/v1/topology/map/layers/facilities/features' };
  const collection = {
    type: 'FeatureCollection', name: 'topology-map', layer: null, page: 0, size: 1000,
    totalFeatures: 1, totalPages: 1, hasNext: false, layers: ['facilities'], features: [feature],
  };
  await page.route('**/api/v1/topology/map/layers/facilities/features?**', handler => handler.fulfill({
    json: { ...collection, layer: 'facilities', size: 25 },
  }));
  await page.route('**/api/v1/topology/map/layers/facilities', handler => handler.fulfill({ json: layer }));
  await page.route('**/api/v1/topology/map/layers', handler => handler.fulfill({ json: [layer] }));
  await page.route('**/api/v1/topology/map/geojson?**', handler => handler.fulfill({ json: collection }));
  await login(page, ['topology:map:read']);
  await page.getByRole('button', { name: 'Réseau' }).click();
  await expect(page.getByText('FAC-1')).toBeVisible();
  const inspect = page.getByRole('button', { name: 'Inspecter' });
  await inspect.focus();
  await inspect.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'FAC-1' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('facility-1').first()).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Fermer le panneau contextuel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(inspect).toBeFocused();
  await expect(page).toHaveURL(/\/network$/);
  await page.setViewportSize({ width: 360, height: 720 });
  await inspect.click();
  await expect(dialog).toBeVisible();
  await expect.poll(async () => (await dialog.boundingBox())?.width ?? 9999).toBeLessThanOrEqual(360);
  await dialog.getByRole('button', { name: 'Fermer le panneau contextuel' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(inspect).toBeFocused();
});

test('UXR-14 Workbench inspector rechecks exact owner detail and hides denied content', async ({ page }) => {
  const resource = {
    module: 'alarm', resource: 'alarm-events', entityName: 'AlarmEventJpaEntity',
    javaType: 'AlarmEventJpaEntity', tableName: 'hidra_alarm_event',
    idField: 'id', searchableFields: ['message', 'severity'],
    listEndpoint: '/api/v1/workbench/alarm/alarm-events',
    detailEndpoint: '/api/v1/workbench/alarm/alarm-events/{id}',
    searchEndpoint: '/api/v1/workbench/alarm/alarm-events/search',
  };
  const record = { module: 'alarm', resource: 'alarm-events', id: '1', attributes: { id: '1', message: 'List only', severity: 'HIGH' } };
  let detailReads = 0;
  await page.route('**/api/v1/workbench/modules', handler => handler.fulfill({ json: ['alarm'] }));
  await page.route('**/api/v1/workbench/alarm/resources', handler => handler.fulfill({ json: [resource] }));
  await page.route('**/api/v1/workbench/alarm/alarm-events?**', handler => handler.fulfill({
    json: { module: 'alarm', resource: 'alarm-events', page: 0, size: 50, totalElements: 1, totalPages: 1, items: [record] },
  }));
  await page.route('**/api/v1/workbench/alarm/alarm-events/1', handler => {
    detailReads += 1;
    return handler.fulfill({ status: 403, json: { status: 403, title: 'Denied' } });
  });
  await login(page, ['modules:resources:read', 'dynamic-module:resources:read', 'dynamic-module:dynamic-resource:read']);
  await page.getByRole('button', { name: 'Ouvrir l’atelier opérationnel' }).click();
  await expect(page.getByRole('heading', { name: 'Atelier opérationnel' })).toBeVisible();
  await expect(page.getByText('List only')).toBeVisible();
  await page.getByRole('button', { name: 'Inspecter' }).click();
  const dialog = page.getByRole('dialog', { name: 'alarm-events · 1' });
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect.poll(() => detailReads).toBe(1);
  await expect(dialog.getByText('Owner-issued detail')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Fermer le panneau contextuel' }).click();
  await expect(dialog).toHaveCount(0);
});
