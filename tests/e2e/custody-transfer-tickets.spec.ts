import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/custody/transfer-tickets', methods: ['POST'], module: 'custody', resource: 'transfer-tickets', action: 'create', permission: 'custody:transfer-tickets:create', enforcementStatus: 'backend-enforced' },
];

const descriptors = [
  ['custody-measurement-period', 'CustodyMeasurementPeriodJpaEntity', 'periodCode'],
  ['custody-agreement', 'CustodyAgreementJpaEntity', 'agreementNumber'],
  ['custody-transfer-point', 'CustodyTransferPointJpaEntity', 'code'],
  ['custody-batch', 'CustodyBatchJpaEntity', 'batchNumber'],
  ['custody-quantity-calculation', 'CustodyQuantityCalculationJpaEntity', 'calculationNumber'],
  ['custody-transfer-ticket', 'CustodyTransferTicketJpaEntity', 'ticketNumber'],
].map(([resource, javaType, searchableField]) => ({
  module: 'custody', resource, entityName: javaType.replace('JpaEntity', ''),
  javaType: `dz.sh.hidra.modules.custody.infrastructure.persistence.entity.${javaType}`,
  tableName: `hidra_${resource.replaceAll('-', '_')}`, idField: 'id', searchableFields: [searchableField],
  listEndpoint: `/api/v1/workbench/custody/${resource}`,
  detailEndpoint: `/api/v1/workbench/custody/${resource}/{id}`,
  searchEndpoint: `/api/v1/workbench/custody/${resource}/search`,
}));

const referenceRecords: Record<string, { id: string; attributes: Record<string, unknown> }> = {
  'custody-measurement-period': { id: 'period-1', attributes: { periodCode: 'SEP-2026', status: 'OPEN' } },
  'custody-agreement': { id: 'agreement-1', attributes: { agreementNumber: 'AGR-001' } },
  'custody-transfer-point': { id: 'point-1', attributes: { code: 'TP-01', nameEn: 'North custody point' } },
  'custody-batch': { id: 'batch-1', attributes: { batchNumber: 'BATCH-001' } },
  'custody-quantity-calculation': { id: 'calc-1', attributes: { calculationNumber: 'QTY-001' } },
};

interface MockOptions {
  allowCreate?: boolean;
  createForbidden?: boolean;
}

async function mockCustody(page: Page, options: MockOptions = {}) {
  const allowCreate = options.allowCreate ?? true;
  const effectivePermissions = ['workbench:resources:read', ...(allowCreate ? ['custody:transfer-tickets:create'] : [])];

  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/workbench/custody/resources', (route) => route.fulfill({ json: descriptors }));

  for (const [resource, record] of Object.entries(referenceRecords)) {
    await page.route(`**/api/v1/workbench/custody/${resource}?**`, (route) => route.fulfill({
      json: {
        module: 'custody', resource, page: 0, size: resource === 'custody-measurement-period' ? 25 : 200,
        totalElements: 1, totalPages: 1,
        items: [{ module: 'custody', resource, id: record.id, attributes: record.attributes }],
      },
    }));
  }

  await page.route('**/api/v1/workbench/custody/custody-transfer-ticket?**', (route) => route.fulfill({
    json: {
      module: 'custody', resource: 'custody-transfer-ticket', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{
        module: 'custody', resource: 'custody-transfer-ticket', id: 'ticket-1',
        attributes: {
          ticketNumber: 'CT-0001', measurementPeriodId: 'period-1', agreementId: 'agreement-1',
          transferPointId: 'point-1', ticketDate: '2026-09-13T03:00:00Z', status: 'DRAFT',
        },
      }],
    },
  }));

  await page.route('**/api/v1/workbench/custody/custody-transfer-ticket/ticket-1', (route) => route.fulfill({
    json: {
      module: 'custody', resource: 'custody-transfer-ticket', id: 'ticket-1',
      attributes: { ticketNumber: 'CT-0001', measurementPeriodId: 'period-1', status: 'DRAFT' },
    },
  }));

  await page.route('**/api/v1/custody/transfer-tickets', async (route) => {
    if (options.createForbidden) {
      await route.fulfill({ status: 403, json: { message: 'Forbidden' } });
      return;
    }
    const request = route.request();
    expect(request.method()).toBe('POST');
    const body = await request.postDataJSON();
    expect(body).toMatchObject({
      ticketNumber: 'CT-0002', measurementPeriodId: 'period-1', agreementId: 'agreement-1',
      transferPointId: 'point-1', batchId: 'batch-1', quantityCalculationId: 'calc-1',
      issuedByActorId: 'actor-7', workflowInstanceId: 'workflow-9',
    });
    expect(body.ticketDate).toContain('2026-09-13T04:30:00');
    await route.fulfill({
      json: {
        id: 'ticket-2', ticketNumber: 'CT-0002', measurementPeriodId: 'period-1', agreementId: 'agreement-1',
        transferPointId: 'point-1', ticketDate: body.ticketDate, status: 'DRAFT',
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

async function openTransferTickets(page: Page, useSidebar = true) {
  if (useSidebar) {
    await page.getByRole('button', { name: 'Comptage & custody' }).click();
  } else {
    await page.evaluate(() => {
      window.history.pushState({}, '', '/custody');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  }
  await page.getByRole('tab', { name: 'Transfer tickets' }).click();
  await expect(page.getByRole('heading', { name: 'Custody transfer tickets' })).toBeVisible();
}

test('HWEB-012-03 reads transfer tickets and creates one from runtime custody references only', async ({ page }) => {
  await mockCustody(page);
  await signIn(page);
  await openTransferTickets(page);

  await expect(page.getByText('CT-0001')).toBeVisible();
  await expect(page.getByText('DRAFT', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.locator('pre').filter({ hasText: 'CT-0001' })).toBeVisible();

  await page.getByLabel('Ticket number').fill('CT-0002');
  await page.getByLabel('Measurement period').click();
  await page.getByRole('option', { name: 'SEP-2026' }).click();
  await page.getByLabel('Agreement').click();
  await page.getByRole('option', { name: 'AGR-001' }).click();
  await page.getByLabel('Transfer point').click();
  await page.getByRole('option', { name: 'TP-01' }).click();
  await page.getByLabel('Batch').click();
  await page.getByRole('option', { name: 'BATCH-001' }).click();
  await page.getByLabel('Quantity calculation').click();
  await page.getByRole('option', { name: 'QTY-001' }).click();
  await page.getByLabel('Ticket date').fill('2026-09-13T04:30');
  await page.getByLabel('Issued by actor ID').fill('actor-7');
  await page.getByLabel('Workflow instance ID').fill('workflow-9');
  await page.getByRole('button', { name: 'Create transfer ticket' }).click();

  await expect(page.getByText('Transfer ticket created by HidraAPI with status DRAFT.')).toBeVisible();
});

test('HWEB-012-03 fails closed when the effective create grant is absent', async ({ page }) => {
  await mockCustody(page, { allowCreate: false });
  await signIn(page);
  await openTransferTickets(page, false);

  await expect(page.getByText('Your current HidraAPI grants do not permit transfer-ticket creation.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create transfer ticket' })).toBeDisabled();
});

test('HWEB-012-03 preserves backend 403 as the final authorization authority', async ({ page }) => {
  await mockCustody(page, { createForbidden: true });
  await signIn(page);
  await openTransferTickets(page);

  await page.getByRole('button', { name: 'Create transfer ticket' }).click();
  await expect(page.getByText('HidraAPI refused access to transfer-ticket creation.')).toBeVisible();
});
