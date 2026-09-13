import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
];

const descriptors = [
  ['simulation-scenario', 'SimulationScenarioJpaEntity'],
  ['simulation-run', 'SimulationRunJpaEntity'],
  ['simulation-result-summary', 'SimulationResultSummaryJpaEntity'],
  ['simulation-result-value', 'SimulationResultValueJpaEntity'],
  ['simulation-result-series-reference', 'SimulationResultSeriesReferenceJpaEntity'],
].map(([resource, javaType]) => ({
  module: 'simulation',
  resource,
  entityName: javaType.replace('JpaEntity', ''),
  javaType: `dz.sh.hidra.modules.simulation.infrastructure.persistence.entity.${javaType}`,
  tableName: `hidra_${resource.replaceAll('-', '_')}`,
  idField: 'id',
  searchableFields: [],
  listEndpoint: `/api/v1/workbench/simulation/${resource}`,
  detailEndpoint: `/api/v1/workbench/simulation/${resource}/{id}`,
  searchEndpoint: `/api/v1/workbench/simulation/${resource}/search`,
}));

async function mockSimulation(page: Page, allowRead = true) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: allowRead ? ['workbench:resources:read'] : [] }));
  await page.route('**/api/v1/workbench/simulation/resources', (route) => route.fulfill({ json: descriptors }));

  await page.route('**/api/v1/workbench/simulation/simulation-scenario?**', (route) => route.fulfill({
    json: { module: 'simulation', resource: 'simulation-scenario', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [
      { module: 'simulation', resource: 'simulation-scenario', id: 'sc-1', attributes: { code: 'SC-001', nameFr: 'Scénario débit', scenarioTypeId: 'what-if', modelId: 'model-1', topologySnapshotId: 'topo-1', status: 'READY' } },
    ] },
  }));
  await page.route('**/api/v1/workbench/simulation/simulation-run?**', (route) => route.fulfill({
    json: { module: 'simulation', resource: 'simulation-run', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [
      { module: 'simulation', resource: 'simulation-run', id: 'run-1', attributes: { scenarioId: 'sc-1', runTypeId: 'standard', status: 'COMPLETED', queuedAt: '2026-09-13T08:00:00Z', completedAt: '2026-09-13T08:01:00Z', durationMillis: 60000 } },
    ] },
  }));
  await page.route('**/api/v1/workbench/simulation/simulation-result-summary?**', (route) => route.fulfill({
    json: { module: 'simulation', resource: 'simulation-result-summary', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [
      { module: 'simulation', resource: 'simulation-result-summary', id: 'sum-1', attributes: { runId: 'run-1', feasible: true, objectiveScore: 0.97, constraintViolationCount: 0, warningCount: 1, resultStatusId: 'accepted' } },
    ] },
  }));
  await page.route('**/api/v1/workbench/simulation/simulation-result-value?**', (route) => route.fulfill({
    json: { module: 'simulation', resource: 'simulation-result-value', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [
      { module: 'simulation', resource: 'simulation-result-value', id: 'val-1', attributes: { runId: 'run-1', targetType: 'PIPELINE', targetId: 'pipe-1', metricCode: 'FLOW_RATE', value: 124.5, unitCode: 'M3_H' } },
    ] },
  }));
  await page.route('**/api/v1/workbench/simulation/simulation-result-series-reference?**', (route) => route.fulfill({
    json: { module: 'simulation', resource: 'simulation-result-series-reference', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [
      { module: 'simulation', resource: 'simulation-result-series-reference', id: 'series-1', attributes: { runId: 'run-1', seriesTypeId: 'pressure-series', targetType: 'PIPELINE', targetId: 'pipe-1', storageLocation: 'simulation://series/1', createdAt: '2026-09-13T08:01:00Z' } },
    ] },
  }));
  await page.route('**/api/v1/workbench/simulation/simulation-scenario/sc-1', (route) => route.fulfill({
    json: { module: 'simulation', resource: 'simulation-scenario', id: 'sc-1', attributes: { code: 'SC-001', status: 'READY', topologySnapshotId: 'topo-1' } },
  }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('simulation-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openSimulationWorkspace(page: Page) {
  await page.evaluate(() => {
    window.history.pushState({}, '', '/intelligence/simulation');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

test('HWEB-013-04 renders runtime-discovered simulation scenarios, runs and results without operational actions', async ({ page }) => {
  await mockSimulation(page);
  await signIn(page);
  await openSimulationWorkspace(page);

  await expect(page.getByRole('heading', { name: 'Simulation intelligence' })).toBeVisible();
  await expect(page.getByText('SC-001')).toBeVisible();
  await expect(page.getByText('READY')).toBeVisible();

  await page.getByRole('tab', { name: 'Runs' }).click();
  await expect(page.getByText('COMPLETED', { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: 'Result summaries' }).click();
  await expect(page.getByText('0.97')).toBeVisible();

  await page.getByRole('tab', { name: 'Result values' }).click();
  await expect(page.getByText('FLOW_RATE')).toBeVisible();

  await page.getByRole('tab', { name: 'Result series' }).click();
  await expect(page.getByText('pressure-series')).toBeVisible();
  await expect(page.getByText('simulation://series/1')).toBeVisible();

  await expect(page.getByRole('button', { name: /apply/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /approve/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /publish/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /queue/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /rerun/i })).toHaveCount(0);
});

test('HWEB-013-04 fails closed without workbench read grants', async ({ page }) => {
  await mockSimulation(page, false);
  await signIn(page);
  await openSimulationWorkspace(page);

  await expect(page.getByText('Your current HidraAPI grants do not allow simulation workbench reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Simulation intelligence' })).toHaveCount(0);
});
