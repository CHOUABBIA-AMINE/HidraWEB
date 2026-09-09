import { expect, test, type Page } from '@playwright/test';

const routes = [
  {
    route: '/api/v1/topology/map/layers', methods: ['GET'], module: 'topology', resource: 'map', action: 'read',
    permission: 'HIDRA_TOPOLOGY_MAP_READ', enforcementStatus: 'metadata-published; route-specific authorization annotations unavailable from current HidraAPI evidence',
  },
  {
    route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow', resource: 'tasks', action: 'read',
    permission: 'HIDRA_WORKFLOW_TASKS_READ', enforcementStatus: 'metadata-published; route-specific authorization annotations unavailable from current HidraAPI evidence',
  },
];

const catalog = {
  strategy: 'derived-route-permission-catalog',
  enforcement: 'catalog-only; backend currently authenticates all operational routes and does not expose route-specific @PreAuthorize evidence',
  permissionFormat: 'HIDRA_<MODULE>_<RESOURCE>_<ACTION>',
  routes,
};

async function mockPermissions(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: catalog }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-002 authenticates and builds a capability-filtered accessible shell', async ({ page }) => {
  await mockPermissions(page);
  await signIn(page);

  await expect(page.getByRole('button', { name: 'Réseau' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Planification' })).toHaveCount(0);

  const toggle = page.getByRole('button', { name: 'Réduire la navigation' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Développer la navigation' })).toHaveAttribute('aria-expanded', 'false');
});

test('HWEB-002 keeps a rejected Basic authentication request on the 401 sign-in state', async ({ page }) => {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ status: 401, json: { status: 401, title: 'Unauthorized' } }));
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('wrong');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('alert')).toContainText('Unauthorized');
  await expect(page).toHaveURL(/\/login$/);
});

test('HWEB-002 renders the global 403 state when HidraAPI refuses permission metadata', async ({ page }) => {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ status: 403, json: { status: 403, title: 'Forbidden' } }));
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Accès refusé' })).toBeVisible();
});

test('HWEB-002 renders the authenticated 404 state inside the shell', async ({ page }) => {
  await mockPermissions(page);
  await signIn(page);
  await page.evaluate(() => {
    window.history.pushState({}, '', '/unknown-hidra-route');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
  await expect(page.getByText('Hidra', { exact: true })).toBeVisible();
});
