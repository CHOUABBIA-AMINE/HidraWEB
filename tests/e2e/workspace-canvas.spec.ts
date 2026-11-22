import { expect, test, type Page } from '@playwright/test';

const route = (path: string, permission: string, module: string, resource: string) => ({
  route: path, methods: ['GET'], module, resource, action: 'read', permission,
  enforcementStatus: 'backend-enforced',
});

async function enter(page: Page, published: ReturnType<typeof route>[], grants: string[]) {
  await page.route('**/api/v1/security/permissions/routes', handler => handler.fulfill({ json: published }));
  await page.route('**/api/v1/security/permissions/catalog', handler => handler.fulfill({
    json: {
      strategy: 'derived-route-permission-catalog',
      enforcement: 'backend-enforced',
      permissionFormat: '<module>:<resource>:<action>',
      routes: published,
    },
  }));
  await page.route('**/api/v1/identity/me/permissions', handler => handler.fulfill({ json: grants }));
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Nom d’utilisateur').fill('operator');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble', level: 1 })).toBeVisible();
}

test('UXR-13 summary canvas keeps four shell facts accessible at narrow widths', async ({ page }) => {
  await enter(page, [], []);
  const canvas = page.getByRole('region', { name: 'Vue d’ensemble' });
  await expect(canvas).toHaveAttribute('data-canvas-variant', 'summary');
  await expect(canvas.locator('.MuiPaper-root')).toHaveCount(4);
  await page.setViewportSize({ width: 360, height: 740 });
  await expect(canvas).toBeVisible();
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test('UXR-13 Workflow register displays the explicit empty state and no fabricated rows', async ({ page }) => {
  const routes = [route('/api/v1/workflow/tasks', 'workflow:tasks:read', 'workflow', 'tasks')];
  await page.route('**/api/v1/workflow/tasks?**', handler => handler.fulfill({
    json: { content: [], page: 0, size: 50, totalElements: 0, totalPages: 0, hasNext: false },
  }));
  await enter(page, routes, ['workflow:tasks:read']);
  await page.getByRole('banner', { name: 'En-tête Hidra' }).getByRole('link', { name: 'Mes tâches' }).click();
  const canvas = page.getByRole('region', { name: 'Boîte de tâches assignées' });
  await expect(canvas).toHaveAttribute('data-canvas-variant', 'register');
  await expect(canvas.getByRole('status')).toBeVisible();
  await expect(canvas.locator('table')).toHaveCount(0);
});

test('UXR-13 denied Workflow read mounts no protected register or task request', async ({ page }) => {
  let taskReads = 0;
  await page.route('**/api/v1/workflow/tasks?**', handler => {
    taskReads += 1;
    return handler.fulfill({ status: 403 });
  });
  await enter(page, [route('/api/v1/workflow/tasks', 'workflow:tasks:read', 'workflow', 'tasks')], []);
  await page.evaluate(() => {
    window.history.pushState({}, '', '/work/tasks');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('heading', { name: 'Mes tâches', level: 1 })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Boîte de tâches assignées' })).toHaveCount(0);
  expect(taskReads).toBe(0);
});

test('UXR-13 map read failure replaces geometry with degraded state, never a fallback map', async ({ page }) => {
  const routes = [route('/api/v1/topology/map/layers', 'topology:map:read', 'topology', 'map')];
  await page.route('**/api/v1/topology/map/layers', handler => handler.fulfill({
    json: [{ id: 'facilities', label: 'Facilities', geometryType: 'Point',
      description: 'Facility locations', featuresEndpoint: '/api/v1/topology/map/layers/facilities/features' }],
  }));
  await page.route('**/api/v1/topology/map/geojson?**', handler => handler.fulfill({
    status: 503, json: { status: 503, title: 'Service unavailable' },
  }));
  await page.route('**/api/v1/topology/map/layers/facilities', handler => handler.fulfill({
    json: { id: 'facilities', label: 'Facilities', geometryType: 'Point' },
  }));
  await page.route('**/api/v1/topology/map/layers/facilities/features?**', handler => handler.fulfill({
    json: { type: 'FeatureCollection', features: [], totalFeatures: 0 },
  }));
  await enter(page, routes, ['topology:map:read']);
  await page.getByRole('button', { name: 'Réseau' }).click();
  const canvas = page.getByRole('region', { name: 'Cadre cartographique' });
  await expect(canvas).toHaveAttribute('data-canvas-variant', 'map');
  await expect(canvas.getByRole('alert')).toContainText('Impossible de charger les données topologiques');
  await expect(canvas.getByRole('button', { name: 'Réessayer' })).toBeEnabled();
  await expect(canvas.getByRole('region', { name: 'Carte opérationnelle du réseau' })).toHaveCount(0);
});
