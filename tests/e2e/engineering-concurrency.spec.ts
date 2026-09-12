import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/assets/maintainable-assets/{assetId}', methods: ['PATCH'], module: 'assets', resource: 'maintainable-assets', action: 'update', permission: 'assets:maintainable-assets:update', enforcementStatus: 'backend-enforced' },
];

const effectivePermissions = [
  'workbench:resources:read',
  'assets:maintainable-assets:update',
];

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

test('HWEB-011-06 refetches after stale maintainable-asset update and requires a new user submit', async ({ page }) => {
  let assetName = 'North Pump';
  let updatedAt = '2026-09-12T20:00:00Z';
  let patchAttempts = 0;

  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));

  await page.route('**/api/v1/workbench/assets/resources', (route) => route.fulfill({
    json: [{
      module: 'assets', resource: 'maintainable-asset', entityName: 'MaintainableAsset', javaType: 'MaintainableAssetJpaEntity',
      tableName: 'hidra_assets_maintainable_asset', idField: 'id', searchableFields: ['assetNumber', 'assetCode', 'assetName'],
      listEndpoint: '/api/v1/workbench/assets/maintainable-asset', detailEndpoint: '/api/v1/workbench/assets/maintainable-asset/{id}',
      searchEndpoint: '/api/v1/workbench/assets/maintainable-asset/search',
    }],
  }));

  await page.route('**/api/v1/workbench/assets/maintainable-asset?**', (route) => route.fulfill({
    json: {
      module: 'assets', resource: 'maintainable-asset', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{
        module: 'assets', resource: 'maintainable-asset', id: 'asset-1',
        attributes: { assetNumber: 'MA-001', assetCode: 'PUMP-001', assetName, status: 'ACTIVE', updatedAt },
      }],
    },
  }));

  await page.route('**/api/v1/workbench/assets/maintainable-asset/asset-1', (route) => route.fulfill({
    json: {
      module: 'assets', resource: 'maintainable-asset', id: 'asset-1',
      attributes: { assetNumber: 'MA-001', assetCode: 'PUMP-001', assetName, status: 'ACTIVE', updatedAt },
    },
  }));

  await page.route('**/api/v1/assets/maintainable-assets/asset-1', async (route) => {
    expect(route.request().method()).toBe('PATCH');
    patchAttempts += 1;
    const body = await route.request().postDataJSON();

    if (patchAttempts === 1) {
      expect(body).toEqual({ expectedUpdatedAt: '2026-09-12T20:00:00Z', assetName: 'Operator Edit' });
      assetName = 'Concurrent Pump';
      updatedAt = '2026-09-12T20:05:00Z';
      await route.fulfill({
        status: 409,
        json: {
          status: 409,
          code: 'ASSETS_MAINTAINABLE_ASSET_CONFLICT',
          message: 'Maintainable asset changed after it was loaded. Refetch the asset before retrying.',
        },
      });
      return;
    }

    expect(body).toEqual({ expectedUpdatedAt: '2026-09-12T20:05:00Z', assetName: 'Operator Rebased' });
    assetName = 'Operator Rebased';
    updatedAt = '2026-09-12T20:06:00Z';
    await route.fulfill({
      json: {
        id: 'asset-1', assetNumber: 'MA-001', assetCode: 'PUMP-001', assetName, status: 'ACTIVE', updatedAt,
      },
    });
  });

  await signIn(page);
  await navigateInApp(page, '/engineering/assets');
  await page.getByText('asset-1', { exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Maintainable asset name update' })).toBeVisible();
  await expect(page.getByText('Authoritative version: 2026-09-12T20:00:00Z')).toBeVisible();

  const nameField = page.getByRole('textbox', { name: 'Asset name' });
  await nameField.fill('Operator Edit');
  await page.getByRole('button', { name: 'Save asset name' }).click();

  await expect(page.getByText(/HidraAPI rejected a stale maintainable asset/)).toBeVisible();
  await expect(nameField).toHaveValue('Concurrent Pump');
  await expect(page.getByText('Authoritative version: 2026-09-12T20:05:00Z')).toBeVisible();
  expect(patchAttempts).toBe(1);

  await nameField.fill('Operator Rebased');
  await page.getByRole('button', { name: 'Save asset name' }).click();

  await expect(page.getByText(/Maintainable asset saved\. New version: 2026-09-12T20:06:00Z/)).toBeVisible();
  expect(patchAttempts).toBe(2);
});
