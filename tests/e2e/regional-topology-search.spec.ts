import { expect, test, type Page } from '@playwright/test';

const permissions = [
  { route: '/api/v1/topology/map/layers', methods: ['GET'], module: 'topology',
    resource: 'map', action: 'read', permission: 'topology:map:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/topology/regional-map/search', methods: ['GET'], module: 'topology',
    resource: 'regional-map', action: 'search', permission: 'topology:regional-map:search', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/topology/regional-map/layers/{layerId}/features/{entityId}',
    methods: ['GET'], module: 'topology', resource: 'regional-map', action: 'read',
    permission: 'topology:regional-map:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/identity/me', methods: ['GET'], module: 'identity',
    resource: 'me', action: 'read', permission: 'identity:me:read', enforcementStatus: 'backend-enforced' },
];
const grants = ['topology:map:read', 'topology:regional-map:search', 'topology:regional-map:read', 'identity:me:read'];
const feature = {
  type: 'Feature', id: 'pipelines:p-1',
  geometry: { type: 'MultiLineString', coordinates: [[[2.1, 36.7], [2.3, 36.8]]] },
  properties: { layer: 'pipelines', entityType: 'pipeline', entityId: 'p-1',
    code: 'GZ2-P', nameFr: 'Gazoduc GZ2', status: 'ACTIVE' },
};

async function enterSelectedScope(page: Page, extraRoutes: typeof permissions = [], extraGrants: string[] = []) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/api/v1/security/permissions/routes', route => route.fulfill({ json: [...permissions, ...extraRoutes] }));
  await page.route('**/api/v1/security/permissions/catalog', route => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced',
      permissionFormat: '<module>:<resource>:<action>', routes: [...permissions, ...extraRoutes] },
  }));
  await page.route('**/api/v1/identity/me/permissions', route => route.fulfill({ json: [...grants, ...extraGrants] }));
  await page.route('**/api/v1/organization/responsibilities?**', route => route.fulfill({
    json: [{ id: 'r1', scopeId: 7, status: 'ACTIVE',
      scope: { id: 7, type: 'PIPELINE_SYSTEM', targetId: 'gz2', name: 'GZ2' } }],
  }));
  await page.route('**/api/v1/identity/me/regional-access/**', route => route.fulfill({
    json: { permitted: true, companyPartyId: 'company',
      resourceKind: 'PIPELINE_SYSTEM', resourceId: 'gz2' },
  }));
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble' })).toBeVisible();

  await page.getByRole('button', { name: 'Contexte opérationnel : non sélectionné' }).click();
  await page.getByRole('textbox', { name: 'Identifiant entreprise' }).fill('company');
  await page.getByRole('combobox', { name: 'Périmètre attribué' }).click();
  await page.getByRole('option', { name: 'GZ2' }).click();
  await page.getByRole('button', { name: 'Vérifier et appliquer' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Réseau' }).click();
  await expect(page.getByRole('heading', { name: 'Recherche topologique régionale' })).toBeVisible();
}

test('UXR-11 selected company searches T34, navigates canonical exact feature, never uses administrator map', async ({ page }) => {
  const legacy: string[] = [];
  const searches: URL[] = [];
  const details: URL[] = [];
  await page.route('**/api/v1/topology/map/**', route => {
    legacy.push(route.request().url());
    return route.fulfill({ status: 403 });
  });
  await page.route('**/api/v1/topology/regional-map/search?**', route => {
    searches.push(new URL(route.request().url()));
    return route.fulfill({ json: {
      query: 'GZ2', page: 0, size: 25, totalFeatures: 1,
      totalPages: 1, hasNext: false, features: [feature],
    } });
  });
  await page.route('**/api/v1/topology/regional-map/layers/pipelines/features/p-1?**', route => {
    details.push(new URL(route.request().url()));
    return route.fulfill({ json: feature });
  });
  await enterSelectedScope(page);
  await page.getByRole('textbox', { name: 'Recherche régionale' }).fill('GZ2');
  await page.getByRole('button', { name: 'Rechercher dans le périmètre' }).click();
  await expect(page.getByText('1 résultat(s) autorisé(s)')).toBeVisible();
  await page.getByRole('button', { name: 'GZ2-P' }).click();
  await expect(page).toHaveURL(/regionalLayer=pipelines&regionalEntityId=p-1/);
  await expect(page.getByRole('heading', { name: 'GZ2-P', level: 3 })).toBeVisible();
  const handoff = page.getByRole('link', { name: 'Ouvrir la fiche de carte' });
  await expect(handoff).toHaveAttribute('href', '/network?regionalLayer=pipelines&regionalEntityId=p-1');
  await handoff.click();
  const returnLink = page.getByRole('link', { name: "Retour à l’espace d’origine" });
  await expect(returnLink).toHaveAttribute('href', '/network');
  await returnLink.click();
  await expect(page).toHaveURL(/\/network$/);
  await expect(page.getByText('1 résultat(s) autorisé(s)')).toBeVisible();
  expect(searches.length).toBeGreaterThan(0);
  expect(searches.every(url => url.searchParams.get('companyPartyId') === 'company' &&
    url.searchParams.get('q') === 'GZ2')).toBe(true);
  expect(details.length).toBeGreaterThan(0);
  expect(details.every(url => url.searchParams.get('companyPartyId') === 'company')).toBe(true);
  expect(legacy).toHaveLength(0);
});

test('UXR-11 opaque denial and malformed deep links fail closed without region inventory or legacy fallback', async ({ page }) => {
  const legacy: string[] = [];
  await page.route('**/api/v1/topology/map/**', route => {
    legacy.push(route.request().url());
    return route.fulfill({ status: 403 });
  });
  await page.route('**/api/v1/topology/regional-map/search?**', route => route.fulfill({
    status: 404, json: { status: 404, title: 'Not Found' },
  }));
  await enterSelectedScope(page);
  await page.getByRole('textbox', { name: 'Recherche régionale' }).fill('private');
  await page.getByRole('button', { name: 'Rechercher dans le périmètre' }).click();
  await expect(page.getByRole('alert')).toContainText('Recherche régionale indisponible');
  await expect(page.getByText('GZ2-P')).toHaveCount(0);
  await page.evaluate(() => {
    window.history.pushState({}, '', '/network?regionalLayer=pipelines&regionalEntityId=pipelines:p-1');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByText('Recherche régionale indisponible ou non autorisée.').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'GZ2-P' })).toHaveCount(0);
  expect(legacy).toHaveLength(0);
});

const mapReadPermission = 'topology:regional-map:read';
const regionalMapRoutes = [
  '/api/v1/topology/regional-map/layers',
  '/api/v1/topology/regional-map/layers/{layerId}',
  '/api/v1/topology/regional-map/layers/{layerId}/features',
  '/api/v1/topology/regional-map/geojson',
].map(route => ({ route, methods: ['GET'], module: 'topology', resource: 'regional-map',
  action: 'read', permission: mapReadPermission, enforcementStatus: 'backend-enforced' }));
const regionalLayers = [
  { id: 'pipelines', label: 'Pipelines', geometryType: 'MultiLineString',
    description: 'Scoped pipelines', featuresEndpoint: '/api/v1/topology/regional-map/layers/pipelines/features' },
  { id: 'facilities', label: 'Facilities', geometryType: 'Point',
    description: 'Scoped facilities', featuresEndpoint: '/api/v1/topology/regional-map/layers/facilities/features' },
];
const station = {
  type: 'Feature', id: 'facilities:f-1',
  geometry: { type: 'Point', coordinates: [2.3, 36.8] },
  properties: { layer: 'facilities', entityType: 'facility', entityId: 'f-1', code: 'F-1', nameFr: 'Scoped facility' },
};

const mapFirstPage = [feature, ...Array.from({ length: 99 }, (_, index) => ({
  ...station, id: 'facilities:f-' + (index + 2),
  properties: { ...station.properties, entityId: 'f-' + (index + 2), code: 'F-' + (index + 2) },
}))];

test('UXR-22 selected regional map renders only owner-paged layers and exact entity detail; no legacy fallback', async ({ page }) => {
  const legacy: string[] = [];
  const urls: URL[] = [];
  await page.route('**/api/v1/topology/map/**', route => {
    legacy.push(route.request().url());
    return route.fulfill({ status: 403 });
  });
  await page.route('**/api/v1/topology/regional-map/layers?**', route =>
    route.fulfill({ json: regionalLayers }));
  await page.route('**/api/v1/topology/regional-map/layers/pipelines?**', route =>
    route.fulfill({ json: regionalLayers[0] }));
  await page.route('**/api/v1/topology/regional-map/layers/pipelines/features?**', route =>
    route.fulfill({ json: { type: 'FeatureCollection', layer: 'pipelines', page: 0, size: 25,
      totalFeatures: 1, totalPages: 1, hasNext: false, features: [feature] } }));
  await page.route('**/api/v1/topology/regional-map/geojson?**', route => {
    const url = new URL(route.request().url());
    urls.push(url);
    const current = Number(url.searchParams.get('page'));
    const isAll = url.searchParams.get('layers') === 'pipelines,facilities';
    return route.fulfill({ json: {
      type: 'FeatureCollection', name: 'hidra-regional-topology', page: current, size: 100,
      totalFeatures: isAll ? 101 : 100, totalPages: isAll ? 2 : 1,
      hasNext: isAll && current === 0, layers: isAll ? ['pipelines', 'facilities'] : ['facilities'],
      features: isAll ? (current === 0 ? mapFirstPage : [station]) : [...mapFirstPage.slice(1), station],
    } });
  });
  await page.route('**/api/v1/topology/regional-map/layers/pipelines/features/p-1?**', route =>
    route.fulfill({ json: feature }));
  await enterSelectedScope(page, regionalMapRoutes, [mapReadPermission]);

  await expect(page.getByRole('heading', { name: 'Carte régionale autorisée' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Carte régionale autorisée' })).toBeVisible();
  await expect(page.getByText('Page 1 / 2')).toBeVisible();
  await expect(page.getByText('GZ2-P').first()).toBeVisible();
  await page.getByRole('button', { name: 'Inspecter' }).first().click();
  await expect(page).toHaveURL(/regionalLayer=pipelines&regionalEntityId=p-1/);
  await expect(page.getByRole('heading', { name: 'GZ2-P', level: 3 })).toBeVisible();

  await page.getByText('Page 1 / 2').locator('..').getByRole('button', { name: 'Suivant' }).click();
  await expect(page.getByText('Page 2 / 2')).toBeVisible();
  await expect(page.getByText('GZ2-P')).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Pipelines' }).uncheck();
  await expect(page.getByText('Page 1 / 1')).toBeVisible();
  expect(urls.some(url => url.searchParams.get('page') === '1' &&
    url.searchParams.get('size') === '100')).toBe(true);
  expect(urls.some(url => url.searchParams.get('layers') === 'facilities')).toBe(true);
  expect(urls.every(url => url.searchParams.get('companyPartyId') === 'company')).toBe(true);
  expect(legacy).toHaveLength(0);
});

test('UXR-22 regional map opaque 404 clears geometry, totals and feature list', async ({ page }) => {
  const legacy: string[] = [];
  await page.route('**/api/v1/topology/map/**', route => {
    legacy.push(route.request().url());
    return route.fulfill({ status: 403 });
  });
  await page.route('**/api/v1/topology/regional-map/layers?**', route =>
    route.fulfill({ json: regionalLayers }));
  await page.route('**/api/v1/topology/regional-map/layers/pipelines?**', route =>
    route.fulfill({ json: regionalLayers[0] }));
  await page.route('**/api/v1/topology/regional-map/layers/pipelines/features?**', route =>
    route.fulfill({ json: { layer: 'pipelines', features: [], totalFeatures: 0 } }));
  await page.route('**/api/v1/topology/regional-map/geojson?**', route =>
    route.fulfill({ status: 404, json: { status: 404, title: 'Not Found' } }));
  await enterSelectedScope(page, regionalMapRoutes, [mapReadPermission]);
  await expect(page.getByText('Carte régionale indisponible ou non autorisée.').first()).toBeVisible();
  await expect(page.getByText('Page 1 / 1')).toHaveCount(0);
  await expect(page.getByText('GZ2-P')).toHaveCount(0);
  expect(legacy).toHaveLength(0);
});
