import { expect, test, type Page, type Route } from '@playwright/test';

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

async function enterSelectedScope(page: Page, extraRoutes: typeof permissions = [], extraGrants: string[] = [], allowRegionalSearch = true) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/api/v1/security/permissions/routes', route => route.fulfill({ json: [...permissions, ...extraRoutes] }));
  await page.route('**/api/v1/security/permissions/catalog', route => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced',
      permissionFormat: '<module>:<resource>:<action>', routes: [...permissions, ...extraRoutes] },
  }));
  await page.route('**/api/v1/identity/me/permissions', route => route.fulfill({ json: [...grants.filter(permission => allowRegionalSearch || permission !== 'topology:regional-map:search'), ...extraGrants] }));
  const administrativeRequests: string[] = [];
  const discoveryCompanies: string[] = [];
  await page.route('**/api/v1/organization/responsibilities?**', route => {
    administrativeRequests.push(route.request().url());
    return route.fulfill({ status: 403 });
  });
  await page.route('**/api/v1/identity/me/regional-access/**', route => route.fulfill({
    json: { permitted: true, companyPartyId: 'company',
      resourceKind: 'PIPELINE_SYSTEM', resourceId: 'gz2' },
  }));
  await page.route('**/api/v1/identity/me/regional-access/scopes?**', route => {
    const company = new URL(route.request().url()).searchParams.get('companyPartyId') ?? '';
    discoveryCompanies.push(company);
    return route.fulfill({ json: company === 'company' ? [{ id: 7, type: 'PIPELINE_SYSTEM', targetId: 'gz2' }] : [] });
  });
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble' })).toBeVisible();

  await page.getByRole('button', { name: 'Contexte opérationnel : non sélectionné' }).click();
  const company = page.getByRole('textbox', { name: 'Identifiant entreprise' });
  const resource = page.getByRole('combobox', { name: 'Périmètre attribué' });
  await expect(resource).toBeDisabled();
  expect(discoveryCompanies).toEqual([]);
  await company.fill('foreign');
  await page.getByRole('button', { name: 'Découvrir les périmètres autorisés' }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText(/indisponible ou non autorisé/i);
  await expect(resource).toBeDisabled();
  await company.fill('company');
  await expect(resource).toBeDisabled();
  await page.getByRole('button', { name: 'Découvrir les périmètres autorisés' }).click();
  await expect(resource).toBeEnabled();
  await resource.click();
  await page.getByRole('option', { name: 'PIPELINE_SYSTEM · gz2', exact: true }).click();
  await page.getByRole('button', { name: 'Vérifier et appliquer' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(administrativeRequests).toEqual([]);
  expect(discoveryCompanies).toContain('company');
  expect(discoveryCompanies).toContain('foreign');
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
  await expect(page.getByRole('region', { name: 'Carte régionale autorisée' }).first()).toBeVisible();
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

test('UXR-22 read-only regional map keeps company scope and canonical detail without search grant', async ({ page }) => {
  const legacy: string[] = [];
  const geoJsonRequests: URL[] = [];
  const detailRequests: URL[] = [];
  await page.route('**/api/v1/topology/map/**', route => {
    legacy.push(route.request().url());
    return route.fulfill({ status: 403 });
  });
  await page.route('**/api/v1/topology/regional-map/layers?**', route =>
    route.fulfill({ json: [regionalLayers[0]] }));
  await page.route('**/api/v1/topology/regional-map/layers/pipelines?**', route =>
    route.fulfill({ json: regionalLayers[0] }));
  await page.route('**/api/v1/topology/regional-map/layers/pipelines/features?**', route =>
    route.fulfill({ json: { type: 'FeatureCollection', layer: 'pipelines', page: 0, size: 25,
      totalFeatures: 1, totalPages: 1, hasNext: false, features: [feature] } }));
  await page.route('**/api/v1/topology/regional-map/geojson?**', route => {
    geoJsonRequests.push(new URL(route.request().url()));
    return route.fulfill({ json: { type: 'FeatureCollection', name: 'hidra-regional-topology',
      page: 0, size: 100, totalFeatures: 1, totalPages: 1, hasNext: false,
      layers: ['pipelines'], features: [feature] } });
  });
  await page.route('**/api/v1/topology/regional-map/layers/pipelines/features/p-1?**', route => {
    detailRequests.push(new URL(route.request().url()));
    return route.fulfill({ json: feature });
  });
  await enterSelectedScope(page, regionalMapRoutes, [], false);
  await expect(page.getByRole('textbox', { name: 'Recherche régionale' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Carte régionale autorisée' })).toBeVisible();
  await expect(page.getByText('GZ2-P').first()).toBeVisible();
  await page.getByRole('button', { name: 'Inspecter' }).first().click();
  await expect(page.getByRole('heading', { name: 'GZ2-P', level: 3 })).toBeVisible();
  expect(geoJsonRequests.length).toBeGreaterThan(0);
  expect(detailRequests.length).toBeGreaterThan(0);
  expect(geoJsonRequests.every(url => url.searchParams.get('companyPartyId') === 'company')).toBe(true);
  expect(detailRequests.every(url => url.searchParams.get('companyPartyId') === 'company')).toBe(true);
  expect(legacy).toHaveLength(0);
});

test('UXR-23 uses the exact selected company and separates design from pipeline and section limits', async ({ page }) => {
  const dossier = '/api/v1/topology/pipeline-dossiers/{pipelineId}';
  const pressure = '/api/v1/topology/operating-constraints/pipelines/{pipelineId}';
  const dossierPermission = 'topology:pipeline-dossiers:read';
  const pressurePermission = 'topology:operating-constraints:read';
  const dossierRoutes = [
    ...[dossier, dossier + '/sections', dossier + '/sections/{sectionId}'].map(route => ({
      route, resource: 'pipeline-dossiers', permission: dossierPermission,
    })),
    ...[pressure, pressure + '/sections/{sectionId}'].map(route => ({
      route, resource: 'operating-constraints', permission: pressurePermission,
    })),
  ].map(entry => ({ ...entry, methods: ['GET'], module: 'topology', action: 'read', enforcementStatus: 'backend-enforced' }));
  const scoped = (value: unknown) => async (route: Route) => {
    expect(new URL(route.request().url()).searchParams.get('companyPartyId')).toBe('company');
    await route.fulfill({ json: value });
  };
  await page.route('**/api/v1/topology/regional-map/layers?**', route => route.fulfill({ json: [] }));
  await page.route('**/api/v1/topology/regional-map/search?**', route => route.fulfill({
    json: { totalFeatures: 1, page: 0, size: 25, totalPages: 1, hasNext: false, features: [feature] },
  }));
  await page.route('**/api/v1/topology/regional-map/layers/pipelines/features/p-1?**', scoped(feature));
  const selectedSection = { id: 'section-1', code: 'Section 1' };
  await page.route('**/api/v1/topology/pipeline-dossiers/p-1?**', scoped({
    id: 'p-1', code: 'GZ2-P', designPressure: { availability: 'AVAILABLE', value: 70, unit: 'bar', basis: 'GAUGE' },
  }));
  await page.route('**/api/v1/topology/pipeline-dossiers/p-1/sections?**', scoped({
    items: [selectedSection], page: 0, hasNext: false,
  }));
  await page.route('**/api/v1/topology/pipeline-dossiers/p-1/sections/section-1?**', scoped(selectedSection));
  await page.route('**/api/v1/topology/operating-constraints/pipelines/p-1?**', scoped({
    status: 'QUALIFIED', restrictionClass: 'UPPER_OPERATING_PRESSURE', scopeType: 'PIPELINE',
    pipelineId: 'p-1', conditionCode: 'NORMAL', upperPressure: 55, pressureUnit: 'bar',
    pressureBasis: 'GAUGE', effectiveFrom: '2026-11-01T00:00:00Z', revisionId: 'r1',
    engineeringSourceRevision: 'er1', sourceBaselineReceiptId: 'receipt-1',
  }));
  await page.route('**/api/v1/topology/operating-constraints/pipelines/p-1/sections/section-1?**',
    scoped({ status: 'CONFLICT', upperPressure: 999 }));
  await enterSelectedScope(page, [...regionalMapRoutes, ...dossierRoutes], [
    dossierPermission, pressurePermission, 'topology:regional-resource:read',
  ]);
  await page.getByRole('textbox', { name: 'Recherche régionale' }).fill('GZ2');
  await page.getByRole('button', { name: 'Rechercher dans le périmètre' }).click();
  await page.getByRole('button', { name: 'GZ2-P', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dossier de la conduite' })).toBeVisible();
  await expect(page.getByText(/Pression de conception · 70 bar/)).toBeVisible();
  await page.getByRole('button', { name: 'Section 1', exact: true }).click();
  await expect(page.getByText(/Détail de la section · Section 1/)).toBeVisible();
  await page.getByLabel('Code de condition').fill('NORMAL');
  await page.getByLabel('Instant effectif (UTC, ISO 8601)').fill('2026-11-23T12:00:00Z');
  await page.getByRole('button', { name: 'Consulter les limites' }).click();
  await expect(page.getByText(/Limite qualifiée de la conduite · 55 bar/)).toBeVisible();
  await expect(page.getByText('Limite qualifiée de la section · CONFLICT')).toBeVisible();
  await expect(page.getByText(/999 bar/)).toHaveCount(0);
});

test('UXR-24 reads trusted telemetry from the selected regional station without a legacy fallback', async ({ page }) => {
  const points = '/api/v1/telemetry/assets/{assetType}/{assetId}/points';
  const latest = points + '/{pointId}/trusted-readings/latest';
  const scoped = [points, latest].map(route => ({
    route, methods: ['GET'], module: 'telemetry', resource: 'assets', action: 'read',
    permission: 'telemetry:assets:read', enforcementStatus: 'backend-enforced',
  }));
  const stationList = {
    route: '/api/v1/topology/regional-map/layers/{layerId}/features',
    methods: ['GET'], module: 'topology', resource: 'regional-map', action: 'read',
    permission: 'topology:regional-map:read', enforcementStatus: 'backend-enforced',
  };
  await page.route('**/api/v1/topology/regional-map/layers/facilities/features?**', route => {
    expect(new URL(route.request().url()).searchParams.get('companyPartyId')).toBe('company');
    return route.fulfill({ json: { hasNext: false, features: [{
      id: 'facilities:station-a', properties: { layer: 'facilities', entityId: 'station-a', code: 'GZ2 Station' },
    }] } });
  });
  await page.route('**/api/v1/telemetry/assets/FACILITY/station-a/points?**', route => {
    expect(new URL(route.request().url()).searchParams.get('companyPartyId')).toBe('company');
    return route.fulfill({ json: { at: '2026-01-01T12:00:00Z',
      points: [{ pointId: 'pressure-1', binding: { id: 'binding-a' } }] } });
  });
  await page.route('**/api/v1/telemetry/assets/FACILITY/station-a/points/pressure-1/trusted-readings/latest?**', route => {
    const query = new URL(route.request().url()).searchParams;
    expect(query.get('companyPartyId')).toBe('company');
    expect(query.get('maxAgeSeconds')).toBe('120');
    return route.fulfill({ json: {
      status: 'STALE', maxAgeSeconds: 120, evaluatedAt: '2026-01-01T12:00:00Z',
      observation: { numericValue: 42, unitId: 'bar', observedAt: '2026-01-01T11:57:30Z',
        freshness: 'STALE', ageSeconds: 150, binding: { id: 'binding-a' } },
    } });
  });
  const legacy: string[] = [];
  await page.route('**/api/v1/telemetry/points/**', route => {
    legacy.push(route.request().url());
    return route.fulfill({ status: 403 });
  });
  await enterSelectedScope(page, [...scoped, stationList], ['telemetry:assets:read']);
  await page.getByRole('navigation', { name: 'Navigation principale' })
    .getByRole('button', { name: 'Opérations', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Télémétrie qualifiée par actif' });
  await panel.getByRole('combobox', { name: 'Station régionale' }).click();
  await page.getByRole('option', { name: 'GZ2 Station' }).click();
  await panel.getByRole('combobox', { name: 'Point mis en service' }).click();
  await page.getByRole('option', { name: 'pressure-1' }).click();
  await panel.getByRole('spinbutton', { name: 'Âge maximal (secondes)' }).fill('120');
  await panel.getByRole('button', { name: 'Appliquer le seuil' }).click();
  await expect(panel.getByText(/42 bar.*STALE.*150 s.*binding-a/)).toBeVisible();
  await expect(panel.getByText(/Aperçu de station sans placement de signaux/)).toBeVisible();
  expect(legacy).toEqual([]);
});
