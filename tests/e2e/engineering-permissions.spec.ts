import { expect, test, type Page } from '@playwright/test';

const workbenchReadRoutes = [
  {
    route: '/api/v1/workbench/{module}/{resource}',
    methods: ['GET'],
    module: 'workbench',
    resource: 'resources',
    action: 'read',
    permission: 'workbench:resources:read',
    enforcementStatus: 'backend-enforced',
  },
  {
    route: '/api/v1/workbench/{module}/{resource}/{id}',
    methods: ['GET'],
    module: 'workbench',
    resource: 'resources',
    action: 'read',
    permission: 'workbench:resources:read',
    enforcementStatus: 'backend-enforced',
  },
];

const workbenchSearchRoute = {
  route: '/api/v1/workbench/{module}/{resource}/search',
  methods: ['POST'],
  module: 'workbench',
  resource: 'resources',
  action: 'search',
  permission: 'workbench:resources:search',
  enforcementStatus: 'backend-enforced',
};

const integrityCreateRoute = {
  route: '/api/v1/integrity/assessments',
  methods: ['POST'],
  module: 'integrity',
  resource: 'assessments',
  action: 'create',
  permission: 'integrity:assessments:create',
  enforcementStatus: 'backend-enforced',
};

const assetCommandRoutes = [
  {
    route: '/api/v1/assets/maintainable-assets',
    methods: ['POST'],
    module: 'assets',
    resource: 'maintainable-assets',
    action: 'create',
    permission: 'assets:maintainable-assets:create',
    enforcementStatus: 'backend-enforced',
  },
  {
    route: '/api/v1/assets/asset-conditions',
    methods: ['POST'],
    module: 'assets',
    resource: 'asset-conditions',
    action: 'create',
    permission: 'assets:asset-conditions:create',
    enforcementStatus: 'backend-enforced',
  },
  {
    route: '/api/v1/assets/maintenance-work-orders',
    methods: ['POST'],
    module: 'assets',
    resource: 'maintenance-work-orders',
    action: 'create',
    permission: 'assets:maintenance-work-orders:create',
    enforcementStatus: 'backend-enforced',
  },
];

type RouteDescriptor = (typeof workbenchReadRoutes)[number] | typeof workbenchSearchRoute | typeof integrityCreateRoute | (typeof assetCommandRoutes)[number];

async function mockPermissions(page: Page, routes: RouteDescriptor[], effectivePermissions: string[]) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: {
      strategy: 'derived-route-permission-catalog',
      enforcement: 'backend-enforced',
      permissionFormat: '<module>:<resource>:<action>',
      routes,
    },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
}

async function mockIntegrityReads(page: Page) {
  await page.route('**/api/v1/workbench/integrity/resources', (route) => route.fulfill({
    json: [{
      module: 'integrity',
      resource: 'integrity-assessment',
      entityName: 'IntegrityAssessment',
      javaType: 'IntegrityAssessmentJpaEntity',
      tableName: 'hidra_integrity_assessment',
      idField: 'id',
      searchableFields: ['assessmentNumber', 'title'],
      listEndpoint: '/api/v1/workbench/integrity/integrity-assessment',
      detailEndpoint: '/api/v1/workbench/integrity/integrity-assessment/{id}',
      searchEndpoint: '/api/v1/workbench/integrity/integrity-assessment/search',
    }],
  }));
  await page.route('**/api/v1/workbench/integrity/integrity-assessment?**', (route) => route.fulfill({
    json: {
      module: 'integrity',
      resource: 'integrity-assessment',
      page: 0,
      size: 25,
      totalElements: 1,
      totalPages: 1,
      items: [{
        module: 'integrity',
        resource: 'integrity-assessment',
        id: 'assessment-1',
        attributes: {
          assessmentNumber: 'IA-2026-001',
          title: 'North line integrity assessment',
          assessmentTypeId: 'ILI_REVIEW',
          status: 'DRAFT',
        },
      }],
    },
  }));
}

async function mockAssetReads(page: Page) {
  await page.route('**/api/v1/workbench/assets/resources', (route) => route.fulfill({
    json: [
      {
        module: 'assets',
        resource: 'maintainable-asset',
        entityName: 'MaintainableAsset',
        javaType: 'MaintainableAssetJpaEntity',
        tableName: 'hidra_assets_maintainable_asset',
        idField: 'id',
        searchableFields: ['assetNumber', 'assetCode', 'assetName'],
        listEndpoint: '/api/v1/workbench/assets/maintainable-asset',
        detailEndpoint: '/api/v1/workbench/assets/maintainable-asset/{id}',
        searchEndpoint: '/api/v1/workbench/assets/maintainable-asset/search',
      },
      {
        module: 'assets',
        resource: 'asset-lifecycle-events',
        entityName: 'AssetLifecycleEvent',
        javaType: 'dz.sh.hidra.modules.assets.infrastructure.persistence.entity.AssetLifecycleEventJpaEntity',
        tableName: 'hidra_asset_lifecycle_event',
        idField: 'id',
        searchableFields: ['maintainableAssetId'],
        listEndpoint: '/api/v1/workbench/assets/asset-lifecycle-events',
        detailEndpoint: '/api/v1/workbench/assets/asset-lifecycle-events/{id}',
        searchEndpoint: '/api/v1/workbench/assets/asset-lifecycle-events/search',
      },
    ],
  }));
  await page.route('**/api/v1/workbench/assets/maintainable-asset?**', (route) => route.fulfill({
    json: {
      module: 'assets',
      resource: 'maintainable-asset',
      page: 0,
      size: 25,
      totalElements: 1,
      totalPages: 1,
      items: [{
        module: 'assets',
        resource: 'maintainable-asset',
        id: 'asset-1',
        attributes: {
          assetNumber: 'MA-001',
          assetCode: 'PUMP-001',
          assetName: 'North Pump',
          status: 'ACTIVE',
        },
      }],
    },
  }));
  await page.route('**/api/v1/workbench/assets/maintainable-asset/asset-1', (route) => route.fulfill({
    json: {
      module: 'assets',
      resource: 'maintainable-asset',
      id: 'asset-1',
      attributes: {
        assetNumber: 'MA-001',
        assetCode: 'PUMP-001',
        assetName: 'North Pump',
        status: 'ACTIVE',
      },
    },
  }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('engineer');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function navigateInApp(page: Page, path: string) {
  await page.evaluate((nextPath) => {
    window.history.pushState({}, '', nextPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

test('HWEB-011-06 denies integrity creation when the route is published but the effective grant is absent', async ({ page }) => {
  const routes = [...workbenchReadRoutes, integrityCreateRoute];
  await mockPermissions(page, routes, ['workbench:resources:read']);
  await mockIntegrityReads(page);

  let createRequests = 0;
  await page.route('**/api/v1/integrity/assessments', (route) => {
    createRequests += 1;
    return route.fulfill({ json: { id: 'unexpected' } });
  });

  await signIn(page);
  await navigateInApp(page, '/engineering');

  await expect(page.getByRole('heading', { name: 'Integrity & Maintenance' })).toBeVisible();
  await expect(page.getByText('Your effective grants do not permit assessment creation.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create assessment' })).toBeDisabled();
  expect(createRequests).toBe(0);
});

test('HWEB-011-06 does not invent an integrity action from an effective grant when its route descriptor is missing', async ({ page }) => {
  const routes = [...workbenchReadRoutes];
  await mockPermissions(page, routes, ['workbench:resources:read', 'integrity:assessments:create']);
  await mockIntegrityReads(page);

  await signIn(page);
  await navigateInApp(page, '/engineering');

  await expect(page.getByText('HidraAPI did not publish a route permission for assessment creation.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create assessment' })).toBeDisabled();
});

test('HWEB-011-06 applies effective grants to assets commands and lifecycle-history search', async ({ page }) => {
  const routes = [...workbenchReadRoutes, workbenchSearchRoute, ...assetCommandRoutes];
  await mockPermissions(page, routes, ['workbench:resources:read']);
  await mockAssetReads(page);

  let lifecycleSearchRequests = 0;
  await page.route('**/api/v1/workbench/assets/asset-lifecycle-events/search', (route) => {
    lifecycleSearchRequests += 1;
    return route.fulfill({ json: { module: 'assets', resource: 'asset-lifecycle-events', page: 0, size: 200, totalElements: 0, totalPages: 0, items: [] } });
  });

  await signIn(page);
  await navigateInApp(page, '/engineering/assets');

  await expect(page.getByRole('button', { name: 'Register maintainable asset' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Record asset condition' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Create maintenance work order' })).toBeDisabled();

  await page.getByText('asset-1', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Asset lifecycle history' })).toBeVisible();
  await expect(page.getByText('Your effective grants do not permit asset lifecycle history search.')).toBeVisible();
  expect(lifecycleSearchRequests).toBe(0);
});

test('HWEB-011-06 keeps HidraAPI as final authorization authority when an allowed-looking action returns 403', async ({ page }) => {
  const routes = [...workbenchReadRoutes, integrityCreateRoute];
  await mockPermissions(page, routes, ['workbench:resources:read', 'integrity:assessments:create']);
  await mockIntegrityReads(page);

  await page.route('**/api/v1/integrity/assessments', (route) => route.fulfill({
    status: 403,
    json: { status: 403, message: 'Forbidden' },
  }));

  await signIn(page);
  await navigateInApp(page, '/engineering');

  await page.getByLabel('programId').fill('program-1');
  await page.getByLabel('assessmentNumber').fill('IA-2026-002');
  await page.getByLabel('title').fill('South line integrity assessment');
  await page.getByLabel('assessmentTypeId').fill('ILI_REVIEW');
  await page.getByRole('button', { name: 'Create assessment' }).click();

  await expect(page.getByText('HidraAPI refused access to integrity assessment.')).toBeVisible();
});
