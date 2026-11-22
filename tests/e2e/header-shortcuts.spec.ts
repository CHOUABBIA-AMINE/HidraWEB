import { expect, test, type Page } from '@playwright/test';

const routes = [
  {
    route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow', resource: 'tasks',
    action: 'read', permission: 'workflow:tasks:read', enforcementStatus: 'backend-enforced',
  },
  {
    route: '/api/v1/notification/companies/{companyId}/facilities/{facilityId}/inbox',
    methods: ['GET'], module: 'notification', resource: 'inbox', action: 'read',
    permission: 'notification:inbox:read', enforcementStatus: 'backend-enforced',
  },
  {
    route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'dynamic-module',
    resource: 'dynamic-resource', action: 'read',
    permission: 'dynamic-module:dynamic-resource:read', enforcementStatus: 'backend-enforced',
  },
];

async function login(page: Page, grants: string[]) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced',
      permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: grants }));
  await page.route('**/api/v1/workflow/tasks?**', (route) => route.fulfill({
    json: { content: [], totalElements: 0, page: 0, size: 50 },
  }));
  await page.route('**/api/v1/workbench/notification/resources', (route) => route.fulfill({ json: [] }));
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble' })).toBeVisible();
}

test('UXR-10 opens only the granted task and evidence routes without synthetic header counts', async ({ page }) => {
  await login(page, [
    'workflow:tasks:read', 'notification:inbox:read', 'dynamic-module:dynamic-resource:read',
  ]);
  const header = page.getByRole('banner', { name: 'En-tête Hidra' });
  const tasks = header.getByRole('link', { name: 'Mes tâches' });
  const notifications = header.getByRole('link', { name: 'Notifications' });
  await expect(tasks).toBeVisible();
  await expect(notifications).toBeVisible();
  await expect(header.locator('.MuiBadge-badge')).toHaveCount(0);
  await tasks.press('Enter');
  await expect(page).toHaveURL(/\/work\/tasks$/);
  await expect(page.getByRole('heading', { name: 'Mes tâches' })).toBeVisible();
  await notifications.click();
  await expect(page).toHaveURL(/\/work\/notifications$/);
  await expect(page.getByRole('heading', { name: 'Notification center' })).toBeVisible();
});

test('UXR-10 rejects ungranted notification navigation and reports only WEB connectivity', async ({ page, context }) => {
  await login(page, ['workflow:tasks:read']);
  const header = page.getByRole('banner', { name: 'En-tête Hidra' });
  await expect(header.getByRole('link', { name: 'Notifications' })).toHaveCount(0);
  await expect(header.getByRole('button', { name: 'Notifications' })).toBeDisabled();
  await expect(header.getByRole('link', { name: 'Mes tâches' })).toBeVisible();
  await context.setOffline(true);
  await expect(header.getByRole('status', { name: 'Navigateur hors ligne' })).toBeVisible();
  // A browser that is online can still fail to reach this WEB origin.
  await page.route('**/', (route) => route.request().method() === 'HEAD'
    ? route.fulfill({ status: 503 })
    : route.continue());
  await context.setOffline(false);
  await expect(header.getByRole('status', { name: 'WEB : dégradé' })).toBeVisible();

  // The recovery state must come from a fresh successful WEB-origin probe.
  await page.unroute('**/');
  await context.setOffline(true);
  await expect(header.getByRole('status', { name: 'Navigateur hors ligne' })).toBeVisible();
  await context.setOffline(false);
  await expect(header.getByRole('status', { name: 'WEB : accessible' })).toBeVisible();
});
