import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/topology/map/layers', methods: ['GET'], module: 'topology', resource: 'map', action: 'read', permission: 'topology:map:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/integrity/assessments', methods: ['GET'], module: 'integrity', resource: 'assessments', action: 'read', permission: 'integrity:assessments:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/assets/maintainable-assets', methods: ['GET'], module: 'assets', resource: 'maintainable-assets', action: 'read', permission: 'assets:maintainable-assets:read', enforcementStatus: 'backend-enforced' },
];

async function mockGrants(page: Page, granted: string[]) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: granted }));
  await page.route('**/api/v1/topology/map/layers', (route) => route.fulfill({ json: [] }));
}

async function signIn(page: Page) {
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
}

test('UXR-07 mobile drawer closes on Escape, route navigation and Back/Forward without reopening old entry', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockGrants(page, ['topology:map:read']);
  await page.goto('/overview');
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble' })).toBeVisible();

  const toggle = page.getByRole('button', { name: 'Développer la navigation' });
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toHaveCount(0);
  await toggle.click();
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toHaveCount(0);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await toggle.click();
  await page.getByRole('navigation', { name: 'Navigation principale' })
    .getByRole('button', { name: 'Réseau', exact: true }).click();
  await expect(page).toHaveURL(/\/network$/);
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toHaveCount(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/overview$/);
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toHaveCount(0);
  await page.goForward();
  await expect(page).toHaveURL(/\/network$/);
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toHaveCount(0);
});

test('UXR-07 authorized deep link restores only exact active parent and text-only child across browser history', async ({ page }) => {
  await mockGrants(page, routes.map((route) => route.permission));
  await page.goto('/engineering/assets?origin=network#asset-panel');
  await signIn(page);
  await expect(page).toHaveURL(/\/engineering\/assets\?origin=network#asset-panel$/);

  const navigation = page.getByRole('navigation', { name: 'Navigation principale' });
  const engineering = navigation.getByRole('button', { name: 'INGÉNIERIE', exact: true });
  await expect(engineering).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation.getByRole('button', { name: 'Actifs', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(navigation.getByRole('button', { name: 'Réseau', exact: true })).toHaveCount(0);

  await navigation.getByRole('button', { name: 'Vue d’ensemble', exact: true }).click();
  await expect(page).toHaveURL(/\/overview$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/engineering\/assets\?origin=network#asset-panel$/);
  await expect(engineering).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation.getByRole('button', { name: 'Actifs', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('UXR-07 refuses unauthorized navigation ancestry and retains generic Not Found recovery', async ({ page }) => {
  await mockGrants(page, ['topology:map:read']);
  await page.goto('/not-an-implemented-route');
  await signIn(page);
  await expect(page.getByText('404', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();

  const navigation = page.getByRole('navigation', { name: 'Navigation principale' });
  await expect(navigation.getByRole('button', { name: 'INGÉNIERIE' })).toHaveCount(0);
  await expect(navigation.getByRole('button', { name: 'ADMINISTRATION' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Retour à la vue d’ensemble' }).click();
  await expect(page).toHaveURL(/\/overview$/);
});

test('UXR-07 root redirect remains protected and resolves to overview after sign-in', async ({ page }) => {
  await mockGrants(page, ['topology:map:read']);
  await page.goto('/');
  await signIn(page);
  await expect(page).toHaveURL(/\/overview$/);
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble' })).toBeVisible();
});

test('UXR-07 does not restore engineering ancestors for an ungranted direct target', async ({ page }) => {
  await mockGrants(page, ['topology:map:read']);
  await page.goto('/engineering/assets');
  await signIn(page);
  await expect(page).toHaveURL(/\/engineering\/assets$/);
  const navigation = page.getByRole('navigation', { name: 'Navigation principale' });
  await expect(navigation.getByRole('button', { name: 'INGÉNIERIE', exact: true })).toHaveCount(0);
  await expect(navigation.getByRole('button', { name: 'Actifs', exact: true })).toHaveCount(0);
  await expect(navigation.getByRole('button', { name: 'OPÉRATIONS', exact: true })).toBeVisible();
});
