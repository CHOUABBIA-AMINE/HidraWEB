import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/topology/map/layers', methods: ['GET'], module: 'topology', resource: 'map', action: 'read', permission: 'topology:map:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/integrity/assessments', methods: ['POST'], module: 'integrity', resource: 'assessments', action: 'create', permission: 'integrity:assessments:create', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/assets/maintainable-assets', methods: ['POST'], module: 'assets', resource: 'maintainable-assets', action: 'create', permission: 'assets:maintainable-assets:create', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/organization/units', methods: ['GET'], module: 'organization', resource: 'units', action: 'read', permission: 'organization:units:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow', resource: 'tasks', action: 'read', permission: 'workflow:tasks:read', enforcementStatus: 'backend-enforced' },
];

async function signInWithGrants(page: Page, grants: string[]) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: grants }));
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble' })).toBeVisible();
}

test('UXR-06 allows only one authorized expanded group and an explicit text-only third level', async ({ page }) => {
  await signInWithGrants(page, routes.map((route) => route.permission));
  const operations = page.getByRole('button', { name: 'OPÉRATIONS' });
  const engineering = page.getByRole('button', { name: 'INGÉNIERIE' });
  await expect(operations).toHaveAttribute('aria-expanded', 'true');
  await expect(engineering).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: 'Réseau' })).toBeVisible();

  await engineering.click();
  await expect(engineering).toHaveAttribute('aria-expanded', 'true');
  await expect(operations).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: 'Réseau' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Intégrité & maintenance' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Actifs' })).toHaveCount(0);

  const submenu = page.getByRole('button', { name: 'Afficher les sous-sections : Intégrité & maintenance' });
  await submenu.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Actifs' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Actifs' }).locator('.MuiListItemIcon-root')).toHaveCount(0);
  await page.getByRole('button', { name: 'Actifs' }).click();
  await expect(page).toHaveURL(/\/engineering\/assets$/);
});

test('UXR-06 hides unauthorized group identities and keeps a 72px icon-only collapsed sidebar', async ({ page }) => {
  await signInWithGrants(page, ['topology:map:read']);
  const navigation = page.getByRole('navigation', { name: 'Navigation principale' });
  await expect(navigation.getByRole('button', { name: 'OPÉRATIONS' })).toBeVisible();
  await expect(navigation.getByRole('button', { name: 'INGÉNIERIE' })).toHaveCount(0);
  await expect(navigation.getByRole('button', { name: 'ADMINISTRATION' })).toHaveCount(0);
  await expect(navigation.getByRole('button', { name: 'Actifs' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Réduire la navigation' }).click();
  await expect(page.getByRole('button', { name: 'Développer la navigation' })).toHaveAttribute('aria-expanded', 'false');
  const paper = page.locator('.MuiDrawer-paper').first();
  await expect.poll(async () => Math.round((await paper.boundingBox())?.width ?? 0)).toBe(72);
  await expect(navigation.getByRole('button', { name: 'Réseau' })).toBeVisible();
});
