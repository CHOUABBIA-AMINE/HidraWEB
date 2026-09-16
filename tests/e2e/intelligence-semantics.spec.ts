import { expect, test, type Page } from '@playwright/test';

const permissionRoutes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
];

const descriptors: Record<string, Array<{ module: string; resource: string; javaType: string }>> = {
  risk: [
    ['risk-register', 'RiskRegisterJpaEntity'],
    ['risk-assessment', 'RiskAssessmentJpaEntity'],
  ].map(([resource, javaType]) => ({ module: 'risk', resource, javaType: `dz.sh.hidra.modules.risk.infrastructure.persistence.entity.${javaType}` })),
  analytics: [
    ['analytics-dataset', 'AnalyticsDatasetJpaEntity'],
    ['analytics-insight', 'AnalyticsInsightJpaEntity'],
    ['metric-definition', 'MetricDefinitionJpaEntity'],
    ['metric-evaluation-run', 'MetricEvaluationRunJpaEntity'],
  ].map(([resource, javaType]) => ({ module: 'analytics', resource, javaType: `dz.sh.hidra.modules.analytics.infrastructure.persistence.entity.${javaType}` })),
  simulation: [
    ['simulation-scenario', 'SimulationScenarioJpaEntity'],
    ['simulation-run', 'SimulationRunJpaEntity'],
    ['simulation-result-summary', 'SimulationResultSummaryJpaEntity'],
    ['simulation-result-value', 'SimulationResultValueJpaEntity'],
    ['simulation-result-series-reference', 'SimulationResultSeriesReferenceJpaEntity'],
  ].map(([resource, javaType]) => ({ module: 'simulation', resource, javaType: `dz.sh.hidra.modules.simulation.infrastructure.persistence.entity.${javaType}` })),
  reporting: [
    ['report-definition', 'ReportDefinitionJpaEntity'],
    ['report-request', 'ReportRequestJpaEntity'],
    ['report-run', 'ReportRunJpaEntity'],
    ['report-output-artifact', 'ReportOutputArtifactJpaEntity'],
  ].map(([resource, javaType]) => ({ module: 'reporting', resource, javaType: `dz.sh.hidra.modules.reporting.infrastructure.persistence.entity.${javaType}` })),
};

const operationalOwnerModules = new Set([
  'alarm',
  'assets',
  'custody',
  'hse',
  'identity',
  'incident',
  'integrity',
  'leakdetection',
  'monitoring',
  'organization',
  'party',
  'planning',
  'telemetry',
  'topology',
  'workflow',
]);

const authenticationExchangePaths = new Set([
  '/api/v1/identity/authentication/login',
  '/api/v1/identity/authentication/oidc/complete',
]);

async function mockIntelligenceReads(page: Page, operationalWrites: string[]) {
  page.on('request', (request) => {
    if (request.method() === 'GET' || request.method() === 'HEAD' || request.method() === 'OPTIONS') return;
    const pathname = new URL(request.url()).pathname;
    if (authenticationExchangePaths.has(pathname)) return;
    const match = pathname.match(/^\/api\/v1\/([^/]+)/);
    if (match && operationalOwnerModules.has(match[1])) {
      operationalWrites.push(`${request.method()} ${pathname}`);
    }
  });

  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: permissionRoutes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes: permissionRoutes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: ['workbench:resources:read'] }));

  await page.route('**/api/v1/workbench/**', (route) => {
    const url = new URL(route.request().url());
    const parts = url.pathname.split('/').filter(Boolean);
    const module = parts[3];
    const resource = parts[4];

    if (resource === 'resources') {
      return route.fulfill({ json: descriptors[module] ?? [] });
    }

    return route.fulfill({
      json: {
        module,
        resource,
        page: 0,
        size: 25,
        totalElements: 0,
        totalPages: 0,
        items: [],
      },
    });
  });
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('intelligence-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function navigate(page: Page, path: string) {
  await page.evaluate((nextPath) => {
    window.history.pushState({}, '', nextPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

test('HWEB-013-06 preserves read derive recommend semantics without operational writes', async ({ page }) => {
  const operationalWrites: string[] = [];
  await mockIntelligenceReads(page, operationalWrites);
  await signIn(page);

  await navigate(page, '/intelligence/risk');
  await expect(page.getByRole('heading', { name: 'Risk intelligence' })).toBeVisible();
  await expect(page.getByText(/read-only risk views/i)).toBeVisible();
  await expect(page.getByText(/HidraAPI remains authoritative for risk data, authorization, and lifecycle semantics/i)).toBeVisible();

  await navigate(page, '/intelligence/analytics');
  await expect(page.getByRole('heading', { name: 'Analytics intelligence' })).toBeVisible();
  await expect(page.getByText(/analytics-owned read views only/i)).toBeVisible();
  await expect(page.getByText(/operational source-of-truth data remains owned by its source modules/i)).toBeVisible();

  await navigate(page, '/intelligence/simulation');
  await expect(page.getByRole('heading', { name: 'Simulation intelligence' })).toBeVisible();
  await expect(page.getByText(/decision-support evidence rather than operational commands/i)).toBeVisible();
  await expect(page.getByText(/does not create scenarios\/models, queue runs, publish recommendations, or apply changes to operational modules/i)).toBeVisible();

  await navigate(page, '/intelligence/reports');
  await expect(page.getByRole('heading', { name: 'Reporting intelligence' })).toBeVisible();
  await expect(page.getByText(/no artifact retrieval or download endpoint/i)).toBeVisible();
  await expect(page.getByText(/does not create definitions, request reports, queue runs, generate artifacts, download files, or invent export semantics/i)).toBeVisible();

  expect(operationalWrites).toEqual([]);
});
