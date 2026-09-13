import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
];

const resources = [
  ['connector-instance', 'ConnectorInstanceJpaEntity'],
  ['job-run', 'IntegrationJobRunJpaEntity'],
  ['dead-letter', 'IntegrationDeadLetterRecordJpaEntity'],
  ['retry-attempt', 'IntegrationRetryAttemptJpaEntity'],
  ['health-snapshot', 'IntegrationHealthSnapshotJpaEntity'],
].map(([resource, javaType]) => ({ module: 'integration', resource, entityName: javaType.replace('JpaEntity', ''), javaType: `dz.sh.hidra.modules.integration.infrastructure.persistence.entity.${javaType}`, tableName: `hidra_integration_${resource.replaceAll('-', '_')}`, idField: 'id', searchableFields: ['status'], listEndpoint: `/api/v1/workbench/integration/${resource}`, detailEndpoint: `/api/v1/workbench/integration/${resource}/{id}`, searchEndpoint: `/api/v1/workbench/integration/${resource}/search` }));

async function mockIntegration(page: Page, grants = ['workbench:resources:read']) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: grants }));
  await page.route('**/api/v1/workbench/integration/resources', (route) => route.fulfill({ json: resources }));
  for (const descriptor of resources) {
    await page.route(`**/api/v1/workbench/integration/${descriptor.resource}?**`, (route) => route.fulfill({ json: {
      module: 'integration', resource: descriptor.resource, page: 0, size: 50, totalElements: 1, totalPages: 1,
      items: [{ module: 'integration', resource: descriptor.resource, id: `${descriptor.resource}-1`, attributes: { status: 'OBSERVED', source: 'backend' } }],
    } }));
  }
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('integration-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openIntegration(page: Page) {
  await page.evaluate(() => { window.history.pushState({}, '', '/administration/integrations'); window.dispatchEvent(new PopStateEvent('popstate')); });
}

test('HWEB-014-04 monitors runtime connector, job, dead-letter, retry, and health evidence without inventing lifecycle actions', async ({ page }) => {
  await mockIntegration(page);
  await signIn(page);
  await openIntegration(page);
  await expect(page.getByRole('heading', { name: 'Integration monitoring', exact: true })).toBeVisible();
  await expect(page.getByText(/Monitoring is evidence-only/)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Connectors — connector-instance/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Job runs — job-run/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Dead letters — dead-letter/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Retry attempts — retry-attempt/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Health snapshots — health-snapshot/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /retry|replay|cancel|restart|pause/i })).toHaveCount(0);
});

test('HWEB-014-04 fails closed when integration workbench read grant is absent', async ({ page }) => {
  await mockIntegration(page, []);
  await signIn(page);
  await openIntegration(page);
  await expect(page.getByText('Your current HidraAPI grants do not allow integration evidence reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Integration monitoring', exact: true })).toHaveCount(0);
});
