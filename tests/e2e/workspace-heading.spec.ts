import { expect, test, type Page } from '@playwright/test';

const routes = [
  {
    route: '/api/v1/workbench/modules', methods: ['GET'], module: 'modules',
    resource: 'resources', action: 'read', permission: 'modules:resources:read',
    enforcementStatus: 'backend-enforced',
  },
  {
    route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow',
    resource: 'tasks', action: 'read', permission: 'workflow:tasks:read',
    enforcementStatus: 'backend-enforced',
  },
];

async function signIn(page: Page, grants: string[], onTaskList?: () => void) {
  await page.route('**/api/v1/security/permissions/routes', route => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', route => route.fulfill({
    json: {
      strategy: 'derived-route-permission-catalog',
      enforcement: 'backend-enforced',
      permissionFormat: '<module>:<resource>:<action>',
      routes,
    },
  }));
  await page.route('**/api/v1/identity/me/permissions', route => route.fulfill({ json: grants }));
  await page.route('**/api/v1/workbench/modules', route => route.fulfill({ json: [] }));
  await page.route('**/api/v1/workflow/tasks?**', route => {
    onTaskList?.();
    return route.fulfill({ json: {
      content: [], page: 0, size: 50, totalElements: 0, totalPages: 0, hasNext: false,
    } });
  });

  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble', level: 1 })).toBeVisible();
}

test('UXR-12 Overview presents one h1 and keyboard-operable permission-gated primary action', async ({ page }) => {
  await signIn(page, ['modules:resources:read']);
  const breadcrumbs = page.getByRole('navigation', { name: 'Espace de travail' });
  await expect(breadcrumbs.getByText('Vue d’ensemble')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble', level: 1 })).toHaveCount(1);
  const open = page.getByRole('button', { name: 'Ouvrir l’atelier opérationnel' });
  await expect(open).toBeEnabled();
  await open.focus();
  await open.press('Enter');
  await expect(page).toHaveURL(/\/workbench$/);
});

test('UXR-12 task toolbar refreshes the authorized inbox and breadcrumbs restore Overview', async ({ page }) => {
  let requests = 0;
  await signIn(page, ['workflow:tasks:read'], () => { requests += 1; });
  await expect(page.getByRole('button', { name: 'Ouvrir l’atelier opérationnel' })).toHaveCount(0);
  await page.getByRole('banner', { name: 'En-tête Hidra' }).getByRole('link', { name: 'Mes tâches' }).click();

  await expect(page).toHaveURL(/\/work\/tasks$/);
  await expect(page.getByRole('heading', { name: 'Mes tâches', level: 1 })).toHaveCount(1);
  const toolbar = page.getByRole('group', { name: 'Boîte de tâches assignées' });
  await expect.poll(() => requests).toBeGreaterThan(0);
  const before = requests;
  const refresh = toolbar.getByRole('button', { name: 'Actualiser' });
  await expect(refresh).toBeEnabled();
  await refresh.focus();
  await refresh.press('Enter');
  await expect.poll(() => requests).toBeGreaterThan(before);

  const breadcrumbs = page.getByRole('navigation', { name: 'Espace de travail' });
  const overview = breadcrumbs.getByRole('link', { name: 'Vue d’ensemble' });
  await overview.focus();
  await overview.press('Enter');
  await expect(page).toHaveURL(/\/overview$/);
});

test('UXR-12 displays only current Workflow-owned task detail status in its heading', async ({ page }) => {
  await signIn(page, ['workflow:tasks:read']);
  const task = {
    id: 'task-1', status: 'OPEN', taskLabel: 'Review engineering deviation',
    updatedAt: '2026-11-20T10:00:00Z',
  };
  // Register these after the generic fixture so the owner-specific list wins.
  await page.route('**/api/v1/workflow/tasks/task-1/available-actions', route => route.fulfill({ json: [] }));
  await page.route('**/api/v1/workflow/tasks/task-1', route => route.fulfill({ json: task }));
  await page.route('**/api/v1/workflow/tasks?**', route => route.fulfill({
    json: { content: [task], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false },
  }));
  await page.getByRole('banner', { name: 'En-tête Hidra' })
    .getByRole('link', { name: 'Mes tâches' }).click();
  await expect(page.locator('main header [role="status"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open' }).click();
  const status = page.locator('main header [role="status"]');
  await expect(status).toContainText('Statut: OPEN');
  await expect(status).toContainText('HidraAPI Workflow');
});

test('UXR-12 protected route without current task grant exposes no toolbar or owner status', async ({ page }) => {
  let requests = 0;
  await signIn(page, [], () => { requests += 1; });
  await expect(page.getByRole('button', { name: 'Ouvrir l’atelier opérationnel' })).toHaveCount(0);
  await page.evaluate(() => {
    window.history.pushState({}, '', '/work/tasks');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('heading', { name: 'Mes tâches', level: 1 })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Boîte de tâches assignées' })).toHaveCount(0);
  await expect(page.getByText('Vous ne disposez pas de l’autorisation de lecture des tâches workflow.')).toBeVisible();
  expect(requests).toBe(0);
});
