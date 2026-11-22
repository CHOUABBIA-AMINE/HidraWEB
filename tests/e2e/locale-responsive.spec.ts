import { expect, test, type Page } from '@playwright/test';

const routes = [{
  route: '/api/v1/topology/map/layers',
  methods: ['GET'],
  module: 'topology',
  resource: 'map',
  action: 'read',
  permission: 'topology:map:read',
  enforcementStatus: 'backend-enforced',
}];

async function signInWithSyntheticPermissions(page: Page) {
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

  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble' })).toBeVisible();
}

test('UXR-04 switches FR → AR → EN and mirrors the authenticated shell without changing its route', async ({ page }) => {
  await signInWithSyntheticPermissions(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

  await page.getByRole('combobox', { name: 'Langue' }).click();
  await page.getByRole('option', { name: 'AR' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { name: 'نظرة عامة' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'الانتقال إلى المحتوى الرئيسي' })).toHaveCount(1);
  await expect(page.locator('.MuiDrawer-paperAnchorRight').first()).toBeAttached();

  await page.getByRole('combobox', { name: 'اللغة' }).click();
  await page.getByRole('option', { name: 'EN' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  await expect(page).toHaveURL(/\/overview$/);
});

test('UXR-04 mobile navigation uses a keyboard-dismissable drawer and reverses its side in Arabic', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signInWithSyntheticPermissions(page);
  const openNavigation = page.getByRole('button', { name: 'Développer la navigation' });
  await expect(openNavigation).toBeVisible();
  await expect(openNavigation).toHaveAttribute('aria-expanded', 'false');

  await openNavigation.click();
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Réduire la navigation' })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Développer la navigation' })).toHaveAttribute('aria-expanded', 'false');

  await page.getByRole('combobox', { name: 'Langue' }).click();
  await page.getByRole('option', { name: 'AR' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'توسيع التنقل' }).click();
  await expect(page.locator('.MuiDrawer-paperAnchorRight').first()).toBeVisible();
  await page.getByRole('button', { name: 'الشبكة' }).click();
  await expect(page).toHaveURL(/\/network$/);
  await expect(page.getByRole('button', { name: 'توسيع التنقل' })).toHaveAttribute('aria-expanded', 'false');
});
