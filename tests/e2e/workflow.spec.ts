import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow', resource: 'tasks', action: 'read', permission: 'workflow:tasks:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workflow/instances/{id}', methods: ['GET'], module: 'workflow', resource: 'instances', action: 'read', permission: 'workflow:instances:read', enforcementStatus: 'backend-enforced' },
];

const effectivePermissions = ['workflow:tasks:read', 'workflow:instances:read'];
const task = { id: 'task-1', instanceId: 'instance-1', stepId: 'review', status: 'OPEN', taskLabel: 'Validate pressure deviation', priorityId: 'HIGH', dueAt: '2026-09-12T08:00:00Z', assignedActorDisplayName: 'Operator A', slaStatus: 'NORMAL', updatedAt: '2026-09-11T10:30:00Z' };

async function mockWorkflow(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/workflow/tasks?**', (route) => route.fulfill({ json: { content: [task], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/workflow/tasks/task-1/available-actions', (route) => route.fulfill({ json: [
    { transitionId: 'tr-1', decision: 'APPROVE', fromStepId: 'review', toStepId: 'approved', reasonRequired: false, commentRequired: true, requiredPermissionCode: 'workflow:approve:execute', permitted: true },
    { transitionId: 'tr-2', decision: 'REJECT', fromStepId: 'review', toStepId: 'rejected', reasonRequired: true, commentRequired: false, requiredPermissionCode: 'workflow:reject:execute', permitted: false },
  ] }));
  await page.route('**/api/v1/workflow/tasks/task-1', (route) => route.fulfill({ json: task }));
  await page.route('**/api/v1/workflow/instances/instance-1/timeline', (route) => route.fulfill({ json: [{ id: 'tl-1', instanceId: 'instance-1', taskId: 'task-1', actionType: 'ASSIGN', actorDisplayName: 'Supervisor', sequence: 1, occurredAt: '2026-09-11T10:00:00Z' }] }));
  await page.route('**/api/v1/workflow/instances/instance-1', (route) => route.fulfill({ json: { id: 'instance-1', status: 'STARTED', currentStepId: 'review', targetId: 'DEV-1', targetLabel: 'Pressure deviation DEV-1' } }));
  await page.route('**/api/v1/workflow/tasks/task-1/transitions/tr-1/execute', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({
      expectedTaskUpdatedAt: '2026-09-11T10:30:00Z',
      commentText: 'Validated against operating evidence.',
    });
    await route.fulfill({ json: { actionId: 'act-1', taskId: 'task-1', taskStatus: 'APPROVED', instanceId: 'instance-1', instanceStatus: 'COMPLETED', transitionId: 'tr-1', decision: 'APPROVE', currentStepId: 'approved', executedAt: '2026-09-11T10:31:00Z' } });
  });
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-007 executes only a backend-permitted workflow transition with the task concurrency token', async ({ page }) => {
  await mockWorkflow(page);
  await signIn(page);

  const taskNavigation = page.getByRole('button', { name: 'Mes tâches' }).filter({ visible: true });
  const count = await taskNavigation.count();
  let clicked = false;
  for (let index = 0; index < count; index += 1) {
    const candidate = taskNavigation.nth(index);
    if (await candidate.isEnabled()) {
      await candidate.click();
      clicked = true;
      break;
    }
  }
  expect(clicked).toBe(true);

  await expect(page).toHaveURL(/\/work\/tasks$/);
  await expect(page.getByRole('heading', { name: 'Mes tâches' })).toBeVisible();
  await expect(page.getByText('Validate pressure deviation')).toBeVisible();
  await page.getByRole('button', { name: 'Open' }).click();

  await expect(page.getByText('Pressure deviation DEV-1')).toBeVisible();
  await expect(page.getByText('Supervisor')).toBeVisible();
  await expect(page.getByRole('button', { name: 'REJECT' })).toHaveCount(0);

  await page.getByRole('button', { name: 'APPROVE' }).click();
  await page.getByLabel('comment *').fill('Validated against operating evidence.');
  await page.getByRole('button', { name: 'Action: APPROVE' }).click();
  await expect(page.getByText('APPROVE · APPROVED')).toBeVisible();
});
