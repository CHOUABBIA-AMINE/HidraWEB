import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/assets/maintainable-assets', methods: ['POST'], module: 'assets', resource: 'maintainable-assets', action: 'create', permission: 'assets:maintainable-assets:create', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/assets/asset-conditions', methods: ['POST'], module: 'assets', resource: 'asset-conditions', action: 'create', permission: 'assets:asset-conditions:create', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/assets/maintenance-work-orders', methods: ['POST'], module: 'assets', resource: 'maintenance-work-orders', action: 'create', permission: 'assets:maintenance-work-orders:create', enforcementStatus: 'backend-enforced' },
];

const effectivePermissions = [
  'workbench:resources:read',
  'assets:maintainable-assets:create',
  'assets:asset-conditions:create',
  'assets:maintenance-work-orders:create',
];

async function mockAssets(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));

  await page.route('**/api/v1/workbench/assets/resources', (route) => route.fulfill({
    json: [
      {
        module: 'assets', resource: 'maintainable-asset', entityName: 'MaintainableAsset', javaType: 'MaintainableAssetJpaEntity',
        tableName: 'hidra_assets_maintainable_asset', idField: 'id', searchableFields: ['assetNumber', 'assetCode', 'assetName'],
        listEndpoint: '/api/v1/workbench/assets/maintainable-asset', detailEndpoint: '/api/v1/workbench/assets/maintainable-asset/{id}',
        searchEndpoint: '/api/v1/workbench/assets/maintainable-asset/search',
      },
      {
        module: 'assets', resource: 'maintenance-work-order', entityName: 'MaintenanceWorkOrder', javaType: 'MaintenanceWorkOrderJpaEntity',
        tableName: 'hidra_assets_maintenance_work_order', idField: 'id', searchableFields: ['workOrderNumber', 'title'],
        listEndpoint: '/api/v1/workbench/assets/maintenance-work-order', detailEndpoint: '/api/v1/workbench/assets/maintenance-work-order/{id}',
        searchEndpoint: '/api/v1/workbench/assets/maintenance-work-order/search',
      },
    ],
  }));

  await page.route('**/api/v1/workbench/assets/maintainable-asset?**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('page')).toBe('0');
    expect(url.searchParams.get('size')).toBe('25');
    await route.fulfill({
      json: {
        module: 'assets', resource: 'maintainable-asset', page: 0, size: 25, totalElements: 1, totalPages: 1,
        items: [{
          module: 'assets', resource: 'maintainable-asset', id: 'asset-1',
          attributes: {
            assetNumber: 'MA-001', assetCode: 'PUMP-001', assetName: 'North Pump', status: 'ACTIVE',
            topologyAssetTypeCode: 'PUMP', topologyAssetId: 'topology-pump-1', ownerOrganizationUnitId: 'org-maintenance',
          },
        }],
      },
    });
  });

  await page.route('**/api/v1/workbench/assets/maintainable-asset/asset-1', (route) => route.fulfill({
    json: {
      module: 'assets', resource: 'maintainable-asset', id: 'asset-1',
      attributes: {
        assetNumber: 'MA-001', assetCode: 'PUMP-001', assetName: 'North Pump', status: 'ACTIVE',
        topologyAssetTypeCode: 'PUMP', topologyAssetId: 'topology-pump-1', ownerOrganizationUnitId: 'org-maintenance',
      },
    },
  }));

  await page.route('**/api/v1/assets/maintainable-assets', async (route) => {
    expect(await route.request().postDataJSON()).toEqual({
      assetNumber: 'MA-002', assetCode: 'VALVE-002', assetName: 'South Valve', assetTypeId: 'VALVE',
      topologyAssetTypeCode: 'VALVE', topologyAssetId: 'topology-valve-2', ownerOrganizationUnitId: 'org-maintenance',
    });
    await route.fulfill({ json: { id: 'asset-2', assetNumber: 'MA-002' } });
  });

  await page.route('**/api/v1/assets/asset-conditions', async (route) => {
    expect(await route.request().postDataJSON()).toEqual({
      maintainableAssetId: 'asset-1', conditionStatus: 'GOOD', conditionTypeId: 'VISUAL', sourceModule: 'assets',
      sourceReferenceId: 'inspection-42', summary: 'No visible degradation', conditionScore: 92,
    });
    await route.fulfill({ json: { id: 'condition-1' } });
  });

  await page.route('**/api/v1/assets/maintenance-work-orders', async (route) => {
    expect(await route.request().postDataJSON()).toEqual({
      workOrderNumber: 'WO-2026-001', maintainableAssetId: 'asset-1', sourceRecommendationId: 'recommendation-7',
      workOrderTypeId: 'PREVENTIVE', priorityId: 'P2', title: 'Inspect pump seals', assignedOrganizationUnitId: 'org-maintenance',
    });
    await route.fulfill({ json: { id: 'wo-1', workOrderNumber: 'WO-2026-001' } });
  });
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

test('HWEB-011-03 reads assets from workbench and uses backend-owned create contracts', async ({ page }) => {
  await mockAssets(page);
  await signIn(page);
  await navigateInApp(page, '/engineering/assets');

  await expect(page.getByRole('heading', { name: 'Integrity & Maintenance' })).toBeVisible();
  await expect(page.getByText('Backend resource: maintainable-asset')).toBeVisible();
  await expect(page.getByText(/MA-001/)).toBeVisible();

  await page.getByText('asset-1', { exact: true }).click();
  await expect(page.locator('pre').filter({ hasText: 'topology-pump-1' })).toBeVisible();
  await expect(page.getByText('Topology: PUMP · topology-pump-1')).toBeVisible();

  await page.getByRole('textbox', { name: 'assetNumber', exact: true }).fill('MA-002');
  await page.getByRole('textbox', { name: 'assetCode', exact: true }).fill('VALVE-002');
  await page.getByRole('textbox', { name: 'assetName', exact: true }).fill('South Valve');
  await page.getByRole('textbox', { name: 'assetTypeId', exact: true }).fill('VALVE');
  await page.getByRole('textbox', { name: 'topologyAssetTypeCode', exact: true }).fill('VALVE');
  await page.getByRole('textbox', { name: 'topologyAssetId', exact: true }).fill('topology-valve-2');
  await page.getByRole('textbox', { name: 'ownerOrganizationUnitId', exact: true }).fill('org-maintenance');
  await page.getByRole('button', { name: 'Register maintainable asset' }).click();
  await expect(page.getByText(/Maintainable asset registered/)).toBeVisible();

  await page.getByRole('textbox', { name: 'maintainableAssetId', exact: true }).nth(0).fill('asset-1');
  await page.getByRole('textbox', { name: 'conditionStatus', exact: true }).fill('GOOD');
  await page.getByRole('textbox', { name: 'conditionTypeId', exact: true }).fill('VISUAL');
  await page.getByRole('textbox', { name: 'sourceModule', exact: true }).fill('assets');
  await page.getByRole('textbox', { name: 'sourceReferenceId', exact: true }).fill('inspection-42');
  await page.getByRole('textbox', { name: 'summary', exact: true }).fill('No visible degradation');
  await page.getByRole('textbox', { name: 'conditionScore', exact: true }).fill('92');
  await page.getByRole('button', { name: 'Record asset condition' }).click();
  await expect(page.getByText(/Asset condition recorded/)).toBeVisible();

  await page.getByRole('textbox', { name: 'workOrderNumber', exact: true }).fill('WO-2026-001');
  await page.getByRole('textbox', { name: 'maintainableAssetId', exact: true }).nth(1).fill('asset-1');
  await page.getByRole('textbox', { name: 'sourceRecommendationId', exact: true }).fill('recommendation-7');
  await page.getByRole('textbox', { name: 'workOrderTypeId', exact: true }).fill('PREVENTIVE');
  await page.getByRole('textbox', { name: 'priorityId', exact: true }).fill('P2');
  await page.getByRole('textbox', { name: 'title', exact: true }).fill('Inspect pump seals');
  await page.getByRole('textbox', { name: 'assignedOrganizationUnitId', exact: true }).fill('org-maintenance');
  await page.getByRole('button', { name: 'Create maintenance work order' }).click();
  await expect(page.getByText(/Maintenance work order created/)).toBeVisible();
});
