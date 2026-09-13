import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/custody/discrepancies', methods: ['POST'], module: 'custody', resource: 'discrepancies', action: 'create', permission: 'custody:discrepancies:create', enforcementStatus: 'backend-enforced' },
];

const descriptors = [
  ['custody-reconciliation', 'CustodyReconciliationJpaEntity'],
  ['custody-discrepancy', 'CustodyDiscrepancyJpaEntity'],
].map(([resource, javaType]) => ({
  module: 'custody', resource, entityName: javaType.replace('JpaEntity', ''),
  javaType: `dz.sh.hidra.modules.custody.infrastructure.persistence.entity.${javaType}`,
  tableName: `hidra_${resource.replaceAll('-', '_')}`, idField: 'id', searchableFields: [],
  listEndpoint: `/api/v1/workbench/custody/${resource}`,
  detailEndpoint: `/api/v1/workbench/custody/${resource}/{id}`,
  searchEndpoint: `/api/v1/workbench/custody/${resource}/search`,
}));

interface MockOptions {
  allowCreate?: boolean;
  createForbidden?: boolean;
}

async function mockCustody(page: Page, options: MockOptions = {}) {
  const allowCreate = options.allowCreate ?? true;
  const effectivePermissions = ['workbench:resources:read', ...(allowCreate ? ['custody:discrepancies:create'] : [])];

  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/workbench/custody/resources', (route) => route.fulfill({ json: descriptors }));

  await page.route('**/api/v1/workbench/custody/custody-reconciliation?**', (route) => route.fulfill({
    json: {
      module: 'custody', resource: 'custody-reconciliation', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{ module: 'custody', resource: 'custody-reconciliation', id: 'recon-1', attributes: { status: 'OPEN' } }],
    },
  }));
  await page.route('**/api/v1/workbench/custody/custody-reconciliation/recon-1', (route) => route.fulfill({
    json: { module: 'custody', resource: 'custody-reconciliation', id: 'recon-1', attributes: { status: 'OPEN', source: 'backend' } },
  }));

  await page.route('**/api/v1/workbench/custody/custody-discrepancy?**', (route) => route.fulfill({
    json: {
      module: 'custody', resource: 'custody-discrepancy', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{
        module: 'custody', resource: 'custody-discrepancy', id: 'disc-1',
        attributes: {
          discrepancyNumber: 'DISC-001', reconciliationId: 'recon-1', discrepancyTypeId: 'METER_BALANCE',
          differenceQuantity: 4.25, status: 'OPEN', openedAt: '2026-09-13T05:30:00Z',
        },
      }],
    },
  }));
  await page.route('**/api/v1/workbench/custody/custody-discrepancy/disc-1', (route) => route.fulfill({
    json: { module: 'custody', resource: 'custody-discrepancy', id: 'disc-1', attributes: { discrepancyNumber: 'DISC-001', status: 'OPEN' } },
  }));

  await page.route('**/api/v1/custody/discrepancies', async (route) => {
    if (options.createForbidden) {
      await route.fulfill({ status: 403, json: { message: 'Forbidden' } });
      return;
    }
    const body = await route.request().postDataJSON();
    expect(route.request().method()).toBe('POST');
    expect(body).toMatchObject({
      discrepancyNumber: 'DISC-002', reconciliationId: 'recon-1', discrepancyTypeId: 'METER_BALANCE',
      differenceQuantity: 2.5, quantityUnitId: 'M3', description: 'Observed custody variance', assignedActorId: 'actor-7',
    });
    expect(body.openedAt).toContain('2026-09-13T06:00:00');
    await route.fulfill({
      json: {
        id: 'disc-2', discrepancyNumber: 'DISC-002', reconciliationId: 'recon-1', discrepancyTypeId: 'METER_BALANCE',
        status: 'OPEN', differenceQuantity: 2.5, openedAt: body.openedAt,
      },
    });
  });
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('custody-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openDiscrepancies(page: Page, useSidebar = true) {
  if (useSidebar) {
    await page.getByRole('button', { name: 'Comptage & custody' }).click();
  } else {
    await page.evaluate(() => {
      window.history.pushState({}, '', '/custody');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  }
  await page.getByRole('tab', { name: 'Discrepancies & reconciliation' }).click();
  await expect(page.getByRole('heading', { name: 'Custody discrepancies & reconciliation' })).toBeVisible();
}

test('HWEB-012-04 reads reconciliation/discrepancy records and opens only a published discrepancy', async ({ page }) => {
  await mockCustody(page);
  await signIn(page);
  await openDiscrepancies(page);

  await expect(page.getByText('DISC-001')).toBeVisible();
  await page.getByRole('button', { name: 'Open reconciliation' }).click();
  await expect(page.locator('pre').filter({ hasText: 'backend' })).toBeVisible();
  await page.getByRole('button', { name: 'Open discrepancy' }).first().click();
  await expect(page.locator('pre').filter({ hasText: 'DISC-001' })).toBeVisible();

  await expect(page.getByRole('button', { name: /resolve/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /close discrepancy/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /reconcile/i })).toHaveCount(0);

  await page.getByLabel('Discrepancy number').fill('DISC-002');
  await page.getByLabel('Reconciliation').click();
  await page.getByRole('option', { name: 'recon-1' }).click();
  await page.getByLabel('Discrepancy type ID').fill('METER_BALANCE');
  await page.getByLabel('Difference quantity').fill('2.5');
  await page.getByLabel('Quantity unit ID').fill('M3');
  await page.getByLabel('Description').fill('Observed custody variance');
  await page.getByLabel('Assigned actor ID').fill('actor-7');
  await page.getByLabel('Opened at').fill('2026-09-13T06:00');
  await page.getByRole('button', { name: 'Open discrepancy', exact: true }).last().click();

  await expect(page.getByText('Discrepancy opened by HidraAPI with status OPEN.')).toBeVisible();
});

test('HWEB-012-04 fails closed when the discrepancy-open grant is absent', async ({ page }) => {
  await mockCustody(page, { allowCreate: false });
  await signIn(page);
  await openDiscrepancies(page, false);

  await expect(page.getByText('Your current HidraAPI grants do not permit discrepancy opening.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open discrepancy', exact: true }).last()).toBeDisabled();
});

test('HWEB-012-04 preserves backend 403 as final authorization authority', async ({ page }) => {
  await mockCustody(page, { createForbidden: true });
  await signIn(page);
  await openDiscrepancies(page);

  await page.getByRole('button', { name: 'Open discrepancy', exact: true }).last().click();
  await expect(page.getByText('HidraAPI refused access to discrepancy opening.')).toBeVisible();
});
