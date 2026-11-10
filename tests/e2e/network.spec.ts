import { expect, test, type Locator, type Page } from '@playwright/test';

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

async function chooseLanguage(page: Page, language: 'EN' | 'FR' | 'AR') {
  await page.getByRole('combobox', { name: /^(Language|Langue|اللغة)$/ }).click();
  await page.getByRole('option', { name: language, exact: true }).click();
}

async function openPreview(page: Page, language: 'EN' | 'FR' = 'EN') {
  await mockBackend(page);
  await signIn(page);
  await page.getByRole('button', { name: 'Réseau' }).click();
  await page.getByRole('link', { name: 'Ouvrir l’aperçu synthétique' }).click();
  await expect(page).toHaveURL(/\/network\?view=preview$/);
  await expect(page.getByRole('heading', { name: 'Aperçu synthétique du réseau' })).toBeVisible();
  if (language === 'EN') await chooseLanguage(page, 'EN');
  await expect(page.getByRole('button', { name: language === 'EN' ? 'Network' : 'Réseau' })).toBeVisible();
}

function workspace(page: Page) {
  return {
    role: page.getByLabel('Demo role'),
    system: page.getByLabel('Pipeline system'),
    window: page.getByLabel('Time window', { exact: false }),
    map: page.getByRole('region', { name: 'Station map' }),
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
    const evidence = page.getByRole('region', { name: 'Atlas Compression', exact: true });
    await expect(evidence.getByText('demo-gz2-atlas', { exact: true })).toBeVisible();
    await expect(evidence.getByText('06:00–10:00 UTC', { exact: true })).toBeVisible();
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
  await expect(page.getByRole('checkbox', { name: 'Pipelines' })).not.toBeChecked();
  await expect(view.map.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Reset preview' }).click();
  await expectAtlas();
  await expect(page.getByRole('checkbox', { name: 'Pipelines' })).toBeChecked();

  await page.getByRole('link', { name: 'Return to operational map' }).click();
  await expect(page).toHaveURL(/\/network$/);
  await expect(page.getByRole('heading', { name: 'Network & topology' })).toBeVisible();
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
  await page.getByRole('button', { name: 'Collapse navigation' }).click();
  await page.getByRole('link', { name: 'Return to operational map' }).focus();

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
  await expect(page.getByRole('heading', { name: 'Aperçu synthétique du réseau' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ouvrir l’aperçu synthétique' })).toHaveCount(0);
});

test('preview fixture interactions use no operational data or persistent browser state', async ({ page, context, baseURL }) => {
  await mockBackend(page);
  const requests: Array<{ origin: string; pathname: string; method: string }> = [];
  page.on('request', (request) => {
    const { origin, pathname } = new URL(request.url());
    requests.push({ origin, pathname, method: request.method() });
  });
  const basemapResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname.endsWith('/north-africa.geojson') && !url.search;
  });
  await signInFrom(page, '/network?view=preview');
  await expect(page.getByRole('heading', { name: 'Aperçu synthétique du réseau' })).toBeVisible();
  const basemap = await basemapResponse;
  expect(basemap.ok()).toBe(true);
  const geography = await basemap.json();
  expect(geography.type).toBe('FeatureCollection');
  expect(geography.features.length).toBeGreaterThan(1);
  await chooseLanguage(page, 'EN');
  await expect(page.getByRole('heading', { name: 'Synthetic network preview' })).toBeVisible();
  const sessionStorageBefore = await page.evaluate(() => [localStorage.length, sessionStorage.length]);
  const cookiesBefore = await context.cookies();
  const view = workspace(page);

  await page.getByRole('button', { name: 'Open investigation' }).click();
  const investigation = page.getByRole('region', { name: 'Station investigation' });
  await investigation.getByRole('button', { name: 'Review fixture evidence' }).click();
  await investigation.getByRole('button', { name: 'Simulate acknowledgement' }).click();
  await expect(investigation.getByText('Alarm acknowledged')).toBeVisible();
  await page.getByRole('button', { name: 'Open digital-twin decision' }).click();
  const twin = page.getByRole('region', { name: 'Digital-twin decision preview' });
  await createTwinProposal(twin);
  await twin.getByLabel('Decision actor').selectOption('reviewer');
  await twin.getByRole('button', { name: /Review proposal/ }).click();
  await twin.getByLabel('Decision rationale').fill('Review the fixture pressure comparison.');
  await twin.getByRole('button', { name: 'Approve proposal' }).click();
  await expect(twin.getByText('Follow-up outcome · Unavailable · Unresolved')).toBeVisible();
  await investigation.getByRole('button', { name: 'Close investigation' }).click();

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

test('the preview follows French, Arabic and English without resetting the selected station', async ({ page }) => {
  await openPreview(page, 'FR');
  await expect(page.getByRole('region', { name: 'Télémétrie' })).toContainText('64,1 bar(g)');
  const map = page.getByRole('region', { name: 'Carte des stations' });
  await expect(map.getByRole('button', { name: 'Agrandir la carte' })).toBeVisible();
  await map.getByRole('button', { name: 'Sélectionner Entrée Ouest sur la carte' }).click();
  await expect(page.getByRole('heading', { name: 'Entrée Ouest' })).toBeVisible();

  await chooseLanguage(page, 'AR');
  const arabicPreview = page.getByRole('region', { name: 'معاينة الشبكة الاصطناعية' });
  await expect(arabicPreview).toHaveAttribute('dir', 'rtl');
  await expect(arabicPreview.getByRole('heading', { name: 'المدخل الغربي' })).toBeVisible();
  await expect(arabicPreview.getByRole('button', { name: 'تكبير الخريطة' })).toBeVisible();
  await expect(arabicPreview.getByRole('button', { name: 'اختر المدخل الغربي على الخريطة' })).toHaveAttribute('aria-pressed', 'true');
  await expect(arabicPreview.getByRole('region', { name: 'إنذار', exact: true })).toContainText('لا توجد سجلات في هذه الفترة.');

  await chooseLanguage(page, 'EN');
  await expect(page.getByRole('heading', { name: 'West Intake' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Synthetic network preview' })).toHaveAttribute('dir', 'ltr');
});

test('station investigation opens from the map and linked alarm with the same evidence and separate simulated events', async ({ page }) => {
  await openPreview(page);
  const view = workspace(page);
  await view.map.getByRole('button', { name: 'Select West Intake on map' }).click();
  await view.map.getByRole('button', { name: 'Select Atlas Compression on map' }).click();
  await page.getByRole('button', { name: 'Open investigation' }).click();
  const panel = page.getByRole('region', { name: 'Station investigation' });
  const timeline = panel.getByRole('region', { name: 'Simulated investigation timeline' });
  await expect(panel.getByRole('heading', { name: 'Station investigation' })).toBeFocused();
  await expect(panel).toContainText('demo-gz2-atlas');
  await expect(panel).toContainText('06:00–10:00 UTC');
  await expect(panel).toContainText('REV-A03');
  await expect(panel).toContainText('64.1 bar(g)');
  await expect(panel).toContainText('DEMO-204');
  await panel.getByRole('button', { name: 'Close investigation' }).click();
  await expect(page.getByRole('button', { name: 'Open investigation' })).toBeFocused();

  await view.tree.getByRole('button', { name: /West Intake/ }).click();
  await view.tree.getByRole('button', { name: /Low discharge pressure/ }).click();
  await expect(panel).toContainText('demo-gz2-atlas');
  await expect(panel).toContainText('REV-A03');

  async function record(button: string) {
    await panel.getByRole('button', { name: 'Review fixture evidence' }).click();
    await panel.getByRole('button', { name: button }).click();
  }
  await record('Simulate acknowledgement');
  await expect(timeline.getByRole('listitem')).toHaveCount(1);
  await expect(panel.getByText('Condition active', { exact: true })).toBeVisible();
  await record('Add simulated follow-up');
  await expect(timeline.getByRole('listitem')).toHaveCount(2);
  await expect(panel.getByText('Condition active', { exact: true })).toBeVisible();
  await record('Advance fixture to resolution');

  await panel.getByRole('button', { name: 'Close investigation' }).click();
  await page.getByRole('button', { name: 'Open investigation' }).click();
  const events = timeline.getByRole('listitem');
  await expect(events).toHaveCount(3);
  await expect(events.nth(0)).toContainText('Alarm acknowledged');
  await expect(events.nth(0)).toContainText('Scoped operator · 09:46 UTC');
  await expect(events.nth(1)).toContainText('Follow-up recorded');
  await expect(events.nth(2)).toContainText('Condition resolved by fixture');
  await expect(events.nth(2)).toContainText('Fixture scenario · 09:48 UTC');
  for (const event of await events.all()) {
    await expect(event).toContainText('Original fixture evidence · network-fixture-v2 · REV-A03 · DEMO-204 · Telemetry 09:45 UTC');
  }

  await page.getByRole('button', { name: 'Reset preview' }).click();
  await expect(panel).toHaveCount(0);
  await page.getByRole('button', { name: 'Open investigation' }).click();
  await expect(timeline).toContainText('No simulated events in this context.');
  await expect(panel.getByText('Condition active', { exact: true })).toBeVisible();
});

test('station investigation rejects stale and degraded evidence and scopes history to permitted roles', async ({ page }) => {
  await openPreview(page);
  const view = workspace(page);
  await page.getByRole('button', { name: 'Open investigation' }).click();
  const panel = page.getByRole('region', { name: 'Station investigation' });
  const timeline = panel.getByRole('region', { name: 'Simulated investigation timeline' });
  const review = panel.getByRole('button', { name: 'Review fixture evidence' });
  await review.click();
  await panel.getByRole('button', { name: 'Simulate acknowledgement' }).click();
  await review.click();
  await view.window.selectOption('afternoon');
  await panel.getByRole('button', { name: 'Simulate acknowledgement' }).click();
  await expect(panel.getByRole('status')).toContainText('The reviewed context has changed.');
  await expect(timeline.getByRole('listitem')).toHaveCount(0);
  await review.click();
  await expect(panel.getByRole('status')).toContainText('Current evidence is incomplete or degraded.');
  await view.window.selectOption('morning');
  await expect(timeline.getByRole('listitem')).toHaveCount(1);

  await view.role.selectOption('observer');
  await expect(timeline).toContainText('Alarm acknowledged');
  await expect(review).toHaveCount(0);
  await expect(panel.getByRole('button', { name: 'Add simulated follow-up' })).toHaveCount(0);

  for (const role of ['otherScope', 'otherCompany']) {
    await view.role.selectOption(role);
    await expect(panel).toHaveCount(0);
    await expect(page.getByText('Alarm acknowledged')).toHaveCount(0);
  }
});

test('the investigation follows the app language and can be opened by keyboard at a narrow width', async ({ page }) => {
  await openPreview(page, 'FR');
  await page.setViewportSize({ width: 360, height: 740 });
  await page.getByRole('button', { name: 'Réduire la navigation' }).click();
  await page.getByRole('button', { name: 'Ouvrir l’investigation' }).focus();
  await page.keyboard.press('Enter');
  const french = page.getByRole('region', { name: 'Investigation de la station' });
  await expect(french.getByRole('heading', { name: 'Investigation de la station' })).toBeFocused();
  await expect(french).toContainText('64,1 bar(g)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);

  await page.setViewportSize({ width: 1280, height: 740 });
  await chooseLanguage(page, 'AR');
  const arabic = page.getByRole('region', { name: 'التحقيق في حالة المحطة' });
  await expect(arabic).toContainText('ضغط مخرج المحطة');
  await expect(arabic.getByRole('button', { name: 'مراجعة بيانات العرض' })).toBeVisible();
  await chooseLanguage(page, 'EN');
  await expect(page.getByRole('region', { name: 'Station investigation' })).toContainText('REV-A03');
});

async function openTwin(page: Page) {
  await openPreview(page);
  await page.getByRole('button', { name: 'Open investigation' }).click();
  await page.getByRole('button', { name: 'Open digital-twin decision' }).click();
  return page.getByRole('region', { name: 'Digital-twin decision preview' });
}

async function createTwinProposal(twin: Locator) {
  await twin.getByRole('button', { name: 'Load precomputed comparison' }).click();
  await twin.getByLabel('Decision actor').selectOption('engineer');
  await twin.getByRole('button', { name: 'Propose the modeled alternative' }).click();
}

test('digital-twin comparison and independent review reopen with the original sources and unresolved outcome', async ({ page }) => {
  const twin = await openTwin(page);
  const manifest = twin.getByRole('region', { name: 'Versioned input manifest' });
  await expect(manifest).toContainText('GZ2-ATLAS-PRESSURE-v1');
  await expect(manifest).toContainText('REV-A03');
  await expect(manifest).toContainText('64.1 bar(g) · 09:45 UTC · DEMO-204');
  await createTwinProposal(twin);

  const comparison = twin.getByRole('table', { name: 'Synthetic pressure comparison' });
  await expect(comparison.getByRole('row', { name: /Fixture observation/ })).toContainText('64.1 bar(g)');
  await expect(comparison.getByRole('row', { name: /Precomputed baseline/ })).toContainText('64.0 bar(g)');
  await expect(comparison.getByRole('row', { name: /Precomputed alternative/ })).toContainText('65.2 bar(g)');
  await expect(twin.getByRole('button', { name: /Review proposal/ })).toHaveCount(0);

  await twin.getByLabel('Decision actor').selectOption('reviewer');
  await twin.getByRole('button', { name: 'Review proposal · F21-P1' }).click();
  await twin.getByRole('button', { name: 'Approve proposal' }).click();
  await expect(twin.getByRole('status')).toContainText('Enter a rationale');
  await twin.getByLabel('Decision rationale').fill('The fixture comparison warrants further review.');
  await twin.getByRole('button', { name: 'Approve proposal' }).click();

  await twin.getByRole('button', { name: 'Close digital-twin decision' }).click();
  await expect(page.getByRole('button', { name: 'Open digital-twin decision' })).toBeFocused();
  await page.getByRole('button', { name: 'Open digital-twin decision' }).click();
  const events = twin.getByRole('region', { name: 'Digital-twin decision history' }).getByRole('listitem');
  await expect(events).toHaveCount(3);
  await expect(events.nth(2)).toContainText('Proposal approved F21-P1');
  await expect(events.nth(2)).toContainText('Independent demo reviewer · 09:51 UTC');
  await expect(events.nth(2)).toContainText('GZ2-ATLAS-PRESSURE-v1 · REV-A03 · F21-FIXTURE-RUN-01');
  await expect(events.nth(2)).toContainText('The fixture comparison warrants further review.');
  await expect(twin.getByText('Follow-up outcome · Unavailable · Unresolved')).toBeVisible();

  await page.getByRole('button', { name: 'Reset preview' }).click();
  await expect(twin).toHaveCount(0);
  await page.getByRole('button', { name: 'Open investigation' }).click();
  await page.getByRole('button', { name: 'Open digital-twin decision' }).click();
  await expect(events).toHaveCount(0);
  await expect(comparison).toHaveCount(0);
});

test('digital-twin preview blocks incomplete inputs and stale decisions and scopes history', async ({ page }) => {
  const twin = await openTwin(page);
  const input = twin.getByLabel('Input revision fixture');
  const history = twin.getByRole('region', { name: 'Digital-twin decision history' });
  for (const [mode, message] of [
    ['missing', 'The required fixture inputs are missing or degraded.'],
    ['incompatible', 'The fixture input revision is incompatible with this comparison.'],
  ]) {
    await input.selectOption(mode);
    await twin.getByRole('button', { name: 'Load precomputed comparison' }).click();
    await expect(twin.getByRole('status')).toHaveText(message);
    await expect(twin.getByRole('table')).toHaveCount(0);
    await expect(history.getByRole('listitem')).toHaveCount(0);
  }

  await input.selectOption('matched');
  await createTwinProposal(twin);
  await twin.getByLabel('Decision actor').selectOption('reviewer');
  await twin.getByRole('button', { name: /Review proposal/ }).click();
  await twin.getByLabel('Decision rationale').fill('Prior window reviewed.');
  await workspace(page).window.selectOption('afternoon');
  await twin.getByRole('button', { name: 'Reject proposal' }).click();
  await expect(twin.getByRole('status')).toContainText('The reviewed proposal or input context has changed.');
  await expect(history.getByRole('listitem')).toHaveCount(0);
  await workspace(page).window.selectOption('morning');
  await expect(history.getByRole('listitem')).toHaveCount(2);

  await workspace(page).role.selectOption('observer');
  await expect(history).toContainText('Alternative proposed');
  await expect(twin.getByLabel('Decision actor')).toHaveCount(0);
  await expect(twin.getByRole('button', { name: /Review proposal/ })).toHaveCount(0);
  for (const role of ['otherScope', 'otherCompany']) {
    await workspace(page).role.selectOption(role);
    await expect(twin).toHaveCount(0);
    await expect(page.getByText('F21-P1')).toHaveCount(0);
  }
});

test('digital-twin preview supports narrow keyboard entry and localized RTL copy', async ({ page }) => {
  await openPreview(page, 'FR');
  await page.getByRole('button', { name: 'Ouvrir l’investigation' }).click();
  await page.setViewportSize({ width: 360, height: 740 });
  await page.getByRole('button', { name: 'Réduire la navigation' }).click();
  await page.getByRole('button', { name: 'Ouvrir la décision du jumeau numérique' }).focus();
  await page.keyboard.press('Enter');
  const french = page.getByRole('region', { name: 'Aperçu décisionnel du jumeau numérique' });
  await expect(french.getByRole('heading', { name: 'Aperçu décisionnel du jumeau numérique' })).toBeFocused();
  await expect(french).toContainText('64,1 bar(g)');
  await french.getByRole('button', { name: 'Charger la comparaison précalculée' }).click();
  await expect(french.getByRole('table')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);

  await page.setViewportSize({ width: 1280, height: 740 });
  await chooseLanguage(page, 'AR');
  const arabic = page.getByRole('region', { name: 'معاينة قرارات التوأم الرقمي' });
  await expect(arabic).toBeVisible();
  await expect(arabic.getByRole('table', { name: 'مقارنة اصطناعية للضغط' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await chooseLanguage(page, 'EN');
  await expect(page.getByRole('region', { name: 'Digital-twin decision preview' })).toContainText('REV-A03');
});


test('F21 six synthetic interfaces present six scoped and keyboard-selectable views', async ({ page }) => {
  await openPreview(page);
  const six = page.getByRole('region', { name: 'Six-view digital twin simulation' });
  await expect(six).toContainText('six-interface-preview-v2');
  await expect(six.getByRole('tab')).toHaveCount(6);
  const names = [
    '1. Geographic / Spatial', '2. Hydraulic & Elevation', '3. Logical Schematic / P&ID',
    '4. Telemetry & Analytics', '5. Asset Integrity', '6. 2D Station',
  ];
  for (const name of names) {
    await six.getByRole('tab', { name, exact: true }).click();
    await expect(six.getByRole('tabpanel')).toBeVisible();
    await expect(six.getByRole('tabpanel').locator('svg.six-view-figure[role="img"]')).toBeVisible();
  }
  await six.getByRole('tab', { name: names[0] }).focus();
  await page.keyboard.press('End');
  await expect(six.getByRole('tab', { name: names[5] })).toHaveAttribute('aria-selected', 'true');
  await six.getByRole('tab', { name: names[0] }).click();
  await six.getByRole('checkbox', { name: 'Demo HCA polygon' }).check();
  await six.getByRole('checkbox', { name: 'Demo water crossing' }).check();
  await expect(six.getByRole('checkbox', { name: 'Demo HCA polygon' })).toBeChecked();
  await expect(six).toContainText('exact anomaly GPS unknown');
});

test('F21 six-view telemetry excludes stale readings and supports historical comparison', async ({ page }) => {
  await openPreview(page);
  const six = page.getByRole('region', { name: 'Six-view digital twin simulation' });
  await six.getByRole('tab', { name: '4. Telemetry & Analytics' }).click();
  await expect(six).toContainText('65.8');
  await expect(six.getByRole('button', { name: /Overlay historical samples/ })).toBeDisabled();
  await workspace(page).tree.getByRole('button', { name: /West Intake/ }).click();
  await expect(six.getByRole('button', { name: /Overlay historical samples/ })).toBeEnabled();
  await six.getByRole('button', { name: /Overlay historical samples/ }).click();
  await expect(six).toContainText('Other fixture window: 65.2');
  await workspace(page).tree.getByRole('list', { name: 'Stations' }).getByRole('button', { name: /Atlas Compression/ }).click();
  await workspace(page).window.selectOption('afternoon');
  await expect(six.getByRole('status')).toContainText('Stale evidence');
  await expect(six.getByRole('img')).toHaveCount(0);
});

test('F21 six views protect demo scope, localize and expose no control commands', async ({ page }) => {
  await openPreview(page);
  const six = page.getByRole('region', { name: 'Six-view digital twin simulation' });
  await six.getByRole('tab', { name: '3. Logical Schematic / P&ID' }).click();
  await expect(six).toContainText('No valve actuation or SCADA/PLC commands');
  for (const role of ['otherScope', 'otherCompany']) {
    await workspace(page).role.selectOption(role);
    await expect(six).toHaveCount(0);
    await expect(page.getByText('DEMO-W-1')).toHaveCount(0);
  }
  await workspace(page).role.selectOption('operator');
  await expect(six.getByRole('tab')).toHaveCount(6);
  await chooseLanguage(page, 'AR');
  await expect(page.getByRole('region', { name: 'محاكاة التوأم الرقمي بست واجهات' })).toBeVisible();
  await chooseLanguage(page, 'FR');
  await expect(page.getByRole('region', { name: 'Simulation du jumeau numérique en six vues' })).toBeVisible();
  await page.getByRole('button', { name: 'Réinitialiser l’aperçu' }).click();
  await expect(page.getByRole('region', { name: 'Simulation du jumeau numérique en six vues' })
    .getByRole('tab', { name: /Géographie/ })).toHaveAttribute('aria-selected', 'true');
});


test('F21 corrective review uses conventional process symbols and intermediate terrain elevation points', async ({ page }) => {
  await openPreview(page);
  const six = page.getByRole('region', { name: 'Six-view digital twin simulation' });

  await six.getByRole('tab', { name: '1. Geographic / Spatial' }).click();
  await expect(six.locator('[data-pid-symbol="station-marker"]')).toHaveCount(3);

  await six.getByRole('tab', { name: '2. Hydraulic & Elevation' }).click();
  await expect(six).toContainText('Illustrative intermediate elevation points');
  const profile = six.getByRole('tabpanel');
  await expect(profile.locator('[data-elevation-point]')).toHaveCount(14);
  await expect(profile.locator('[data-station-elevation]')).toHaveCount(3);
  await expect(profile.locator('[data-profile-chainage="76"]')).toContainText('370');
  await expect(profile.locator('[data-profile-chainage="76"]')).toContainText('Intermediate terrain point');
  await expect(profile.locator('[data-profile-chainage="85"]')).toContainText('Atlas Compression');
  await expect(profile.locator('[data-profile-chainage="85"]')).toContainText('340');

  await six.getByRole('tab', { name: '3. Logical Schematic / P&ID' }).click();
  await expect(six.locator('svg.six-view-figure [data-pid-symbol="station-boundary"]')).toHaveCount(3);
  await expect(six.locator('svg.six-view-figure [data-pid-symbol="gate-valve"]')).toHaveCount(3);
  await expect(six.locator('svg.six-view-figure [data-pid-symbol="compressor"]')).toHaveCount(1);
  await expect(six.locator('svg.six-view-figure [data-pid-symbol="flow-transmitter"]')).toHaveCount(2);
  await expect(six).toContainText('not a reviewed ISO/ISA symbol catalog');
  await expect(six).toContainText('No valve actuation or SCADA/PLC commands');

  await six.getByRole('tab', { name: '6. 2D Station' }).click();
  await expect(six.locator('svg.six-view-figure [data-pid-symbol="gate-valve"]')).toHaveCount(3);
  await expect(six.locator('svg.six-view-figure [data-pid-symbol="compressor"]')).toHaveCount(1);
  await expect(six.locator('svg.six-view-figure [data-pid-symbol="station-boundary"]')).toHaveCount(1);
  await chooseLanguage(page, 'FR');
  await expect(page.getByRole('region', { name: 'Simulation du jumeau numérique en six vues' }))
    .toContainText('Symboles conventionnels de type P&ID');
  await chooseLanguage(page, 'AR');
  await expect(page.getByRole('region', { name: 'محاكاة التوأم الرقمي بست واجهات' }))
    .toContainText('رموز شائعة');
});
