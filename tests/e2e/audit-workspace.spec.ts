import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/audit/exports', methods: ['POST'], module: 'audit', resource: 'exports', action: 'execute', permission: 'audit:exports:execute', enforcementStatus: 'backend-enforced' },
];

const descriptor = {
  module: 'audit',
  resource: 'audit-event',
  entityName: 'AuditEvent',
  javaType: 'dz.sh.hidra.modules.audit.infrastructure.persistence.entity.AuditEventJpaEntity',
  tableName: 'hidra_audit_event',
  idField: 'id',
  searchableFields: ['actionCode', 'actorDisplayNameSnapshot', 'sourceModule', 'targetType', 'targetId', 'correlationId'],
  listEndpoint: '/api/v1/workbench/audit/audit-event',
  detailEndpoint: '/api/v1/workbench/audit/audit-event/{id}',
  searchEndpoint: '/api/v1/workbench/audit/audit-event/search',
};

async function mockAudit(page: Page, grants = ['workbench:resources:read', 'audit:exports:execute']) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: grants }));
  await page.route('**/api/v1/workbench/audit/resources', (route) => route.fulfill({ json: [descriptor] }));
  await page.route('**/api/v1/workbench/audit/audit-event?**', (route) => {
    const url = new URL(route.request().url());
    const q = url.searchParams.get('q');
    route.fulfill({
      json: {
        module: 'audit',
        resource: 'audit-event',
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
        items: [{
          module: 'audit',
          resource: 'audit-event',
          id: 'audit-1',
          attributes: {
            occurredAt: '2026-09-13T11:00:00Z',
            actorDisplayNameSnapshot: 'Operator A',
            actionCode: q ? `SEARCH:${q}` : 'APPROVE',
            sourceModule: 'workflow',
            targetType: 'TELEMETRY_READING',
            targetId: 'reading-42',
            operation: 'APPROVE',
            eventStatus: 'SEALED',
            correlationId: 'corr-1',
          },
        }],
      },
    });
  });
  await page.route('**/api/v1/workbench/audit/audit-event/audit-1', (route) => route.fulfill({
    json: {
      module: 'audit',
      resource: 'audit-event',
      id: 'audit-1',
      attributes: {
        actionCode: 'APPROVE',
        sourceModule: 'workflow',
        targetId: 'reading-42',
        correlationId: 'corr-1',
      },
    },
  }));
  await page.route('**/api/v1/audit/exports', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({
      requestedByActorId: 'actor-1',
      requestedByDisplayNameSnapshot: 'Auditor A',
      purposeId: 'investigation',
      filterJson: '{"sourceModule":"workflow"}',
      format: 'CSV',
      workflowInstanceId: 'wf-1',
    });
    await route.fulfill({
      json: {
        id: 'export-1',
        requestedByActorId: 'actor-1',
        purposeId: 'investigation',
        format: 'CSV',
        status: 'REQUESTED',
        recordCount: null,
        requestedAt: '2026-09-13T11:05:00Z',
        completedAt: null,
      },
    });
  });
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('audit-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openAuditWorkspace(page: Page) {
  await page.evaluate(() => {
    window.history.pushState({}, '', '/administration/audit');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

test('HWEB-014-01 searches runtime audit evidence and submits only the exact export-request contract', async ({ page }) => {
  await mockAudit(page);
  await signIn(page);
  await openAuditWorkspace(page);

  await expect(page.getByRole('heading', { name: 'Audit evidence' })).toBeVisible();
  await expect(page.getByText('APPROVE', { exact: true })).toBeVisible();

  await page.getByLabel('Search audit evidence').fill('corr-1');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('SEARCH:corr-1')).toBeVisible();

  await page.getByLabel('Requested by actor ID').fill('actor-1');
  await page.getByLabel('Requested by display name snapshot').fill('Auditor A');
  await page.getByLabel('Purpose ID').fill('investigation');
  await page.getByLabel('Format').fill('CSV');
  await page.getByLabel('Filter JSON').fill('{"sourceModule":"workflow"}');
  await page.getByLabel('Workflow instance ID').fill('wf-1');
  await page.getByRole('button', { name: 'Request export' }).click();

  await expect(page.getByText(/Export request export-1 recorded with status REQUESTED/)).toBeVisible();
  await expect(page.getByRole('button', { name: /download/i })).toHaveCount(0);
});

test('HWEB-014-01 fails closed for export when the exact POST grant is absent', async ({ page }) => {
  await mockAudit(page, ['workbench:resources:read']);
  await signIn(page);
  await openAuditWorkspace(page);

  await expect(page.getByText('Your current HidraAPI grants do not allow audit export requests.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Request export' })).toBeDisabled();
});

test('HWEB-014-01 fails closed when generic audit read grants are absent', async ({ page }) => {
  await mockAudit(page, ['audit:exports:execute']);
  await signIn(page);
  await openAuditWorkspace(page);

  await expect(page.getByText('Your current HidraAPI grants do not allow audit evidence reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Audit evidence' })).toHaveCount(0);
});
