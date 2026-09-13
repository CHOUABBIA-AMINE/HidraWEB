import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
];

const resources = [
  ['notification-request-runtime', 'NotificationRequestJpaEntity'],
  ['notification-message-runtime', 'NotificationMessageJpaEntity'],
  ['delivery-attempt-runtime', 'NotificationDeliveryAttemptJpaEntity'],
].map(([resource, javaType]) => ({ module: 'notification', resource, entityName: javaType.replace('JpaEntity', ''), javaType: `dz.sh.hidra.modules.notification.infrastructure.persistence.entity.${javaType}`, tableName: `hidra_notification_${resource.replaceAll('-', '_')}`, idField: 'id', searchableFields: ['status'], listEndpoint: `/api/v1/workbench/notification/${resource}`, detailEndpoint: `/api/v1/workbench/notification/${resource}/{id}`, searchEndpoint: `/api/v1/workbench/notification/${resource}/search` }));

async function mockNotification(page: Page, grants = ['workbench:resources:read']) {
  const calls: string[] = [];
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: grants }));
  await page.route('**/api/v1/workbench/notification/resources', (route) => {
    calls.push('resources');
    return route.fulfill({ json: resources });
  });
  for (const descriptor of resources) {
    await page.route(`**/api/v1/workbench/notification/${descriptor.resource}?**`, (route) => {
      calls.push(descriptor.resource);
      return route.fulfill({ json: {
        module: 'notification', resource: descriptor.resource, page: 0, size: 50, totalElements: 1, totalPages: 1,
        items: [{ module: 'notification', resource: descriptor.resource, id: `${descriptor.resource}-1`, attributes: { status: 'RECORDED', source: 'backend' } }],
      } });
    });
  }
  return calls;
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('notification-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openNotificationCenter(page: Page) {
  await page.evaluate(() => { window.history.pushState({}, '', '/work/notifications'); window.dispatchEvent(new PopStateEvent('popstate')); });
}

test('HWEB-014-05 shows runtime notification request, message, and delivery evidence without inventing inbox lifecycle actions', async ({ page }) => {
  const calls = await mockNotification(page);
  await signIn(page);
  await openNotificationCenter(page);
  await expect(page.getByRole('heading', { name: 'Notification center', exact: true })).toBeVisible();
  await expect(page.getByText(/This center is evidence-only/)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Requests — notification-request-runtime/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Messages — notification-message-runtime/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Delivery attempts — delivery-attempt-runtime/ })).toBeVisible();
  await expect.poll(() => calls).toEqual(expect.arrayContaining(['resources', 'notification-request-runtime', 'notification-message-runtime', 'delivery-attempt-runtime']));
  await expect(page.getByRole('button', { name: /mark.*read|unread|archive|dismiss|delete|resend|retry|preferences?/i })).toHaveCount(0);
});

test('HWEB-014-05 fails closed without the exact generic workbench read grant', async ({ page }) => {
  const calls = await mockNotification(page, []);
  await signIn(page);
  await openNotificationCenter(page);
  await expect(page.getByText('Your current HidraAPI grants do not allow notification evidence reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notification center', exact: true })).toHaveCount(0);
  expect(calls).toEqual([]);
});
