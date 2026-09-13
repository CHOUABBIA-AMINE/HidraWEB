import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
];

const descriptors = [
  ['risk-register', 'RiskRegisterJpaEntity'],
  ['risk-assessment', 'RiskAssessmentJpaEntity'],
].map(([resource, javaType]) => ({
  module: 'risk',
  resource,
  entityName: javaType.replace('JpaEntity', ''),
  javaType: `dz.sh.hidra.modules.risk.infrastructure.persistence.entity.${javaType}`,
  tableName: `hidra_risk_${resource.replaceAll('-', '_')}`,
  idField: 'id',
  searchableFields: [],
  listEndpoint: `/api/v1/workbench/risk/${resource}`,
  detailEndpoint: `/api/v1/workbench/risk/${resource}/{id}`,
  searchEndpoint: `/api/v1/workbench/risk/${resource}/search`,
}));

async function mockRisk(page: Page, allowRead = true) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: allowRead ? ['workbench:resources:read'] : [] }));
  await page.route('**/api/v1/workbench/risk/resources', (route) => route.fulfill({ json: descriptors }));
  await page.route('**/api/v1/workbench/risk/risk-register?**', (route) => route.fulfill({
    json: {
      module: 'risk', resource: 'risk-register', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{ module: 'risk', resource: 'risk-register', id: 'rr-1', attributes: { code: 'RR-001', nameFr: 'Registre principal', registerTypeId: 'enterprise', scopeType: 'ORGANIZATION', scopeId: 'org-1', status: 'ACTIVE' } }],
    },
  }));
  await page.route('**/api/v1/workbench/risk/risk-assessment?**', (route) => route.fulfill({
    json: {
      module: 'risk', resource: 'risk-assessment', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{ module: 'risk', resource: 'risk-assessment', id: 'ra-1', attributes: { assessmentNumber: 'RA-001', title: 'Pipeline integrity risk', riskRegisterId: 'rr-1', inherentScore: 20, residualScore: 8, status: 'UNDER_REVIEW' } }],
    },
  }));
  await page.route('**/api/v1/workbench/risk/risk-register/rr-1', (route) => route.fulfill({
    json: { module: 'risk', resource: 'risk-register', id: 'rr-1', attributes: { code: 'RR-001', status: 'ACTIVE', scopeId: 'org-1' } },
  }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('risk-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-013-02 renders runtime-discovered risk registers and assessments without invented lifecycle actions', async ({ page }) => {
  await mockRisk(page);
  await signIn(page);
  await page.goto('/intelligence/risk');

  await expect(page.getByRole('heading', { name: 'Risk intelligence' })).toBeVisible();
  await expect(page.getByText('RR-001')).toBeVisible();
  await expect(page.getByText('ACTIVE')).toBeVisible();
  await page.getByRole('tab', { name: 'Risk assessments' }).click();
  await expect(page.getByText('Pipeline integrity risk')).toBeVisible();
  await expect(page.getByText('UNDER_REVIEW')).toBeVisible();

  await expect(page.getByRole('button', { name: /approve/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /activate/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /retire/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /cancel/i })).toHaveCount(0);
});

test('HWEB-013-02 fails closed without workbench read grants', async ({ page }) => {
  await mockRisk(page, false);
  await signIn(page);
  await page.goto('/intelligence/risk');

  await expect(page.getByText('Your current HidraAPI grants do not allow risk workbench reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Risk intelligence' })).toHaveCount(0);
});
