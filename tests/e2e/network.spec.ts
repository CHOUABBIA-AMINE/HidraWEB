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

async function mockBackend(page: Page, grants = effectivePermissions) {
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
  await page.route('**/api/v1/organization/responsibilities?**', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: grants }));
  await page.route('**/api/v1/topology/map/layers/facilities/features?**', (route) => route.fulfill({ json: { ...collection, layer: 'facilities', size: 25 } }));
  await page.route('**/api/v1/topology/map/layers/facilities', (route) => route.fulfill({ json: layer }));
  await page.route('**/api/v1/topology/map/layers', (route) => route.fulfill({ json: [layer] }));
  await page.route('**/api/v1/topology/map/geojson?**', (route) => route.fulfill({ json: collection }));
  await page.route('**/api/v1/topology/map/search?**', (route) => route.fulfill({
    json: { query: 'FAC', type: 'FeatureCollection', page: 0, size: 50, totalFeatures: 1, totalPages: 1, hasNext: false, features: [feature] },
  }));
}

async function signInFrom(page: Page, path: string) {
  await page.goto(path);
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
}

async function signIn(page: Page) {
  await signInFrom(page, '/overview');
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

async function openPreview(page: Page) {
  await mockBackend(page);
  await signIn(page);
  await page.getByRole('button', { name: 'Réseau' }).click();
  await page.getByRole('link', { name: 'Ouvrir l’aperçu synthétique' }).click();
  await expect(page).toHaveURL(/\/network\?view=preview$/);
  await expect(page.getByRole('heading', { name: 'Synthetic network preview' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Réseau' })).toBeVisible();
}

function workspace(page: Page) {
  return {
    role: page.getByLabel('Demo role'),
    system: page.getByLabel('Pipeline system'),
    window: page.getByLabel('Time window', { exact: false }),
    map: page.getByRole('group', { name: 'Station map' }),
    tree: page.getByRole('region', { name: 'Asset tree' }),
    telemetry: page.getByRole('region', { name: 'Telemetry' }),
    technical: page.getByRole('region', { name: 'Technical revision' }),
    alarm: page.getByRole('region', { name: 'Alarm', exact: true }),
  };
}

test('map, tree and linked alarm open the same fixture asset and UTC window', async ({ page }) => {
  await openPreview(page);
  const view = workspace(page);
  const treeAtlas = view.tree.getByRole('list', { name: 'Stations' }).getByRole('button', { name: /Atlas Compression/ });
  const mapAtlas = view.map.getByRole('button', { name: 'Select Atlas Compression on map' });
  async function expectAtlas() {
    await expect(treeAtlas).toHaveAttribute('aria-pressed', 'true');
    await expect(mapAtlas).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('demo-gz2-atlas', { exact: true })).toBeVisible();
    await expect(page.getByText('06:00–10:00 UTC', { exact: true }).last()).toBeVisible();
    await expect(view.technical).toContainText('REV-A03');
    await expect(view.telemetry).toContainText('64.1 bar(g)');
    await expect(view.telemetry.locator('time')).toHaveAttribute('datetime', '2026-11-06T09:45:00Z');
    await expect(view.alarm).toContainText('DEMO-204');
  }

  await view.tree.getByRole('button', { name: /West Intake/ }).click();
  await mapAtlas.click();
  await expectAtlas();

  await view.map.getByRole('button', { name: 'Select East Delivery on map' }).click();
  await treeAtlas.click();
  await expectAtlas();

  await view.tree.getByRole('button', { name: /West Intake/ }).click();
  await view.tree.getByRole('button', { name: /Low discharge pressure/ }).click();
  await expectAtlas();

  await page.getByRole('checkbox', { name: 'Stations' }).uncheck();
  await expect(mapAtlas).toHaveCount(0);
  await expect(treeAtlas).toBeVisible();
  await page.getByRole('checkbox', { name: 'Pipelines' }).uncheck();
  await expect(view.map.locator('.corridor')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset preview' }).click();
  await expectAtlas();
  await expect(view.map.locator('.corridor')).toBeVisible();

  await page.getByRole('link', { name: 'Revenir à la carte opérationnelle' }).click();
  await expect(page).toHaveURL(/\/network$/);
  await expect(page.getByRole('heading', { name: 'Réseau & topologie' })).toBeVisible();
  await expect(page.getByText('FAC-1')).toBeVisible();
  await expect(view.telemetry).toHaveCount(0);
});

test('time and system changes replace evidence and distinguish stale, empty and unavailable', async ({ page }) => {
  await openPreview(page);
  const view = workspace(page);
  await view.window.selectOption('afternoon');
  await expect(view.technical).toContainText('REV-A04');
  await expect(view.telemetry).toContainText('Stale');
  await expect(view.telemetry).toContainText('64.2 bar(g)');
  await expect(view.alarm).toContainText('Unavailable');
  await expect(page.getByText('DEMO-204', { exact: false })).toHaveCount(0);
  await view.tree.getByRole('button', { name: /West Intake/ }).click();
  await expect(view.alarm).toContainText('Empty');
  await expect(view.alarm).toContainText('No records in this window.');

  await view.system.selectOption('orion');
  await expect(page.getByText('East Gas Control', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Select a station' })).toBeVisible();
  await expect(view.telemetry).toHaveCount(0);
  await expect(page.getByText('West Gas Control', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Atlas Compression', { exact: false })).toHaveCount(0);
  await view.map.getByRole('button', { name: 'Select Cedar Entry on map' }).click();
  await expect(view.technical).toContainText('REV-C02');
  await expect(view.telemetry).toContainText('Empty');
  await view.window.selectOption('morning');
  await expect(view.technical).toContainText('REV-C01');

  await page.getByRole('button', { name: 'Reset preview' }).click();
  await expect(view.system).toHaveValue('gz2');
  await expect(view.window).toHaveValue('morning');
  await expect(view.technical).toContainText('REV-A03');
});

test('both authorized roles can read and denied scopes disclose no protected fixture context', async ({ page }) => {
  await openPreview(page);
  const view = workspace(page);
  await expect(view.alarm).toContainText('DEMO-204');
  await view.role.selectOption('observer');
  await expect(view.alarm).toContainText('DEMO-204');

  const scopeStatus = page.getByRole('region', { name: 'Scope status' });
  let deniedStatus: string | undefined;
  for (const role of ['otherScope', 'otherCompany']) {
    await view.role.selectOption(role);
    await expect(scopeStatus.getByRole('status')).toHaveText('No workspace is available in this demo scope.');
    const status = await scopeStatus.innerText();
    expect(status).toBe(deniedStatus ?? status);
    deniedStatus = status;
    await expect(view.system).toBeDisabled();
    await expect(view.system.locator('option')).toHaveText(['No system available']);
    await expect(view.map).toHaveCount(0);
    await expect(view.tree).toHaveCount(0);
    await expect(view.alarm).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText(/West Gas Control|GZ2|Orion|Atlas|DEMO-204|REV-A03/);
  }

  await view.role.selectOption('operator');
  await expect(page.getByRole('heading', { name: 'Select a station' })).toBeVisible();
  await expect(view.alarm).toHaveCount(0);
});

test('narrow workspace supports keyboard selection with visible focus', async ({ page }) => {
  await openPreview(page);
  await page.setViewportSize({ width: 360, height: 740 });
  await page.getByRole('button', { name: 'Réduire la navigation' }).click();
  await page.getByRole('link', { name: 'Revenir à la carte opérationnelle' }).focus();

  const target = workspace(page).tree.getByRole('button', { name: /West Intake/ });
  for (let step = 0; step < 10 && !(await target.evaluate((element) => element === document.activeElement)); step += 1) {
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
  await expect(target).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(target).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'West Intake' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
});

test('preview deep link requires authentication and topology map permission', async ({ page }) => {
  await mockBackend(page, []);
  await signInFrom(page, '/network?view=preview');
  await expect(page).toHaveURL(/\/network\?view=preview$/);
  await expect(page.getByRole('alert')).toContainText('La capacité de lecture topology');
  await expect(page.getByRole('heading', { name: 'Synthetic network preview' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ouvrir l’aperçu synthétique' })).toHaveCount(0);
});

test('preview fixture interactions use no operational data or persistent browser state', async ({ page, context, baseURL }) => {
  await mockBackend(page);
  const requests: Array<{ origin: string; pathname: string; method: string }> = [];
  page.on('request', (request) => {
    const { origin, pathname } = new URL(request.url());
    requests.push({ origin, pathname, method: request.method() });
  });
  await signInFrom(page, '/network?view=preview');
  await expect(page.getByRole('heading', { name: 'Synthetic network preview' })).toBeVisible();
  const sessionStorageBefore = await page.evaluate(() => [localStorage.length, sessionStorage.length]);
  const cookiesBefore = await context.cookies();
  const view = workspace(page);

  await view.system.selectOption('orion');
  await view.window.selectOption('afternoon');
  await view.map.getByRole('button', { name: 'Select Cedar Entry on map' }).click();
  await expect(view.technical).toContainText('REV-C02');
  await page.getByRole('button', { name: 'Reset preview' }).click();
  await expect(view.technical).toContainText('REV-A03');
  await expect(view.system).toHaveValue('gz2');
  await expect(view.window).toHaveValue('morning');

  expect(requests.filter(({ origin }) => origin !== baseURL)).toEqual([]);
  const apiRequests = requests.filter(({ pathname }) => pathname.startsWith('/api/'));
  expect(apiRequests.length).toBeGreaterThan(0);
  for (const { pathname, method } of apiRequests) {
    if (method === 'POST') expect(pathname).toBe('/api/v1/identity/authentication/login');
    else {
      expect(method).toBe('GET');
      expect(pathname).toMatch(/^\/api\/v1\/(identity\/me(?:\/permissions)?|security\/permissions\/(?:routes|catalog)|organization\/responsibilities)$/);
    }
  }
  expect(await context.cookies()).toEqual(cookiesBefore);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual(sessionStorageBefore);
});
