import { expect, test, type Page } from '@playwright/test';

const permissionRoutes = [
  { route: '/api/v1/topology/map/layers', methods: ['GET'], module: 'topology', resource: 'map', action: 'read', permission: 'topology:map:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/topology/map/search', methods: ['GET'], module: 'topology', resource: 'map', action: 'search', permission: 'topology:map:search', enforcementStatus: 'backend-enforced' },
];
const effectivePermissions = ['topology:map:read', 'topology:map:search'];

const layer = { id: 'facilities', label: 'Facilities', geometryType: 'Point', description: 'Facility locations', featuresEndpoint: '/api/v1/topology/map/layers/facilities/features' };
const feature = {
  type: 'Feature', id: 'facility-1', geometry: { type: 'Point', coordinates: [2.1, 36.7] },
  properties: { layer: 'facilities', entityType: 'facility', entityId: 'facility-1', code: 'FAC-1', nameAr: null, nameFr: 'Station 1', nameEn: null, status: 'ACTIVE', facilityKind: null, nodeType: null, pipelineSystemId: null, pipelineType: null, fromNodeId: null, toNodeId: null, segmentType: null, flowDirection: null, connectionType: null },
};
const collection = { type: 'FeatureCollection', name: 'topology-map', layer: null, page: 0, size: 1000, totalFeatures: 1, totalPages: 1, hasNext: false, layers: ['facilities'], features: [feature] };

async function mockBackend(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: permissionRoutes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: {
      strategy: 'derived-route-permission-catalog',
      enforcement: 'backend-enforced by HidraRouteAuthorizationInterceptor',
      permissionFormat: '<module>:<resource>:<action>',
      bootstrapAdminBypass: 'ROLE_HIDRA_ADMIN',
      routes: permissionRoutes,
    },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/topology/map/layers/facilities/features?**', (route) => route.fulfill({ json: { ...collection, layer: 'facilities', size: 25 } }));
  await page.route('**/api/v1/topology/map/layers/facilities', (route) => route.fulfill({ json: layer }));
  await page.route('**/api/v1/topology/map/layers', (route) => route.fulfill({ json: [layer] }));
  await page.route('**/api/v1/topology/map/geojson?**', (route) => route.fulfill({ json: collection }));
  await page.route('**/api/v1/topology/map/search?**', (route) => route.fulfill({
    json: { query: 'FAC', type: 'FeatureCollection', page: 0, size: 50, totalFeatures: 1, totalPages: 1, hasNext: false, features: [feature] },
  }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-005 loads topology, searches, and inspects while preserving the network route', async ({ page }) => {
  await mockBackend(page);
  await signIn(page);

  await page.getByRole('button', { name: 'Réseau' }).click();
  await expect(page).toHaveURL(/\/network$/);
  await expect(page.getByRole('heading', { name: 'Réseau & topologie' })).toBeVisible();
  await expect(page.getByText('FAC-1')).toBeVisible();

  await page.getByRole('button', { name: 'Inspecter' }).click();
  await expect(page.getByRole('heading', { name: 'FAC-1', level: 3 })).toBeVisible();
  await expect(page).toHaveURL(/\/network$/);
  await page.getByRole('button', { name: 'Fermer le panneau contextuel' }).click();

  await page.getByLabel('Recherche topologique').fill('FAC');
  await page.getByRole('button', { name: 'Rechercher' }).click();
  await expect(page.getByText('Résultats de recherche · 1')).toBeVisible();
});
