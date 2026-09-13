import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/configuration/definitions', methods: ['POST'], module: 'configuration', resource: 'definitions', action: 'create', permission: 'configuration:definitions:create', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/configuration/feature-flags', methods: ['POST'], module: 'configuration', resource: 'feature-flags', action: 'create', permission: 'configuration:feature-flags:create', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/configuration/values', methods: ['POST'], module: 'configuration', resource: 'values', action: 'create', permission: 'configuration:values:create', enforcementStatus: 'backend-enforced' },
];

const descriptors = [
  { module: 'configuration', resource: 'configuration-definition', entityName: 'ConfigurationDefinition', javaType: 'dz.sh.hidra.modules.configuration.infrastructure.persistence.entity.ConfigurationDefinitionJpaEntity', tableName: 'hidra_configuration_definition', idField: 'id', searchableFields: ['key'], listEndpoint: '/api/v1/workbench/configuration/configuration-definition', detailEndpoint: '/api/v1/workbench/configuration/configuration-definition/{id}', searchEndpoint: '/api/v1/workbench/configuration/configuration-definition/search' },
  { module: 'configuration', resource: 'feature-flag', entityName: 'FeatureFlag', javaType: 'dz.sh.hidra.modules.configuration.infrastructure.persistence.entity.FeatureFlagJpaEntity', tableName: 'hidra_configuration_feature_flag', idField: 'id', searchableFields: ['code'], listEndpoint: '/api/v1/workbench/configuration/feature-flag', detailEndpoint: '/api/v1/workbench/configuration/feature-flag/{id}', searchEndpoint: '/api/v1/workbench/configuration/feature-flag/search' },
  { module: 'configuration', resource: 'configuration-value', entityName: 'ConfigurationValue', javaType: 'dz.sh.hidra.modules.configuration.infrastructure.persistence.entity.ConfigurationValueJpaEntity', tableName: 'hidra_configuration_value', idField: 'id', searchableFields: ['environment'], listEndpoint: '/api/v1/workbench/configuration/configuration-value', detailEndpoint: '/api/v1/workbench/configuration/configuration-value/{id}', searchEndpoint: '/api/v1/workbench/configuration/configuration-value/search' },
];

const allGrants = [
  'workbench:resources:read',
  'configuration:definitions:create',
  'configuration:feature-flags:create',
  'configuration:values:create',
];

async function mockConfiguration(page: Page, grants = allGrants) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: grants }));
  await page.route('**/api/v1/workbench/configuration/resources', (route) => route.fulfill({ json: descriptors }));
  await page.route('**/api/v1/workbench/configuration/configuration-definition?**', (route) => route.fulfill({ json: { module: 'configuration', resource: 'configuration-definition', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [{ module: 'configuration', resource: 'configuration-definition', id: 'def-existing', attributes: { key: 'telemetry.retention', status: 'ACTIVE' } }] } }));
  await page.route('**/api/v1/workbench/configuration/feature-flag?**', (route) => route.fulfill({ json: { module: 'configuration', resource: 'feature-flag', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [{ module: 'configuration', resource: 'feature-flag', id: 'flag-existing', attributes: { code: 'FLAG_EXISTING', status: 'ACTIVE' } }] } }));
  await page.route('**/api/v1/workbench/configuration/configuration-value?**', (route) => route.fulfill({ json: { module: 'configuration', resource: 'configuration-value', page: 0, size: 25, totalElements: 1, totalPages: 1, items: [{ module: 'configuration', resource: 'configuration-value', id: 'value-existing', attributes: { environment: 'PROD', status: 'ACTIVE' } }] } }));

  await page.route('**/api/v1/configuration/definitions', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      namespaceId: 'ns-1', key: 'ops.timeout', displayNameFr: 'Délai opérations', displayNameAr: '', displayNameEn: '',
      valueType: 'DURATION', sensitivity: 'INTERNAL', scoped: true, requiresApproval: true,
      defaultValue: 'PT30S', description: '',
    });
    await route.fulfill({ json: { id: 'def-1', namespaceId: 'ns-1', key: 'ops.timeout', displayNameFr: 'Délai opérations', valueType: 'DURATION', sensitivity: 'INTERNAL', status: 'DRAFT', scoped: true, requiresApproval: true } });
  });
  await page.route('**/api/v1/configuration/feature-flags', async (route) => {
    expect(route.request().postDataJSON()).toEqual({ code: 'OPS_NEW_PANEL', nameFr: 'Nouveau panneau', nameAr: '', nameEn: '', owningModule: 'operations', evaluationStrategy: 'BOOLEAN', defaultEnabled: false, description: '' });
    await route.fulfill({ json: { id: 'flag-1', code: 'OPS_NEW_PANEL', nameFr: 'Nouveau panneau', owningModule: 'operations', status: 'DRAFT', evaluationStrategy: 'BOOLEAN', defaultEnabled: false } });
  });
  await page.route('**/api/v1/configuration/values', async (route) => {
    expect(route.request().postDataJSON()).toEqual({ definitionId: 'def-1', definitionVersionId: 'defv-1', environment: 'PROD', rawValue: 'PT45S', jsonValue: '', secretReference: '', effectiveFrom: '', effectiveTo: '', createdByActorId: 'actor-1' });
    await route.fulfill({ json: { id: 'value-1', definitionId: 'def-1', definitionVersionId: 'defv-1', environment: 'PROD', status: 'DRAFT', effectiveFrom: null, effectiveTo: null } });
  });
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('configuration-admin');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openWorkspace(page: Page) {
  await page.evaluate(() => {
    window.history.pushState({}, '', '/administration/configuration');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

test('HWEB-014-02 reads runtime configuration evidence and submits only published mutation contracts', async ({ page }) => {
  await mockConfiguration(page);
  await signIn(page);
  await openWorkspace(page);

  await expect(page.getByRole('heading', { name: 'Configuration administration' })).toBeVisible();
  await expect(page.getByText('telemetry.retention')).toBeVisible();
  await expect(page.getByText('FLAG_EXISTING')).toBeVisible();

  await page.getByLabel('Namespace ID').fill('ns-1');
  await page.getByLabel('Key').fill('ops.timeout');
  await page.getByLabel('French display name').fill('Délai opérations');
  await page.getByLabel('Value type').fill('DURATION');
  await page.getByLabel('Scoped').check();
  await page.getByLabel('Requires approval').check();
  await page.getByLabel('Default value').fill('PT30S');
  await page.getByRole('button', { name: 'Create definition' }).click();
  await expect(page.getByText(/Definition def-1 recorded with status DRAFT/)).toBeVisible();

  await page.getByLabel('Flag code').fill('OPS_NEW_PANEL');
  await page.getByLabel('French flag name').fill('Nouveau panneau');
  await page.getByLabel('Owning module').fill('operations');
  await page.getByRole('button', { name: 'Create feature flag' }).click();
  await expect(page.getByText(/Feature flag flag-1 recorded with status DRAFT/)).toBeVisible();

  await page.getByLabel('Definition ID').fill('def-1');
  await page.getByLabel('Definition version ID').fill('defv-1');
  await page.getByLabel('Environment').fill('PROD');
  await page.getByLabel('Raw value').fill('PT45S');
  await page.getByLabel('Created by actor ID').fill('actor-1');
  await page.getByRole('button', { name: 'Set configuration value' }).click();
  await expect(page.getByText(/Configuration value value-1 recorded with status DRAFT/)).toBeVisible();

  await expect(page.getByRole('button', { name: /toggle|delete|rollback|activate|deactivate/i })).toHaveCount(0);
});

test('HWEB-014-02 fails closed for mutations without exact route grants', async ({ page }) => {
  await mockConfiguration(page, ['workbench:resources:read']);
  await signIn(page);
  await openWorkspace(page);

  await expect(page.getByRole('button', { name: 'Create definition' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Create feature flag' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Set configuration value' })).toBeDisabled();
});
