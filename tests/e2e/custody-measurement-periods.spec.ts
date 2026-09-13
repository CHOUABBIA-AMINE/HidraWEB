import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/custody/measurement-periods', methods: ['POST'], module: 'custody', resource: 'measurement-periods', action: 'create', permission: 'custody:measurement-periods:create', enforcementStatus: 'backend-enforced' },
];

const effectivePermissions = ['workbench:resources:read', 'custody:measurement-periods:create'];

const descriptors = [
  {
    module: 'custody', resource: 'custody-measurement-period', entityName: 'CustodyMeasurementPeriod',
    javaType: 'dz.sh.hidra.modules.custody.infrastructure.persistence.entity.CustodyMeasurementPeriodJpaEntity',
    tableName: 'hidra_custody_measurement_period', idField: 'id', searchableFields: ['periodCode'],
    listEndpoint: '/api/v1/workbench/custody/custody-measurement-period',
    detailEndpoint: '/api/v1/workbench/custody/custody-measurement-period/{id}',
    searchEndpoint: '/api/v1/workbench/custody/custody-measurement-period/search',
  },
  {
    module: 'custody', resource: 'custody-agreement', entityName: 'CustodyAgreement',
    javaType: 'dz.sh.hidra.modules.custody.infrastructure.persistence.entity.CustodyAgreementJpaEntity',
    tableName: 'hidra_custody_agreement', idField: 'id', searchableFields: ['agreementNumber'],
    listEndpoint: '/api/v1/workbench/custody/custody-agreement',
    detailEndpoint: '/api/v1/workbench/custody/custody-agreement/{id}',
    searchEndpoint: '/api/v1/workbench/custody/custody-agreement/search',
  },
  {
    module: 'custody', resource: 'custody-transfer-point', entityName: 'CustodyTransferPoint',
    javaType: 'dz.sh.hidra.modules.custody.infrastructure.persistence.entity.CustodyTransferPointJpaEntity',
    tableName: 'hidra_custody_transfer_point', idField: 'id', searchableFields: ['code', 'nameEn'],
    listEndpoint: '/api/v1/workbench/custody/custody-transfer-point',
    detailEndpoint: '/api/v1/workbench/custody/custody-transfer-point/{id}',
    searchEndpoint: '/api/v1/workbench/custody/custody-transfer-point/search',
  },
];

async function mockCustody(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/workbench/custody/resources', (route) => route.fulfill({ json: descriptors }));

  await page.route('**/api/v1/workbench/custody/custody-measurement-period?**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('size')).toBe('25');
    await route.fulfill({
      json: {
        module: 'custody', resource: 'custody-measurement-period', page: 0, size: 25, totalElements: 1, totalPages: 1,
        items: [{
          module: 'custody', resource: 'custody-measurement-period', id: 'period-1',
          attributes: {
            periodCode: 'SEP-2026', agreementId: 'agreement-1', transferPointId: 'point-1',
            periodStart: '2026-09-01T00:00:00Z', periodEnd: '2026-09-30T23:59:59Z', status: 'OPEN',
          },
        }],
      },
    });
  });

  await page.route('**/api/v1/workbench/custody/custody-agreement?**', (route) => route.fulfill({
    json: {
      module: 'custody', resource: 'custody-agreement', page: 0, size: 200, totalElements: 1, totalPages: 1,
      items: [{ module: 'custody', resource: 'custody-agreement', id: 'agreement-1', attributes: { agreementNumber: 'AGR-001' } }],
    },
  }));

  await page.route('**/api/v1/workbench/custody/custody-transfer-point?**', (route) => route.fulfill({
    json: {
      module: 'custody', resource: 'custody-transfer-point', page: 0, size: 200, totalElements: 1, totalPages: 1,
      items: [{ module: 'custody', resource: 'custody-transfer-point', id: 'point-1', attributes: { code: 'TP-01', nameEn: 'North custody point' } }],
    },
  }));

  await page.route('**/api/v1/workbench/custody/custody-measurement-period/period-1', (route) => route.fulfill({
    json: {
      module: 'custody', resource: 'custody-measurement-period', id: 'period-1',
      attributes: { periodCode: 'SEP-2026', agreementId: 'agreement-1', transferPointId: 'point-1', status: 'OPEN' },
    },
  }));

  await page.route('**/api/v1/custody/measurement-periods', async (route) => {
    const request = route.request();
    expect(request.method()).toBe('POST');
    const body = await request.postDataJSON();
    expect(body.periodCode).toBe('OCT-2026');
    expect(body.agreementId).toBe('agreement-1');
    expect(body.transferPointId).toBe('point-1');
    expect(body.periodStart).toContain('2026-10-01T00:00:00');
    expect(body.periodEnd).toContain('2026-10-31T23:59:00');
    await route.fulfill({
      json: {
        id: 'period-2', periodCode: 'OCT-2026', agreementId: 'agreement-1', transferPointId: 'point-1',
        periodStart: body.periodStart, periodEnd: body.periodEnd, status: 'OPEN',
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

test('HWEB-012-02 discovers custody references, reads measurement periods, and opens a period through the published command', async ({ page }) => {
  await mockCustody(page);
  await signIn(page);
  await page.getByRole('button', { name: 'Comptage & custody' }).click();

  await expect(page.getByRole('heading', { name: 'Metering & Custody' })).toBeVisible();
  await expect(page.getByText('SEP-2026')).toBeVisible();
  await expect(page.getByText('OPEN', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.locator('pre').filter({ hasText: 'SEP-2026' })).toBeVisible();

  await page.getByLabel('Period code').fill('OCT-2026');
  await page.getByLabel('Agreement').click();
  await page.getByRole('option', { name: 'AGR-001' }).click();
  await page.getByLabel('Transfer point').click();
  await page.getByRole('option', { name: 'TP-01' }).click();
  await page.getByLabel('Period start').fill('2026-10-01T00:00');
  await page.getByLabel('Period end').fill('2026-10-31T23:59');
  await page.getByRole('button', { name: 'Open measurement period' }).click();

  await expect(page.getByText('Measurement period opened by HidraAPI with status OPEN.')).toBeVisible();
});
