import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
];

const descriptors = [
  ['analytics-dataset', 'AnalyticsDatasetJpaEntity'],
  ['analytics-insight', 'AnalyticsInsightJpaEntity'],
  ['metric-definition', 'MetricDefinitionJpaEntity'],
  ['metric-evaluation-run', 'MetricEvaluationRunJpaEntity'],
].map(([resource, javaType]) => ({
  module: 'analytics',
  resource,
  entityName: javaType.replace('JpaEntity', ''),
  javaType: `dz.sh.hidra.modules.analytics.infrastructure.persistence.entity.${javaType}`,
  tableName: `hidra_analytics_${resource.replaceAll('-', '_')}`,
  idField: 'id',
  searchableFields: [],
  listEndpoint: `/api/v1/workbench/analytics/${resource}`,
  detailEndpoint: `/api/v1/workbench/analytics/${resource}/{id}`,
  searchEndpoint: `/api/v1/workbench/analytics/${resource}/search`,
}));

async function mockAnalytics(page: Page, allowRead = true) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: allowRead ? ['workbench:resources:read'] : [] }));
  await page.route('**/api/v1/workbench/analytics/resources', (route) => route.fulfill({ json: descriptors }));
  await page.route('**/api/v1/workbench/analytics/analytics-dataset?**', (route) => route.fulfill({
    json: {
      module: 'analytics', resource: 'analytics-dataset', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{ module: 'analytics', resource: 'analytics-dataset', id: 'ds-1', attributes: { code: 'DS-001', nameFr: 'Historique pression', subjectAreaId: 'telemetry', datasetType: 'TIME_SERIES', refreshMode: 'INCREMENTAL', qualityStatus: 'READY', lineageStatus: 'COMPLETE' } }],
    },
  }));
  await page.route('**/api/v1/workbench/analytics/analytics-insight?**', (route) => route.fulfill({
    json: {
      module: 'analytics', resource: 'analytics-insight', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{ module: 'analytics', resource: 'analytics-insight', id: 'in-1', attributes: { title: 'Pressure drift', insightType: 'TREND', subjectAreaId: 'telemetry', scopeType: 'PIPELINE', confidenceScore: 0.94, status: 'UNDER_REVIEW' } }],
    },
  }));
  await page.route('**/api/v1/workbench/analytics/metric-definition?**', (route) => route.fulfill({
    json: {
      module: 'analytics', resource: 'metric-definition', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{ module: 'analytics', resource: 'metric-definition', id: 'md-1', attributes: { code: 'PRESSURE_STABILITY', nameFr: 'Stabilité pression', subjectAreaId: 'telemetry', metricType: 'RATIO', aggregationMethod: 'AVERAGE', active: true } }],
    },
  }));
  await page.route('**/api/v1/workbench/analytics/metric-evaluation-run?**', (route) => route.fulfill({
    json: {
      module: 'analytics', resource: 'metric-evaluation-run', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{ module: 'analytics', resource: 'metric-evaluation-run', id: 'me-1', attributes: { metricDefinitionVersionId: 'mdv-1', runStatus: 'COMPLETED', periodStart: '2026-09-12T00:00:00Z', periodEnd: '2026-09-13T00:00:00Z', recordsRead: 1440, recordsProduced: 1 } }],
    },
  }));
  await page.route('**/api/v1/workbench/analytics/analytics-dataset/ds-1', (route) => route.fulfill({
    json: { module: 'analytics', resource: 'analytics-dataset', id: 'ds-1', attributes: { code: 'DS-001', qualityStatus: 'READY', createdFrom: 'telemetry-history' } },
  }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('analytics-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openAnalyticsWorkspace(page: Page) {
  await page.evaluate(() => {
    window.history.pushState({}, '', '/intelligence/analytics');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

test('HWEB-013-03 renders runtime-discovered analytics datasets, insights and metrics without operational actions', async ({ page }) => {
  await mockAnalytics(page);
  await signIn(page);
  await openAnalyticsWorkspace(page);

  await expect(page.getByRole('heading', { name: 'Analytics intelligence' })).toBeVisible();
  await expect(page.getByText('DS-001')).toBeVisible();
  await expect(page.getByText('READY')).toBeVisible();

  await page.getByRole('tab', { name: 'Insights' }).click();
  await expect(page.getByText('Pressure drift')).toBeVisible();
  await expect(page.getByText('UNDER_REVIEW')).toBeVisible();

  await page.getByRole('tab', { name: 'Metric definitions' }).click();
  await expect(page.getByText('PRESSURE_STABILITY')).toBeVisible();

  await page.getByRole('tab', { name: 'Metric evaluations' }).click();
  await expect(page.getByText('COMPLETED')).toBeVisible();

  await expect(page.getByRole('button', { name: /apply/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /approve/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /publish/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /rerun/i })).toHaveCount(0);
});

test('HWEB-013-03 fails closed without workbench read grants', async ({ page }) => {
  await mockAnalytics(page, false);
  await signIn(page);
  await openAnalyticsWorkspace(page);

  await expect(page.getByText('Your current HidraAPI grants do not allow analytics workbench reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Analytics intelligence' })).toHaveCount(0);
});
