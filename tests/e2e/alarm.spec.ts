import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/alarm/alarms', methods: ['GET'], module: 'alarm', resource: 'alarms', action: 'read', permission: 'alarm:alarms:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/alarm/alarms/acknowledgements', methods: ['POST'], module: 'alarm', resource: 'alarms', action: 'execute', permission: 'alarm:alarms:execute', enforcementStatus: 'backend-enforced' },
];
const effectivePermissions = ['alarm:alarms:read', 'alarm:alarms:execute'];
const alarm = {
  id: 'alarm-1', alarmNumber: 'ALM-001', alarmTypeId: 'PRESSURE', severityId: 'SEV-CRITICAL', priorityId: 'P1',
  titleFr: 'Pression élevée', titleEn: 'High pressure', currentState: 'ACTIVE', raisedAt: '2026-09-11T10:00:00Z',
  firstDetectedAt: '2026-09-11T09:59:00Z', sourceType: 'MONITORING', sourceReferenceId: 'DEV-1',
  topologyAssetId: 'PIPE-1', topologyAssetCode: 'PL-001', topologyAssetName: 'Pipeline Nord', workflowInstanceId: 'wf-1', correlationId: 'corr-1',
};

async function mockAlarm(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/alarm/alarms?**', (route) => route.fulfill({ json: { content: [alarm], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/alarm/alarms/alarm-1/shelvings', (route) => route.fulfill({ json: [{ id: 'shelf-1', alarmId: 'alarm-1', shelvingReasonId: 'MAINT', reasonText: 'Inspection', shelvedByActorId: 'actor-1', shelvedAt: '2026-09-11T08:00:00Z', shelvedUntil: '2026-09-11T12:00:00Z', status: 'ACTIVE' }] }));
  await page.route('**/api/v1/alarm/alarms/alarm-1', (route) => route.fulfill({ json: alarm }));
  await page.route('**/api/v1/alarm/alarms/acknowledgements', async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({ alarmId: 'alarm-1', acknowledgedByActorId: 'actor-1' });
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({ json: 'ack-1' });
  });
  await page.route('**/api/v1/alarm/alarms/alarm-1/shelvings/shelf-1/unshelve', (route) => route.fulfill({ json: 'unshelve-1' }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-008 presents backend-governed alarm response without invented suppression or realtime semantics', async ({ page }) => {
  await mockAlarm(page);
  await signIn(page);

  await page.getByRole('button', { name: 'Alarmes' }).click();
  await expect(page).toHaveURL(/\/alarms$/);
  await expect(page.getByRole('heading', { name: 'Console des alarmes' })).toBeVisible();
  await expect(page.getByText('Pression élevée')).toBeVisible();
  await expect(page.getByText('SEV-CRITICAL')).toBeVisible();
  await expect(page.getByText(/Aucune opération de suppression/)).toBeVisible();
  await expect(page.getByText(/événements temps réel métier/)).toBeVisible();

  await page.getByRole('button', { name: 'Ouvrir' }).click();
  await expect(page.getByText('Pipeline Nord', { exact: true }).last()).toBeVisible();
  await expect(page.getByText('MAINT')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retirer de l’étagère' })).toBeVisible();

  await page.getByLabel('Référence acteur').first().fill('actor-1');
  await page.getByRole('button', { name: 'Acquitter' }).click();
  await expect(page.getByRole('button', { name: 'Clôturer' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Mettre en étagère' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Retirer de l’étagère' })).toBeDisabled();
  await expect(page.getByText('Opération enregistrée par HidraAPI.')).toBeVisible();
});
