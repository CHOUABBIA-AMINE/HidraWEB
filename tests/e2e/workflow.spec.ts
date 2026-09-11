import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow', resource: 'tasks', action: 'read', permission: 'workflow:tasks:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workflow/instances/{id}', methods: ['GET'], module: 'workflow', resource: 'instances', action: 'read', permission: 'workflow:instances:read', enforcementStatus: 'backend-enforced' },
];

const effectivePermissions = ['workflow:tasks:read', 'workflow:instances:read'];
const task = { id: 'task-1', instanceId: 'instance-1', stepId: 'review', status: 'OPEN', taskLabel: 'Validate pressure deviation', priorityId: 'HIGH', dueAt: '2026-09-12T08:00:00Z', assignedActorDisplayName: 'Operator A', slaStatus: 'NORMAL' };

async function mockWorkflow(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/workflow/tasks?**', (route) => route.fulfill({ json: { content: [task], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/workflow/tasks/task-1/available-actions', (route) => route.fulfill({ json: [{ transitionId: 'tr-1', decision: 'APPROVE', fromStepId: 'review', toStepId: 'approved', reasonRequired: false, commentRequired: true, requiredPermissionCode: 'workflow:approve:execute', permitted: true }] }));
  await page.route('**/api/v1/workflow/tasks/task-1', (route) => route.fulfill({ json: task }));
  await page.route('**/api/v1/workflow/instances/instance-1/timeline', (route) => route.fulfill({ json: [{ id: 'tl-1', instanceId: 'instance-1', taskId: 'task-1', actionType: 'ASSIGN', actorDisplayName: 'Supervisor', sequence: 1, occurredAt: '2026-09-11T10:00:00Z' }] }));
  await page.route('**/api/v1/workflow/instances/instance-1', (route) => route.fulfill({ json: { id: 'instance-1', status: 'STARTED', currentStepId: 'review', targetId: 'DEV-1', targetLabel: 'Pressure deviation DEV-1' } }));
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-007 presents backend-authoritative workflow tasks and available actions without fake transition execution', async ({ page }) => {
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

  await expect(page.getByText('APPROVE', { exact: true })).toBeVisible();
  await expect(page.getByText('Pressure deviation DEV-1')).toBeVisible();
  await expect(page.getByText('Supervisor')).toBeVisible();
  await expect(page.getByText(/ne fournit pas encore d’endpoint d’exécution de transition/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'APPROVE' })).toHaveCount(0);
});
