import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
];

const descriptors = [
  ['custody-transfer-point', 'CustodyTransferPointJpaEntity'],
  ['custody-measurement-snapshot', 'CustodyMeasurementSnapshotJpaEntity'],
  ['custody-agreement-party', 'CustodyAgreementPartyJpaEntity'],
].map(([resource, javaType]) => ({
  module: 'custody', resource, entityName: javaType.replace('JpaEntity', ''),
  javaType: `dz.sh.hidra.modules.custody.infrastructure.persistence.entity.${javaType}`,
  tableName: `hidra_${resource.replaceAll('-', '_')}`, idField: 'id', searchableFields: [],
  listEndpoint: `/api/v1/workbench/custody/${resource}`,
  detailEndpoint: `/api/v1/workbench/custody/${resource}/{id}`,
  searchEndpoint: `/api/v1/workbench/custody/${resource}/search`,
}));

const partyDescriptor = {
  module: 'party',
  resource: 'party',
  entityName: 'Party',
  javaType: 'dz.sh.hidra.modules.party.infrastructure.persistence.entity.PartyJpaEntity',
  tableName: 'hidra_party_party',
  idField: 'id',
  searchableFields: ['code', 'legalName'],
  listEndpoint: '/api/v1/workbench/party/party',
  detailEndpoint: '/api/v1/workbench/party/party/{id}',
  searchEndpoint: '/api/v1/workbench/party/party/search',
};

async function mockReferenceContext(
  page: Page,
  options: { allowRead?: boolean; partyDetailStatus?: number } = {},
) {
  const { allowRead = true, partyDetailStatus = 200 } = options;
  const effectivePermissions = allowRead ? ['workbench:resources:read'] : [];
  let foreignCollectionCalls = 0;
  let partyCollectionCalls = 0;
  let partyDetailCalls = 0;

  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/workbench/custody/resources', (route) => route.fulfill({ json: descriptors }));

  for (const module of ['topology', 'telemetry']) {
    await page.route(`**/api/v1/workbench/${module}/**`, (route) => {
      foreignCollectionCalls += 1;
      return route.fulfill({ status: 500, json: { message: 'Foreign collection scan is forbidden in HWEB-012' } });
    });
  }

  await page.route('**/api/v1/workbench/party/party?**', (route) => {
    partyCollectionCalls += 1;
    return route.fulfill({ status: 500, json: { message: 'Party collection list scan is forbidden in HWEB-012-06' } });
  });
  await page.route('**/api/v1/workbench/party/party/search', (route) => {
    partyCollectionCalls += 1;
    return route.fulfill({ status: 500, json: { message: 'Party collection search is forbidden in HWEB-012-06' } });
  });
  await page.route('**/api/v1/workbench/party/resources', (route) => route.fulfill({ json: [partyDescriptor] }));
  await page.route('**/api/v1/workbench/party/party/party-8', (route) => {
    partyDetailCalls += 1;
    if (partyDetailStatus === 403) {
      return route.fulfill({ status: 403, json: { message: 'Forbidden' } });
    }
    return route.fulfill({
      json: {
        module: 'party',
        resource: 'party',
        id: 'party-8',
        attributes: {
          code: 'P-008',
          legalName: 'Authoritative Counterparty Legal Name',
          tradeName: 'Counterparty Trade',
          shortName: 'Counterparty',
          countryCode: 'DZA',
          status: 'ACTIVE',
          primaryRoleCodeSnapshot: 'SHIPPER',
        },
      },
    });
  });

  await page.route('**/api/v1/workbench/custody/custody-transfer-point?**', (route) => route.fulfill({
    json: {
      module: 'custody', resource: 'custody-transfer-point', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{
        module: 'custody', resource: 'custody-transfer-point', id: 'tp-1',
        attributes: {
          code: 'CTP-001', topologyAssetTypeCode: 'PIPELINE_SEGMENT', topologyAssetId: 'asset-17',
          topologyAssetCodeSnapshot: 'PL-017', topologyAssetNameSnapshot: 'Pipeline Segment 17', measurementLocationId: 'ml-9',
        },
      }],
    },
  }));
  await page.route('**/api/v1/workbench/custody/custody-transfer-point/tp-1', (route) => route.fulfill({
    json: { module: 'custody', resource: 'custody-transfer-point', id: 'tp-1', attributes: { topologyAssetId: 'asset-17', source: 'custody-snapshot' } },
  }));

  await page.route('**/api/v1/workbench/custody/custody-measurement-snapshot?**', (route) => route.fulfill({
    json: {
      module: 'custody', resource: 'custody-measurement-snapshot', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{
        module: 'custody', resource: 'custody-measurement-snapshot', id: 'ms-1',
        attributes: {
          telemetryReadingReferenceId: 'reading-5', telemetryPointReferenceId: 'point-2', observedValue: 101.25,
          observedUnitId: 'BAR', standardValue: 100.75, standardUnitId: 'BAR', measuredAt: '2026-09-13T06:00:00Z',
          acceptedForCustody: true, qualityFlagSnapshot: 'VALIDATED',
        },
      }],
    },
  }));
  await page.route('**/api/v1/workbench/custody/custody-measurement-snapshot/ms-1', (route) => route.fulfill({
    json: { module: 'custody', resource: 'custody-measurement-snapshot', id: 'ms-1', attributes: { telemetryReadingReferenceId: 'reading-5', acceptedForCustody: true } },
  }));

  await page.route('**/api/v1/workbench/custody/custody-agreement-party?**', (route) => route.fulfill({
    json: {
      module: 'custody', resource: 'custody-agreement-party', page: 0, size: 25, totalElements: 1, totalPages: 1,
      items: [{
        module: 'custody', resource: 'custody-agreement-party', id: 'cap-1',
        attributes: {
          agreementId: 'agr-1', partyId: 'party-8', partyCodeSnapshot: 'CP-008', partyNameSnapshot: 'Counterparty Snapshot',
          partyRoleCodeSnapshot: 'SHIPPER', ownershipSharePercent: 37.5,
        },
      }],
    },
  }));
  await page.route('**/api/v1/workbench/custody/custody-agreement-party/cap-1', (route) => route.fulfill({
    json: { module: 'custody', resource: 'custody-agreement-party', id: 'cap-1', attributes: { partyId: 'party-8', partyNameSnapshot: 'Counterparty Snapshot' } },
  }));

  return {
    foreignCollectionCalls: () => foreignCollectionCalls,
    partyCollectionCalls: () => partyCollectionCalls,
    partyDetailCalls: () => partyDetailCalls,
  };
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('custody-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openReferenceContext(page: Page) {
  await page.evaluate(() => {
    window.history.pushState({}, '', '/custody');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.getByRole('tab', { name: 'Reference context' }).click();
}

test('HWEB-012-05 renders topology, telemetry, and party context only from custody-owned references', async ({ page }) => {
  const calls = await mockReferenceContext(page);
  await signIn(page);
  await openReferenceContext(page);

  await expect(page.getByRole('heading', { name: 'Custody reference context' })).toBeVisible();
  await expect(page.getByText('PIPELINE_SEGMENT')).toBeVisible();
  await expect(page.getByText('asset-17')).toBeVisible();
  await expect(page.getByText('Pipeline Segment 17')).toBeVisible();
  await expect(page.getByText('reading-5')).toBeVisible();
  await expect(page.getByText('point-2')).toBeVisible();
  await expect(page.getByText('VALIDATED')).toBeVisible();
  await expect(page.getByText('party-8')).toBeVisible();
  await expect(page.getByText('Counterparty Snapshot')).toBeVisible();
  await expect(page.getByText('SHIPPER')).toBeVisible();

  await page.getByRole('button', { name: 'Open' }).first().click();
  await expect(page.locator('pre').filter({ hasText: 'custody-snapshot' })).toBeVisible();

  expect(calls.foreignCollectionCalls()).toBe(0);
  expect(calls.partyCollectionCalls()).toBe(0);
  expect(calls.partyDetailCalls()).toBe(0);
  await expect(page.getByRole('button', { name: /refresh topology/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /accept telemetry/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /update party/i })).toHaveCount(0);
});

test('HWEB-012-05 fails closed when custody workbench read grant is absent', async ({ page }) => {
  await mockReferenceContext(page, { allowRead: false });
  await signIn(page);
  await openReferenceContext(page);

  await expect(page.getByText('Your current HidraAPI grants do not allow custody workbench reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Custody reference context' })).toHaveCount(0);
  await expect(page.getByText('Pipeline Segment 17')).toHaveCount(0);
});

test('HWEB-012-06 loads party master detail only from an explicit custody partyId', async ({ page }) => {
  const calls = await mockReferenceContext(page);
  await signIn(page);
  await openReferenceContext(page);

  await page.getByRole('button', { name: 'Open' }).nth(2).click();

  await expect(page.getByRole('heading', { name: 'Party master context' })).toBeVisible();
  await expect(page.getByText('Authoritative Counterparty Legal Name')).toBeVisible();
  await expect(page.getByText('DZA')).toBeVisible();
  await expect(page.getByText('ACTIVE')).toBeVisible();
  expect(calls.partyDetailCalls()).toBe(1);
  expect(calls.partyCollectionCalls()).toBe(0);
  expect(calls.foreignCollectionCalls()).toBe(0);
  await expect(page.getByRole('button', { name: /create party/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /assign role/i })).toHaveCount(0);
});

test('HWEB-012-06 treats backend party detail 403 as authoritative', async ({ page }) => {
  const calls = await mockReferenceContext(page, { partyDetailStatus: 403 });
  await signIn(page);
  await openReferenceContext(page);

  await page.getByRole('button', { name: 'Open' }).nth(2).click();

  await expect(page.getByText('HidraAPI refused access to party master.')).toBeVisible();
  expect(calls.partyDetailCalls()).toBe(1);
  expect(calls.partyCollectionCalls()).toBe(0);
});
