import { expect, test, type Page } from '@playwright/test';

const routes = [
  {
    route: '/api/v1/topology/map/layers', methods: ['GET'], module: 'topology', resource: 'map', action: 'read',
    permission: 'topology:map:read', enforcementStatus: 'backend-enforced',
  },
  {
    route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow', resource: 'tasks', action: 'read',
    permission: 'workflow:tasks:read', enforcementStatus: 'backend-enforced',
  },
  { route: '/api/v1/workbench/modules', methods: ['GET'], module: 'modules', resource: 'resources', action: 'read', permission: 'modules:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/resources', methods: ['GET'], module: 'dynamic-module', resource: 'resources', action: 'read', permission: 'dynamic-module:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'dynamic-module', resource: 'dynamic-resource', action: 'read', permission: 'dynamic-module:dynamic-resource:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'dynamic-module', resource: 'dynamic-resource', action: 'read', permission: 'dynamic-module:dynamic-resource:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/search', methods: ['POST'], module: 'dynamic-module', resource: 'dynamic-resource', action: 'search', permission: 'dynamic-module:dynamic-resource:search', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/identity/users', methods: ['POST'], module: 'identity', resource: 'users', action: 'execute', permission: 'identity:users:execute', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/identity/permissions/evaluations', methods: ['POST'], module: 'identity', resource: 'permissions', action: 'execute', permission: 'identity:permissions:execute', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/organization/units', methods: ['POST'], module: 'organization', resource: 'units', action: 'execute', permission: 'organization:units:execute', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/organization/employees', methods: ['POST'], module: 'organization', resource: 'employees', action: 'execute', permission: 'organization:employees:execute', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/organization/employees/assignments', methods: ['POST'], module: 'organization', resource: 'employees', action: 'execute', permission: 'organization:employees:execute', enforcementStatus: 'backend-enforced' },
];

const effectivePermissions = [
  'topology:map:read',
  'modules:resources:read',
  'dynamic-module:resources:read',
  'dynamic-module:dynamic-resource:read',
  'dynamic-module:dynamic-resource:search',
  'identity:users:execute',
  'identity:permissions:execute',
  'organization:units:execute',
  'organization:employees:execute',
];

const catalog = {
  strategy: 'derived-route-permission-catalog',
  enforcement: 'backend-enforced by HidraRouteAuthorizationInterceptor',
  permissionFormat: '<module>:<resource>:<action>',
  bootstrapAdminBypass: 'ROLE_HIDRA_ADMIN',
  routes,
};

const descriptor = {
  module: 'alarm', resource: 'alarm-events', entityName: 'AlarmEventJpaEntity', javaType: 'dz.sh.hidra.modules.alarm.infrastructure.AlarmEventJpaEntity',
  tableName: 'hidra_alarm_event', idField: 'id', searchableFields: ['message', 'severity'],
  listEndpoint: '/api/v1/workbench/alarm/alarm-events', detailEndpoint: '/api/v1/workbench/alarm/alarm-events/{id}', searchEndpoint: '/api/v1/workbench/alarm/alarm-events/search',
};
const alarmRecord = { module: 'alarm', resource: 'alarm-events', id: '1', attributes: { id: '1', message: 'High pressure', severity: 'HIGH' } };

const identityDescriptors = [
  { module: 'identity', resource: 'users', entityName: 'UserJpaEntity', javaType: 'dz.sh.hidra.modules.identity.infrastructure.persistence.entity.UserJpaEntity', tableName: 'hidra_identity_user', idField: 'id', searchableFields: ['username', 'emailAddress', 'displayName'], listEndpoint: '/api/v1/workbench/identity/users', detailEndpoint: '/api/v1/workbench/identity/users/{id}', searchEndpoint: '/api/v1/workbench/identity/users/search' },
  { module: 'identity', resource: 'roles', entityName: 'RoleJpaEntity', javaType: 'dz.sh.hidra.modules.identity.infrastructure.persistence.entity.RoleJpaEntity', tableName: 'hidra_identity_role', idField: 'id', searchableFields: ['code', 'name'], listEndpoint: '/api/v1/workbench/identity/roles', detailEndpoint: '/api/v1/workbench/identity/roles/{id}', searchEndpoint: '/api/v1/workbench/identity/roles/search' },
  { module: 'identity', resource: 'permissions', entityName: 'PermissionJpaEntity', javaType: 'dz.sh.hidra.modules.identity.infrastructure.persistence.entity.PermissionJpaEntity', tableName: 'hidra_identity_permission', idField: 'id', searchableFields: ['code', 'name'], listEndpoint: '/api/v1/workbench/identity/permissions', detailEndpoint: '/api/v1/workbench/identity/permissions/{id}', searchEndpoint: '/api/v1/workbench/identity/permissions/search' },
];
const identityUser = { module: 'identity', resource: 'users', id: 'u-1', attributes: { id: 'u-1', username: 'aoperator', displayName: 'Abir Operator', emailAddress: 'operator@hidra.local', status: 'ACTIVE' } };

const organizationDescriptors = [
  { module: 'organization', resource: 'organization-units', entityName: 'OrganizationUnitJpaEntity', javaType: 'dz.sh.hidra.modules.organization.infrastructure.persistence.entity.OrganizationUnitJpaEntity', tableName: 'hidra_org_unit', idField: 'id', searchableFields: ['code', 'nameFr', 'nameEn'], listEndpoint: '/api/v1/workbench/organization/organization-units', detailEndpoint: '/api/v1/workbench/organization/organization-units/{id}', searchEndpoint: '/api/v1/workbench/organization/organization-units/search' },
  { module: 'organization', resource: 'employees', entityName: 'EmployeeJpaEntity', javaType: 'dz.sh.hidra.modules.organization.infrastructure.persistence.entity.EmployeeJpaEntity', tableName: 'hidra_org_employee', idField: 'id', searchableFields: ['employeeNumber', 'displayNameLt', 'emailAddress'], listEndpoint: '/api/v1/workbench/organization/employees', detailEndpoint: '/api/v1/workbench/organization/employees/{id}', searchEndpoint: '/api/v1/workbench/organization/employees/search' },
  { module: 'organization', resource: 'employee-assignments', entityName: 'EmployeeAssignmentJpaEntity', javaType: 'dz.sh.hidra.modules.organization.infrastructure.persistence.entity.EmployeeAssignmentJpaEntity', tableName: 'hidra_org_employee_assignment', idField: 'id', searchableFields: ['employeeId', 'organizationUnitId'], listEndpoint: '/api/v1/workbench/organization/employee-assignments', detailEndpoint: '/api/v1/workbench/organization/employee-assignments/{id}', searchEndpoint: '/api/v1/workbench/organization/employee-assignments/search' },
];
const organizationUnit = { module: 'organization', resource: 'organization-units', id: 'ou-1', attributes: { id: 'ou-1', code: 'TRC', nameFr: 'Direction Transport', status: 'ACTIVE' } };

async function mockPermissions(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: catalog }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
}

async function mockWorkbench(page: Page) {
  await page.route('**/api/v1/workbench/modules', (route) => route.fulfill({ json: ['alarm'] }));
  await page.route('**/api/v1/workbench/alarm/resources', (route) => route.fulfill({ json: [descriptor] }));
  await page.route('**/api/v1/workbench/alarm/alarm-events/1', (route) => route.fulfill({ json: alarmRecord }));
  await page.route('**/api/v1/workbench/alarm/alarm-events/search', async (route) => {
    const request = route.request().postDataJSON() as { query?: string };
    await route.fulfill({
      json: {
        module: 'alarm', resource: 'alarm-events', page: 0, size: 50, totalElements: 1, totalPages: 1,
        items: [{ module: 'alarm', resource: 'alarm-events', id: '2', attributes: { id: '2', message: `Filtered ${request.query ?? ''}`, severity: 'HIGH' } }],
      },
    });
  });
  await page.route('**/api/v1/workbench/alarm/alarm-events?**', (route) => route.fulfill({
    json: { module: 'alarm', resource: 'alarm-events', page: 0, size: 50, totalElements: 1, totalPages: 1, items: [alarmRecord] },
  }));
}

async function mockIdentityOrganization(page: Page) {
  await page.route('**/api/v1/workbench/identity/resources', (route) => route.fulfill({ json: identityDescriptors }));
  await page.route('**/api/v1/workbench/identity/users?**', (route) => route.fulfill({
    json: { module: 'identity', resource: 'users', page: 0, size: 50, totalElements: 1, totalPages: 1, items: [identityUser] },
  }));
  await page.route('**/api/v1/workbench/organization/resources', (route) => route.fulfill({ json: organizationDescriptors }));
  await page.route('**/api/v1/workbench/organization/organization-units?**', (route) => route.fulfill({
    json: { module: 'organization', resource: 'organization-units', page: 0, size: 50, totalElements: 1, totalPages: 1, items: [organizationUnit] },
  }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openWorkbench(page: Page) {
  await page.getByRole('button', { name: 'Ouvrir l’atelier opérationnel' }).click();
  await expect(page).toHaveURL(/\/workbench$/);
}

test('HWEB-002 authenticates and builds a capability-filtered accessible shell', async ({ page }) => {
  await mockPermissions(page);
  await signIn(page);

  await expect(page.getByRole('button', { name: 'Réseau' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Mes tâches' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Organisation' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Identité & accès' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Planification' })).toHaveCount(0);

  const toggle = page.getByRole('button', { name: 'Réduire la navigation' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Développer la navigation' })).toHaveAttribute('aria-expanded', 'false');
});

test('HWEB-002 keeps a rejected Basic authentication request on the 401 sign-in state', async ({ page }) => {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ status: 401, json: { status: 401, title: 'Unauthorized' } }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: catalog }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ status: 401, json: { status: 401, title: 'Unauthorized' } }));
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('wrong');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('alert')).toContainText('Unauthorized');
  await expect(page).toHaveURL(/\/login$/);
});

test('HWEB-002 renders the global 403 state when HidraAPI refuses permission metadata', async ({ page }) => {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ status: 403, json: { status: 403, title: 'Forbidden' } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Accès refusé' })).toBeVisible();
});

test('HWEB-002 renders the authenticated 404 state inside the shell', async ({ page }) => {
  await mockPermissions(page);
  await signIn(page);
  await page.evaluate(() => {
    window.history.pushState({}, '', '/unknown-hidra-route');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
  await expect(page.getByText('Hidra', { exact: true })).toBeVisible();
});

test('HWEB-003 discovers, lists, searches and inspects a generic resource', async ({ page }) => {
  await mockPermissions(page);
  await mockWorkbench(page);
  await signIn(page);
  await openWorkbench(page);

  await expect(page.getByRole('heading', { name: 'Atelier opérationnel' })).toBeVisible();
  await expect(page.getByText('High pressure')).toBeVisible();

  await page.getByRole('button', { name: 'Inspecter' }).click();
  await expect(page.getByRole('heading', { name: 'alarm-events · 1' })).toBeVisible();
  await expect(page.getByText('HIGH').last()).toBeVisible();
  await page.getByRole('button', { name: 'Fermer le panneau contextuel' }).click();

  await page.getByLabel('Recherche').fill('pressure');
  await page.getByRole('button', { name: 'Recherche avancée' }).click();
  await page.getByRole('button', { name: 'Appliquer la recherche avancée' }).click();
  await expect(page.getByText('Filtered pressure')).toBeVisible();
});

test('HWEB-003 renders backend 403 from module discovery', async ({ page }) => {
  await mockPermissions(page);
  await page.route('**/api/v1/workbench/modules', (route) => route.fulfill({ status: 403, json: { status: 403, title: 'Forbidden' } }));
  await signIn(page);
  await openWorkbench(page);
  await expect(page.getByText('Accès refusé')).toBeVisible();
});

test('HWEB-004 exposes backend-supported identity and organization context workspaces', async ({ page }) => {
  await mockPermissions(page);
  await mockIdentityOrganization(page);
  await signIn(page);

  await page.getByRole('button', { name: 'Identité & accès' }).click();
  await expect(page).toHaveURL(/\/administration\/users$/);
  await expect(page.getByRole('heading', { name: 'Identité & accès' })).toBeVisible();
  await expect(page.getByText('Abir Operator')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Créer un utilisateur' })).toBeEnabled();

  await page.getByRole('button', { name: 'Organisation' }).click();
  await expect(page).toHaveURL(/\/administration\/organization$/);
  await expect(page.getByRole('heading', { name: 'Organisation' })).toBeVisible();
  await expect(page.getByText('Direction Transport')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Créer une unité' })).toBeEnabled();
});

test('HWEB-004 surfaces backend 403 when an identity mutation is refused', async ({ page }) => {
  await mockPermissions(page);
  await mockIdentityOrganization(page);
  await page.route('**/api/v1/identity/users', (route) => route.fulfill({ status: 403, json: { status: 403, title: 'Forbidden' } }));
  await signIn(page);

  await page.getByRole('button', { name: 'Identité & accès' }).click();
  await page.getByLabel('Nom d’utilisateur').fill('new-operator');
  await page.getByRole('button', { name: 'Créer un utilisateur' }).click();
  await expect(page.getByText(/Forbidden/)).toBeVisible();
});
