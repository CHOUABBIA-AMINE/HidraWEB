import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
];

const resources = [
  ['messages-runtime', 'NotificationMessageJpaEntity'],
  ['requests-runtime', 'NotificationRequestJpaEntity'],
  ['delivery-runtime', 'NotificationDeliveryAttemptJpaEntity'],
].map(([resource, javaType]) => ({ module: 'notification', resource, entityName: javaType.replace('JpaEntity', ''), javaType: `dz.sh.hidra.modules.notification.infrastructure.persistence.entity.${javaType}`, tableName: `hidra_notification_${resource.replaceAll('-', '_')}`, idField: 'id', searchableFields: ['status'], listEndpoint: `/api/v1/workbench/notification/${resource}`, detailEndpoint: `/api/v1/workbench/notification/${resource}/{id}`, searchEndpoint: `/api/v1/workbench/notification/${resource}/search` }));

async function mockNotification(page: Page, grants = ['workbench:resources:read']) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: grants }));
  await page.route('**/api/v1/workbench/notification/resources', (route) => route.fulfill({ json: resources }));
  for (const descriptor of resources) {
    await page.route(`**/api/v1/workbench/notification/${descriptor.resource}?**`, (route) => route.fulfill({ json: {
      module: 'notification', resource: descriptor.resource, page: 0, size: 50, totalElements: 1, totalPages: 1,
      items: [{ module: 'notification', resource: descriptor.resource, id: `${descriptor.resource}-1`, attributes: { status: 'OBSERVED', channel: 'backend-evidence' } }],
    } }));
  }
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('notification-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openNotifications(page: Page) {
  await page.evaluate(() => { window.history.pushState({}, '', '/work/notifications'); window.dispatchEvent(new PopStateEvent('popstate')); });
}

test('HWEB-014-05 shows runtime notification message, request, and delivery evidence without inventing inbox actions', async ({ page }) => {
  await mockNotification(page);
  await signIn(page);
  await openNotifications(page);
  await expect(page.getByRole('heading', { name: 'Notification center', exact: true })).toBeVisible();
  await expect(page.getByText(/This center is evidence-only/)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Messages — messages-runtime/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Requests — requests-runtime/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Delivery attempts — delivery-runtime/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /read|unread|acknowledge|dismiss|archive|delete|resend|retry/i })).toHaveCount(0);
});

test('HWEB-014-05 fails closed when notification workbench read grant is absent', async ({ page }) => {
  await mockNotification(page, []);
  await signIn(page);
  await openNotifications(page);
  await expect(page.getByText('Your current HidraAPI grants do not allow notification evidence reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notification center', exact: true })).toHaveCount(0);
});
