import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
];

const descriptors = [
  ['report-definition', 'ReportDefinitionJpaEntity'],
  ['report-request', 'ReportRequestJpaEntity'],
  ['report-run', 'ReportRunJpaEntity'],
  ['report-output-artifact', 'ReportOutputArtifactJpaEntity'],
].map(([resource, javaType]) => ({
  module: 'reporting',
  resource,
  entityName: javaType.replace('JpaEntity', ''),
  javaType: `dz.sh.hidra.modules.reporting.infrastructure.persistence.entity.${javaType}`,
  tableName: `hidra_reporting_${resource.replaceAll('-', '_')}`,
  idField: 'id',
  searchableFields: [],
  listEndpoint: `/api/v1/workbench/reporting/${resource}`,
  detailEndpoint: `/api/v1/workbench/reporting/${resource}/{id}`,
  searchEndpoint: `/api/v1/workbench/reporting/${resource}/search`,
}));

async function mockReporting(page: Page, allowRead = true) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: allowRead ? ['workbench:resources:read'] : [] }));
  await page.route('**/api/v1/workbench/reporting/resources', (route) => route.fulfill({ json: descriptors }));

  await page.route('**/api/v1/workbench/reporting/report-definition?**', (route) => route.fulfill({
    json: { module: 'reporting', resource: 'report-definition', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [
      { module: 'reporting', resource: 'report-definition', id: 'def-1', attributes: { code: 'OPS-DAILY', nameFr: 'Rapport quotidien', reportCategoryId: 'operations', ownerModule: 'reporting', active: true, requiresApproval: false, restricted: false } },
    ] },
  }));
  await page.route('**/api/v1/workbench/reporting/report-request?**', (route) => route.fulfill({
    json: { module: 'reporting', resource: 'report-request', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [
      { module: 'reporting', resource: 'report-request', id: 'req-1', attributes: { reportDefinitionId: 'def-1', requestedByDisplayNameSnapshot: 'Operator A', organizationUnitNameSnapshot: 'TRC', requestedAt: '2026-09-13T08:00:00Z', purpose: 'Daily operations review', status: 'COMPLETED' } },
    ] },
  }));
  await page.route('**/api/v1/workbench/reporting/report-run?**', (route) => route.fulfill({
    json: { module: 'reporting', resource: 'report-run', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [
      { module: 'reporting', resource: 'report-run', id: 'run-1', attributes: { reportRequestId: 'req-1', reportDefinitionId: 'def-1', runMode: 'MANUAL', status: 'COMPLETED', completedAt: '2026-09-13T08:01:00Z', outputCount: 1 } },
    ] },
  }));
  await page.route('**/api/v1/workbench/reporting/report-output-artifact?**', (route) => route.fulfill({
    json: { module: 'reporting', resource: 'report-output-artifact', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [
      { module: 'reporting', resource: 'report-output-artifact', id: 'art-1', attributes: { reportRunId: 'run-1', artifactType: 'PRIMARY_REPORT', format: 'PDF', fileName: 'ops-daily.pdf', mimeType: 'application/pdf', sizeBytes: 2048, generatedAt: '2026-09-13T08:01:00Z', storageObjectReferenceId: 'storage-1', documentReferenceId: 'doc-1' } },
    ] },
  }));
  await page.route('**/api/v1/workbench/reporting/report-definition/def-1', (route) => route.fulfill({
    json: { module: 'reporting', resource: 'report-definition', id: 'def-1', attributes: { code: 'OPS-DAILY', active: true, restricted: false } },
  }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('reporting-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openReportingWorkspace(page: Page) {
  await page.evaluate(() => {
    window.history.pushState({}, '', '/intelligence/reports');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

test('HWEB-013-05 renders runtime-discovered reporting definitions, requests, runs and artifact metadata without download semantics', async ({ page }) => {
  await mockReporting(page);
  await signIn(page);
  await openReportingWorkspace(page);

  await expect(page.getByRole('heading', { name: 'Reporting intelligence' })).toBeVisible();
  await expect(page.getByText('OPS-DAILY')).toBeVisible();

  await page.getByRole('tab', { name: 'Requests' }).click();
  await expect(page.getByText('Daily operations review')).toBeVisible();
  await expect(page.getByText('COMPLETED', { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: 'Runs' }).click();
  await expect(page.getByText('MANUAL')).toBeVisible();
  await expect(page.getByText('COMPLETED', { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: 'Output artifacts' }).click();
  await expect(page.getByText('ops-daily.pdf')).toBeVisible();
  await expect(page.getByText('PDF', { exact: true })).toBeVisible();

  await expect(page.getByRole('button', { name: /download/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /export/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /generate/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /queue/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /request report/i })).toHaveCount(0);
});

test('HWEB-013-05 fails closed without workbench read grants', async ({ page }) => {
  await mockReporting(page, false);
  await signIn(page);
  await openReportingWorkspace(page);

  await expect(page.getByText('Your current HidraAPI grants do not allow reporting workbench reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Reporting intelligence' })).toHaveCount(0);
});
