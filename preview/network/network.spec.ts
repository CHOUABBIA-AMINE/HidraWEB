import { expect, test, type Page } from '@playwright/test';

function workspace(page: Page) {
  return {
    role: page.getByLabel('Demo role'),
    system: page.getByLabel('Pipeline system'),
    window: page.getByLabel('Time window', { exact: false }),
    map: page.getByRole('group', { name: 'Station map' }),
    tree: page.getByRole('region', { name: 'Asset tree' }),
    telemetry: page.getByRole('region', { name: 'Telemetry' }),
    technical: page.getByRole('region', { name: 'Technical revision' }),
    alarm: page.getByRole('region', { name: 'Alarm', exact: true }),
  };
}

test('map, tree and linked alarm open the same fixture asset and UTC window', async ({ page }) => {
  await page.goto('/');
  const view = workspace(page);
  const treeAtlas = view.tree.getByRole('list', { name: 'Stations' }).getByRole('button', { name: /Atlas Compression/ });
  const mapAtlas = view.map.getByRole('button', { name: 'Select Atlas Compression on map' });
  async function expectAtlas() {
    await expect(treeAtlas).toHaveAttribute('aria-pressed', 'true');
    await expect(mapAtlas).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('demo-gz2-atlas', { exact: true })).toBeVisible();
    await expect(page.getByText('06:00–10:00 UTC', { exact: true }).last()).toBeVisible();
    await expect(view.technical).toContainText('REV-A03');
    await expect(view.telemetry).toContainText('64.1 bar(g)');
    await expect(view.telemetry.locator('time')).toHaveAttribute('datetime', '2026-11-06T09:45:00Z');
    await expect(view.alarm).toContainText('DEMO-204');
  }

  await view.tree.getByRole('button', { name: /West Intake/ }).click();
  await mapAtlas.click();
  await expectAtlas();

  await view.map.getByRole('button', { name: 'Select East Delivery on map' }).click();
  await treeAtlas.click();
  await expectAtlas();

  await view.tree.getByRole('button', { name: /West Intake/ }).click();
  await view.tree.getByRole('button', { name: /Low discharge pressure/ }).click();
  await expectAtlas();

  await page.getByRole('checkbox', { name: 'Stations' }).uncheck();
  await expect(mapAtlas).toHaveCount(0);
  await expect(treeAtlas).toBeVisible();
  await page.getByRole('checkbox', { name: 'Pipelines' }).uncheck();
  await expect(view.map.locator('.corridor')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset preview' }).click();
  await expectAtlas();
  await expect(view.map.locator('.corridor')).toBeVisible();
});

test('time and system changes replace evidence and distinguish stale, empty and unavailable', async ({ page }) => {
  await page.goto('/');
  const view = workspace(page);
  await view.window.selectOption('afternoon');
  await expect(view.technical).toContainText('REV-A04');
  await expect(view.telemetry).toContainText('Stale');
  await expect(view.telemetry).toContainText('64.2 bar(g)');
  await expect(view.alarm).toContainText('Unavailable');
  await expect(page.getByText('DEMO-204', { exact: false })).toHaveCount(0);
  await view.tree.getByRole('button', { name: /West Intake/ }).click();
  await expect(view.alarm).toContainText('Empty');
  await expect(view.alarm).toContainText('No records in this window.');

  await view.system.selectOption('orion');
  await expect(page.getByText('East Gas Control', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Select a station' })).toBeVisible();
  await expect(view.telemetry).toHaveCount(0);
  await expect(page.getByText('West Gas Control', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Atlas Compression', { exact: false })).toHaveCount(0);
  await view.map.getByRole('button', { name: 'Select Cedar Entry on map' }).click();
  await expect(view.technical).toContainText('REV-C02');
  await expect(view.telemetry).toContainText('Empty');
  await view.window.selectOption('morning');
  await expect(view.technical).toContainText('REV-C01');

  await page.getByRole('button', { name: 'Reset preview' }).click();
  await expect(view.system).toHaveValue('gz2');
  await expect(view.window).toHaveValue('morning');
  await expect(view.technical).toContainText('REV-A03');
});

test('both authorized roles can read and denied scopes disclose no protected fixture context', async ({ page }) => {
  await page.goto('/');
  const view = workspace(page);
  await expect(view.alarm).toContainText('DEMO-204');
  await view.role.selectOption('observer');
  await expect(view.alarm).toContainText('DEMO-204');

  const scopeStatus = page.getByRole('region', { name: 'Scope status' });
  let deniedStatus: string | undefined;
  for (const role of ['otherScope', 'otherCompany']) {
    await view.role.selectOption(role);
    await expect(scopeStatus.getByRole('status')).toHaveText('No workspace is available in this demo scope.');
    const status = await scopeStatus.innerText();
    expect(status).toBe(deniedStatus ?? status);
    deniedStatus = status;
    await expect(view.system).toBeDisabled();
    await expect(view.system.locator('option')).toHaveText(['No system available']);
    await expect(view.map).toHaveCount(0);
    await expect(view.tree).toHaveCount(0);
    await expect(view.alarm).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText(/West Gas Control|GZ2|Orion|Atlas|DEMO-204|REV-A03/);
  }

  await view.role.selectOption('operator');
  await expect(page.getByRole('heading', { name: 'Select a station' })).toBeVisible();
  await expect(view.alarm).toHaveCount(0);
});

test('narrow workspace supports keyboard selection with visible focus', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to network workspace' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  const target = workspace(page).tree.getByRole('button', { name: /West Intake/ });
  for (let step = 0; step < 8 && !(await target.evaluate((element) => element === document.activeElement)); step += 1) {
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
  await expect(target).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(target).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'West Intake' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
});

test('built preview uses only local static requests and resets without durable browser state', async ({ page, context, baseURL }) => {
  const requested: Array<{ url: string; method: string; authorization: string | undefined }> = [];
  const errors: string[] = [];
  await context.addInitScript(() => {
    const write = () => { throw new Error('Unexpected durable browser state'); };
    Storage.prototype.setItem = write;
    Object.defineProperty(Document.prototype, 'cookie', { set: write });
    IDBFactory.prototype.open = write;
    CacheStorage.prototype.open = write;
    ServiceWorkerContainer.prototype.register = write;
  });
  context.on('request', (request) => {
    requested.push({ url: request.url(), method: request.method(), authorization: request.headers().authorization });
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  const view = workspace(page);
  await view.system.selectOption('orion');
  await view.window.selectOption('afternoon');
  await view.map.getByRole('button', { name: 'Select Cedar Entry on map' }).click();
  await page.reload();
  await expect(view.system).toHaveValue('gz2');
  await expect(view.window).toHaveValue('morning');
  await expect(view.technical).toContainText('REV-A03');

  expect(requested.length).toBeGreaterThan(1);
  for (const { url, method, authorization } of requested) {
    const { origin, pathname } = new URL(url);
    expect(origin).toBe(baseURL);
    expect(pathname).toMatch(/^\/(?:$|assets\/|favicon\.ico$)/);
    expect(method).toBe('GET');
    expect(authorization).toBeUndefined();
  }
  expect(errors).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});
