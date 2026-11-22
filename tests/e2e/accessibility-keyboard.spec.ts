import { expect, test, type Page } from '@playwright/test';

const routes = [
  {
    route: '/api/v1/topology/map/layers',
    methods: ['GET'],
    module: 'topology',
    resource: 'map',
    action: 'read',
    permission: 'topology:map:read',
    enforcementStatus: 'backend-enforced',
  },
];

async function mockAccessibleShell(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: {
      strategy: 'derived-route-permission-catalog',
      enforcement: 'backend-enforced by HidraRouteAuthorizationInterceptor',
      permissionFormat: '<module>:<resource>:<action>',
      bootstrapAdminBypass: 'ROLE_HIDRA_ADMIN',
      routes,
    },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: ['topology:map:read'] }));
  await page.route('**/api/v1/topology/map/layers', (route) => route.fulfill({ json: [] }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-015-06 supports keyboard-only shell bypass and navigation', async ({ page }) => {
  await mockAccessibleShell(page);
  await signIn(page);

  // One named banner, one authorized navigation landmark, and one workspace main.
  await expect(page.getByRole('banner', { name: 'En-tête Hidra' })).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toHaveCount(1);
  await expect(page.getByRole('main', { name: 'Espace de travail' })).toHaveCount(1);

  const skipLink = page.getByRole('link', { name: 'Aller au contenu principal' });
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#hidra-main-content')).toBeFocused();

  const overview = page.getByRole('button', { name: 'Vue d’ensemble' });
  await expect(overview).toHaveAttribute('aria-current', 'page');

  const network = page.getByRole('button', { name: 'Réseau' });
  await network.focus();
  await expect(network).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/network$/);
  await expect(network).toHaveAttribute('aria-current', 'page');
});
