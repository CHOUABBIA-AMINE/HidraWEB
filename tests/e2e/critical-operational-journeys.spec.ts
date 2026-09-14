import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/telemetry/points/{pointId}/readings', methods: ['GET'], module: 'telemetry', resource: 'points', action: 'read', permission: 'telemetry:points:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/telemetry/reference/reading-states', methods: ['GET'], module: 'telemetry', resource: 'reference', action: 'read', permission: 'telemetry:reference:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/monitoring/rules', methods: ['GET'], module: 'monitoring', resource: 'rules', action: 'read', permission: 'monitoring:rules:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/monitoring/deviations', methods: ['GET'], module: 'monitoring', resource: 'deviations', action: 'read', permission: 'monitoring:deviations:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/alarm/alarms', methods: ['GET'], module: 'alarm', resource: 'alarms', action: 'read', permission: 'alarm:alarms:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/alarm/alarms/acknowledgements', methods: ['POST'], module: 'alarm', resource: 'alarms', action: 'execute', permission: 'alarm:alarms:execute', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow', resource: 'tasks', action: 'read', permission: 'workflow:tasks:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workflow/instances/{id}', methods: ['GET'], module: 'workflow', resource: 'instances', action: 'read', permission: 'workflow:instances:read', enforcementStatus: 'backend-enforced' },
];

const effectivePermissions = routes.map((route) => route.permission);

const reading = {
  id: 'reading-1',
  pointId: 'PT-1',
  numericValue: 42.5,
  unitId: 'bar',
  qualityCodeId: 'GOOD',
  state: 'TRUSTED',
  sourceTimestamp: '2026-09-11T12:00:00Z',
};

const alarm = {
  id: 'alarm-1',
  alarmNumber: 'ALM-001',
  alarmTypeId: 'PRESSURE',
  severityId: 'SEV-CRITICAL',
  priorityId: 'P1',
  titleFr: 'Pression élevée',
  titleEn: 'High pressure',
  currentState: 'ACTIVE',
  raisedAt: '2026-09-11T10:00:00Z',
  firstDetectedAt: '2026-09-11T09:59:00Z',
  sourceType: 'MONITORING',
  sourceReferenceId: 'DEV-1',
  topologyAssetId: 'PIPE-1',
  topologyAssetCode: 'PL-001',
  topologyAssetName: 'Pipeline Nord',
  workflowInstanceId: 'instance-1',
  correlationId: 'corr-1',
};

const task = {
  id: 'task-1',
  instanceId: 'instance-1',
  stepId: 'review',
  status: 'OPEN',
  taskLabel: 'Validate pressure deviation',
  priorityId: 'HIGH',
  dueAt: '2026-09-12T08:00:00Z',
  assignedActorDisplayName: 'Operator A',
  slaStatus: 'NORMAL',
  updatedAt: '2026-09-11T10:30:00Z',
};

async function mockSecurity(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: {
      strategy: 'derived-route-permission-catalog',
      enforcement: 'backend-enforced by HidraRouteAuthorizationInterceptor',
      permissionFormat: '<module>:<resource>:<action>',
      routes,
    },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
}

async function mockOperations(page: Page) {
  await page.route('**/api/v1/telemetry/reference/reading-states', (route) => route.fulfill({ json: ['TRUSTED'] }));
  await page.route('**/api/v1/telemetry/reference/quality-codes', (route) => route.fulfill({ json: [{ id: 'GOOD', code: 'GOOD', translations: {}, active: true }] }));
  await page.route('**/api/v1/monitoring/rules?**', (route) => route.fulfill({
    json: {
      content: [{ id: 'rule-1', code: 'PRESSURE-HIGH', status: 'ACTIVE', ruleType: 'THRESHOLD', topologyAssetCode: 'FAC-1' }],
      page: 0,
      size: 50,
      totalElements: 1,
      totalPages: 1,
      hasNext: false,
    },
  }));
  await page.route('**/api/v1/monitoring/deviations?**', (route) => route.fulfill({
    json: {
      content: [{ id: 'dev-1', severity: 'HIGH', status: 'OPEN', topologyAssetCode: 'FAC-1', reasonCode: 'PRESSURE_HIGH', detectedAt: '2026-09-11T12:01:00Z' }],
      page: 0,
      size: 50,
      totalElements: 1,
      totalPages: 1,
      hasNext: false,
    },
  }));
  await page.route('**/api/v1/telemetry/points/PT-1/readings/latest', (route) => route.fulfill({ json: reading }));
  await page.route('**/api/v1/telemetry/points/PT-1/readings?**', (route) => route.fulfill({
    json: { content: [reading], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false },
  }));
  await page.route('**/api/v1/telemetry/points/PT-1/trend?**', (route) => route.fulfill({
    json: [reading, { ...reading, id: 'reading-2', numericValue: 43.1, sourceTimestamp: '2026-09-11T12:02:00Z' }],
  }));
}

async function mockAlarm(page: Page) {
  await page.route('**/api/v1/alarm/alarms?**', (route) => route.fulfill({
    json: { content: [alarm], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false },
  }));
  await page.route('**/api/v1/alarm/alarms/alarm-1/shelvings', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/v1/alarm/alarms/alarm-1', (route) => route.fulfill({ json: alarm }));
  await page.route('**/api/v1/alarm/alarms/acknowledgements', async (route) => {
    expect(route.request().postDataJSON()).toEqual({ alarmId: 'alarm-1' });
    await route.fulfill({ json: 'ack-1' });
  });
}

async function mockWorkflow(page: Page) {
  await page.route('**/api/v1/workflow/tasks?**', (route) => route.fulfill({
    json: { content: [task], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false },
  }));
  await page.route('**/api/v1/workflow/tasks/task-1/available-actions', (route) => route.fulfill({ json: [
    {
      transitionId: 'tr-1',
      decision: 'APPROVE',
      fromStepId: 'review',
      toStepId: 'approved',
      reasonRequired: false,
      commentRequired: true,
      requiredPermissionCode: 'workflow:approve:execute',
      permitted: true,
    },
  ] }));
  await page.route('**/api/v1/workflow/tasks/task-1', (route) => route.fulfill({ json: task }));
  await page.route('**/api/v1/workflow/instances/instance-1/timeline', (route) => route.fulfill({
    json: [{ id: 'tl-1', instanceId: 'instance-1', taskId: 'task-1', actionType: 'ASSIGN', actorDisplayName: 'Supervisor', sequence: 1, occurredAt: '2026-09-11T10:00:00Z' }],
  }));
  await page.route('**/api/v1/workflow/instances/instance-1', (route) => route.fulfill({
    json: { id: 'instance-1', status: 'STARTED', currentStepId: 'review', targetId: 'DEV-1', targetLabel: 'Pressure deviation DEV-1' },
  }));
  await page.route('**/api/v1/workflow/tasks/task-1/transitions/tr-1/execute', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      expectedTaskUpdatedAt: '2026-09-11T10:30:00Z',
      commentText: 'Validated against operating evidence.',
    });
    await route.fulfill({
      json: {
        actionId: 'act-1',
        taskId: 'task-1',
        taskStatus: 'APPROVED',
        instanceId: 'instance-1',
        instanceStatus: 'COMPLETED',
        transitionId: 'tr-1',
        decision: 'APPROVE',
        currentStepId: 'approved',
        executedAt: '2026-09-11T10:31:00Z',
      },
    });
  });
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function clickEnabledNavigation(page: Page, name: string) {
  const candidates = page.getByRole('button', { name }).filter({ visible: true });
  const count = await candidates.count();
  for (let index = 0; index < count; index += 1) {
    const candidate = candidates.nth(index);
    if (await candidate.isEnabled()) {
      await candidate.click();
      return;
    }
  }
  throw new Error(`No enabled navigation button found for ${name}`);
}

test('HWEB-015-09 protects the monitor-to-response-to-workflow operator journey', async ({ page }) => {
  await mockSecurity(page);
  await mockOperations(page);
  await mockAlarm(page);
  await mockWorkflow(page);
  await signIn(page);

  await clickEnabledNavigation(page, 'Opérations');
  await expect(page).toHaveURL(/\/operations$/);
  await expect(page.getByText('PRESSURE_HIGH')).toBeVisible();
  await page.getByLabel('Identifiant du point de télémétrie').fill('PT-1');
  await page.getByRole('button', { name: 'Charger le point' }).click();
  await expect(page.getByText('42.5').first()).toBeVisible();
  await expect(page.getByText('TRUSTED').first()).toBeVisible();

  await clickEnabledNavigation(page, 'Alarmes');
  await expect(page).toHaveURL(/\/alarms$/);
  await expect(page.getByText('Pression élevée')).toBeVisible();
  await page.getByRole('button', { name: 'Ouvrir' }).click();
  await expect(page.getByText('Pipeline Nord', { exact: true }).last()).toBeVisible();
  await expect(page.getByText(/dérive l’identité de l’acteur/)).toBeVisible();
  await expect(page.getByLabel('Référence acteur')).toHaveCount(0);
  await page.getByRole('button', { name: 'Acquitter' }).click();
  await expect(page.getByText('Opération enregistrée par HidraAPI.')).toBeVisible();

  await clickEnabledNavigation(page, 'Mes tâches');
  await expect(page).toHaveURL(/\/work\/tasks$/);
  await expect(page.getByText('Validate pressure deviation')).toBeVisible();
  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByText('Pressure deviation DEV-1')).toBeVisible();
  await page.getByRole('button', { name: 'APPROVE' }).click();
  await page.getByLabel('comment *').fill('Validated against operating evidence.');
  await page.getByRole('button', { name: 'Action: APPROVE' }).click();
  await expect(page.getByText('APPROVE · APPROVED')).toBeVisible();
});
