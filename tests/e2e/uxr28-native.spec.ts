import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test, type Browser, type Page, type Response } from '@playwright/test';

type Actor = 'primary' | 'sibling' | 'foreign' | 'revoked';
type Phase = 'regional' | 'before-restart' | 'after-restart';
interface Receipt {
  roles: Record<Actor, string>;
  scope: {
    companyPartyId: string; foreignCompanyPartyId: string; pipelineId: string;
    sectionId: string; facilityId: string; siblingPipelineId: string; foreignPipelineId: string;
  };
  systems: Record<'primary' | 'sibling' | 'foreign', string>;
  limits: { pipeline: string; section: string; currentBaselineReceiptId: string };
  observation: { pointId: string; bindingId: string; observedAt: string; trustedId: string; sourceId: string; history: string };
}
interface Fixture {
  baseUrl: string; password: string; receipt: Receipt; primarySystemId: string; emptyPointId: string;
  integrity: { actor: string; findingId: string; approvalId: string; equipmentId: string; recommendationId: string };
  expectedLimit: { upperPressure: number; revisionId: string; sourceBaselineReceiptId: string };
}
interface Login { userId: string; accessToken: string; expiresAt: string; authenticationType: string; refreshToken: string }
interface Feature { properties: { layer: string; entityId: string } }
interface DossierItem { id: string; code?: string; facilityId?: string; sectionId?: string }
interface Observation { trustedId: string; sourceId: string; observedAt: string; binding: { id: string }; freshness: string; value: number; unit: string }
const origin = 'http://127.0.0.1:5173';
const identity = '/api/v1/identity';
const regional = '/api/v1/topology/regional-map';
const dossier = '/api/v1/topology/pipeline-dossiers';
const stage = (name: string) => process.stdout.write('UXR28_STAGE=' + name + '\n');
const checkpoint = (name: string) => process.stdout.write('UXR28_CHECKPOINT=' + name + '\n');
const enc = encodeURIComponent;
function at(page: Page, path: string, method = 'GET', params: Record<string, string> = {}) {
  // Observe actual browser requests, without intercepting or fulfilling them.
  return page.waitForResponse(response => {
    const url = new URL(response.url());
    return url.pathname === path && response.request().method() === method &&
      Object.entries(params).every(([key, value]) => url.searchParams.get(key) === value);
  }, { timeout: 30_000 });
}
async function read<T>(response: Promise<Response>): Promise<T> {
  const result = await response;
  expect(result.status()).toBe(200);
  return await result.json() as T;
}
async function signIn(page: Page, user: string, password: string, employee = true): Promise<Login> {
  await page.goto(origin + '/overview');
  await page.getByLabel(/^Username(?:\s*\*)?$/).fill(user);
  await page.getByLabel(/^Password(?:\s*\*)?$/).fill(password);
  const [login, principal, permissions] = await Promise.all([
    read<Login>(at(page, identity + '/authentication/login', 'POST')),
    read<{ userId: string; employeeReferenceId?: string }>(at(page, identity + '/me')),
    read<string[]>(at(page, identity + '/me/permissions')),
    read<unknown>(at(page, '/api/v1/security/permissions/catalog')),
    read<unknown>(at(page, '/api/v1/security/permissions/routes')),
    page.getByRole('button', { name: 'Sign in', exact: true }).click(),
  ]);
  expect(login.userId === user && login.authenticationType === 'LOCAL' && Boolean(login.accessToken)).toBe(true);
  expect(principal.userId === user && (!employee || Boolean(principal.employeeReferenceId))).toBe(true);
  expect(permissions.includes('security:permissions:read') && !permissions.includes('*')).toBe(true);
  await expect(page).toHaveURL(origin + '/overview');
  return login;
}
async function choose(page: Page, label: string, id: string) {
  const control = page.getByRole('combobox', { name: label, exact: true });
  await expect(control).toBeEnabled();
  await control.click();
  await page.getByRole('option').and(page.locator('[data-value="' + id + '"]')).click();
}
async function selectScope(page: Page, company: string, system: string, deniedCompany?: string) {
  await page.getByRole('button', { name: /Operational context/ }).click();
  const dialog = page.getByRole('dialog');
  const input = dialog.getByRole('textbox', { name: 'Company ID' });
  const resource = dialog.getByRole('combobox', { name: 'Assigned resource' });
  const discover = dialog.getByRole('button', { name: 'Discover authorized resources' });
  if (deniedCompany) {
    await input.fill(deniedCompany);
    const denied = read<unknown[]>(at(page, identity + '/me/regional-access/scopes', 'GET', { companyPartyId: deniedCompany }));
    await discover.click();
    expect((await denied).length).toBe(0);
    await expect(resource).toBeDisabled();
  }
  await input.fill(company);
  const found = read<Array<{ id: number; type: string; targetId: string }>>(
    at(page, identity + '/me/regional-access/scopes', 'GET', { companyPartyId: company }));
  await discover.click();
  const scopes = await found;
  const exact = scopes.find(item => item.type === 'PIPELINE_SYSTEM' && item.targetId === system);
  expect(Boolean(exact)).toBe(true);
  await expect(resource).toBeEnabled();
  await resource.click();
  await page.getByRole('option').and(page.locator('[data-value="' + exact!.id + '"]')).click();
  const decision = read<{ permitted: boolean; companyPartyId: string; resourceKind: string; resourceId: string }>(
    at(page, identity + '/me/regional-access/PIPELINE_SYSTEM/' + enc(system), 'GET', { companyPartyId: company }));
  await dialog.getByRole('button', { name: 'Verify and apply' }).click();
  expect(await decision).toMatchObject({ permitted: true, companyPartyId: company, resourceKind: 'PIPELINE_SYSTEM', resourceId: system });
  await expect(dialog).toHaveCount(0);
}
async function navigate(page: Page, path: string) {
  await page.evaluate(target => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}
async function openDossier(page: Page, company: string, pipeline: string, code: string, excluded: string[]) {
  const params = { companyPartyId: company };
  const map = read<{ features: Feature[] }>(at(page, regional + '/geojson', 'GET', params));
  await page.getByRole('button', { name: 'Network', exact: true }).click();
  const mapFeatures = (await map).features;
  expect(mapFeatures.some(feature => feature.properties.entityId === pipeline)).toBe(true);
  expect(mapFeatures.every(feature => !excluded.includes(feature.properties.entityId))).toBe(true);
  await page.getByRole('textbox', { name: 'Regional search' }).fill(code);
  const search = read<{ features: Feature[] }>(at(page, regional + '/search', 'GET', { ...params, q: code }));
  await page.getByRole('button', { name: 'Search this scope' }).click();
  const features = (await search).features;
  const matching = features.filter(feature => feature.properties.layer === 'pipelines' && feature.properties.entityId === pipeline);
  expect(matching).toHaveLength(1);
  expect(features.every(feature => !excluded.includes(feature.properties.entityId))).toBe(true);
  // Pipeline and section can share a display code; use the exact owner-issued link.
  const href = '/network?' + new URLSearchParams({
    regionalLayer: matching[0].properties.layer, regionalEntityId: matching[0].properties.entityId,
  });
  const link = page.getByRole('link').and(page.locator('a[href="' + href + '"]'));
  await expect(link).toHaveCount(1);
  await expect(link).toBeVisible();
  const [feature, result] = await Promise.all([
    read<Feature>(at(page, regional + '/layers/pipelines/features/' + enc(pipeline), 'GET', params)),
    read<{ id: string; designPressure: { value: number; unit: string; meaning: string } }>(
      at(page, dossier + '/' + enc(pipeline), 'GET', params)),
    link.click(),
  ]);
  await expect(page).toHaveURL(origin + href);
  expect(feature.properties).toMatchObject({ layer: 'pipelines', entityId: pipeline });
  expect(result.id === pipeline).toBe(true);
  await expect(page.getByRole('heading', { name: 'Pipeline dossier', exact: true })).toBeVisible();
  return result;
}
async function signedGet(page: Page, fixture: Fixture, path: string, token: string) {
  return (await page.request.get(new URL(path, fixture.baseUrl).href, {
    headers: { Authorization: 'Bearer ' + token }, maxRedirects: 0,
  })).status();
}
async function isolated<T>(browser: Browser, action: (page: Page) => Promise<T>): Promise<T> {
  const context = await browser.newContext({ baseURL: origin, viewport: { width: 1280, height: 900 }, locale: 'en-US', timezoneId: 'UTC' });
  try { return await action(await context.newPage()); }
  finally { await context.close(); }
}
async function regionalPhase(browser: Browser, fixture: Fixture, privateDir: string) {
  const { roles, scope, systems } = fixture.receipt;
  expect(new Set([roles.primary, roles.sibling, roles.foreign, roles.revoked]).size).toBe(4);
  const variants = [
    { actor: 'primary', company: scope.companyPartyId, pipeline: scope.pipelineId, code: 'T35-GZ2-PIPELINE', excluded: [scope.siblingPipelineId, scope.foreignPipelineId] },
    { actor: 'sibling', company: scope.companyPartyId, pipeline: scope.siblingPipelineId, code: 'GZ2-CIRCLE-SIBLING', excluded: [scope.pipelineId, scope.foreignPipelineId] },
    { actor: 'foreign', company: scope.foreignCompanyPartyId, pipeline: scope.foreignPipelineId, code: 'GZ2-CIRCLE-FOREIGN', excluded: [scope.pipelineId, scope.siblingPipelineId] },
  ] as const;
  for (const variant of variants) {
    stage('REGIONAL_' + variant.actor.toUpperCase());
    await isolated(browser, async page => {
      await signIn(page, roles[variant.actor], fixture.password);
      await selectScope(page, variant.company, systems[variant.actor],
        variant.actor === 'primary' ? scope.foreignCompanyPartyId : undefined);
      await openDossier(page, variant.company, variant.pipeline, variant.code, [...variant.excluded]);
      if (variant.actor !== 'primary') {
        const denied = at(page, regional + '/layers/pipelines/features/' + enc(scope.pipelineId), 'GET', { companyPartyId: variant.company });
        await navigate(page, '/network?regionalLayer=pipelines&regionalEntityId=' + enc(scope.pipelineId));
        expect((await denied).status()).toBe(404);
        await expect(page.getByText('Regional search unavailable or not authorized.', { exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Pipeline dossier', exact: true })).toHaveCount(0);
      }
    });
  }
  await isolated(browser, async page => {
    stage('REVOKE_BEFORE');
    const login = await signIn(page, roles.revoked, fixture.password);
    await selectScope(page, scope.companyPartyId, systems.primary);
    await openDossier(page, scope.companyPartyId, scope.pipelineId, 'T35-GZ2-PIPELINE', [scope.siblingPipelineId, scope.foreignPipelineId]);
    const query = '?companyPartyId=' + enc(scope.companyPartyId);
    const feature = regional + '/layers/pipelines/features/' + enc(scope.pipelineId) + query;
    expect(await signedGet(page, fixture, feature, login.accessToken)).toBe(200);
    writeFileSync(join(privateDir, 'ready'), '', { flag: 'wx', mode: 0o600 });
    await expect.poll(() => existsSync(join(privateDir, 'released')), { timeout: 60_000 }).toBe(true);
    stage('REVOKE_AFTER');
    expect(await signedGet(page, fixture, feature, login.accessToken)).toBe(404);
    expect(await signedGet(page, fixture, dossier + '/' + enc(scope.pipelineId) + query, login.accessToken)).toBe(404);
    await expect(page).toHaveURL(origin + '/overview', { timeout: 45_000 });
    await expect(page.getByRole('heading', { name: 'Pipeline dossier', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: /Operational context/ }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: 'Company ID' }).fill(scope.companyPartyId);
    const discovery = read<unknown[]>(at(page, identity + '/me/regional-access/scopes', 'GET', { companyPartyId: scope.companyPartyId }));
    await dialog.getByRole('button', { name: 'Discover authorized resources' }).click();
    expect((await discovery).length).toBe(0);
    await expect(dialog.getByRole('combobox', { name: 'Assigned resource' })).toBeDisabled();
  });
}
async function verifyDossier(page: Page, fixture: Fixture) {
  const { scope, limits } = fixture.receipt;
  const params = { companyPartyId: scope.companyPartyId };
  const root = dossier + '/' + enc(scope.pipelineId);
  stage('DOSSIER');
  const baseline = read<{ receiptId: string; availability: string }>(at(page, root + '/baseline', 'GET', params));
  const sections = read<{ items: DossierItem[] }>(at(page, root + '/sections', 'GET', params));
  const facts = await openDossier(page, scope.companyPartyId, scope.pipelineId, 'T35-GZ2-PIPELINE', [scope.siblingPipelineId, scope.foreignPipelineId]);
  expect(facts.designPressure).toMatchObject({ value: 70, unit: 'bar', meaning: 'DESIGN_PRESSURE' });
  expect(await baseline).toMatchObject({ receiptId: limits.currentBaselineReceiptId, availability: 'AVAILABLE' });
  await expect(page.getByText(/^Design pressure · 70 bar/)).toBeVisible();
  await expect(page.getByText('Published baseline receipt · ' + limits.currentBaselineReceiptId, { exact: false })).toBeVisible();
  const section = (await sections).items.find(item => item.id === scope.sectionId);
  expect(Boolean(section)).toBe(true);
  const connections = read<{ items: DossierItem[] }>(at(page, root + '/connections', 'GET', params));
  await page.getByRole('button', { name: 'Connections', exact: true }).click();
  expect(Array.isArray((await connections).items)).toBe(true);
  const equipment = read<{ items: DossierItem[] }>(at(page, root + '/equipment', 'GET', params));
  await page.getByRole('button', { name: 'Equipment', exact: true }).click();
  const linked = (await equipment).items.find(item => item.sectionId === scope.sectionId && item.facilityId === scope.facilityId);
  expect(Boolean(linked)).toBe(true);
  await expect(page.locator('li').filter({ hasText: linked!.code || linked!.id }).filter({ hasText: scope.facilityId })).toBeVisible();
  await page.getByRole('button', { name: 'Sections', exact: true }).click();
  const detail = read<{ id: string }>(at(page, root + '/sections/' + enc(scope.sectionId), 'GET', params));
  await page.getByRole('button', { name: section!.code || section!.id, exact: true }).click();
  expect((await detail).id === scope.sectionId).toBe(true);
  await expect(page.getByText(/^Section detail · /)).toBeVisible();
  stage('LIMITS');
  const form = page.locator('form').filter({ has: page.getByRole('button', { name: 'Read operating limits', exact: true }) });
  const pipelineUrl = new URL(limits.pipeline, fixture.baseUrl);
  const sectionUrl = new URL(limits.section, fixture.baseUrl);
  const paramsFor = (url: URL) => ({
    companyPartyId: scope.companyPartyId,
    conditionCode: url.searchParams.get('conditionCode')!,
    effectiveAt: url.searchParams.get('effectiveAt')!,
  });
  const enter = async (url: URL) => {
    const query = paramsFor(url);
    await form.getByLabel(/^Condition code(?:\s*\*)?$/).fill(query.conditionCode);
    await form.getByLabel(/^Effective instant \(UTC, ISO 8601\)(?:\s*\*)?$/).fill(query.effectiveAt);
    await form.getByRole('button', { name: 'Read operating limits', exact: true }).click();
  };
  const same = JSON.stringify(paramsFor(pipelineUrl)) === JSON.stringify(paramsFor(sectionUrl));
  const pressure = read<{ status: string; upperPressure: number; revisionId: string; sourceBaselineReceiptId: string }>(
    at(page, pipelineUrl.pathname, 'GET', paramsFor(pipelineUrl)));
  const simultaneous = same ? read<{ status: string; upperPressure?: number }>(at(page, sectionUrl.pathname, 'GET', paramsFor(sectionUrl))) : undefined;
  await enter(pipelineUrl);
  expect(await pressure).toMatchObject({ status: 'QUALIFIED', ...fixture.expectedLimit });
  await expect(page.getByText(new RegExp('^Qualified pipeline limit · ' + fixture.expectedLimit.upperPressure + ' bar'))).toBeVisible();
  const sectionPressure = simultaneous ?? read<{ status: string; upperPressure?: number }>(at(page, sectionUrl.pathname, 'GET', paramsFor(sectionUrl)));
  if (!same) await enter(sectionUrl);
  const unavailable = await sectionPressure;
  expect(unavailable.status).toBe('UNAVAILABLE');
  expect(unavailable.upperPressure == null).toBe(true);
  await expect(page.getByText('Qualified section limit · UNAVAILABLE', { exact: true })).toBeVisible();
}
async function verifyTelemetry(page: Page, fixture: Fixture) {
  stage('TELEMETRY');
  const { scope, observation } = fixture.receipt;
  const params = { companyPartyId: scope.companyPartyId };
  let legacy = 0;
  page.on('request', request => {
    if (new URL(request.url()).pathname.startsWith('/api/v1/telemetry/points/')) legacy++;
  });
  checkpoint('STATION_DISCOVERY');
  const [stationMap] = await Promise.all([
    read<{ features: Array<Feature & { id: string }> }>(at(page, regional + '/layers/facilities/features', 'GET', params)),
    page.getByRole('button', { name: 'Operations', exact: true }).click(),
  ]);
  expect(stationMap.features.filter(feature => feature.id === 'facilities:' + scope.facilityId &&
    feature.properties.layer === 'facilities' && feature.properties.entityId === scope.facilityId)).toHaveLength(1);
  const panel = page.getByRole('region', { name: 'Trusted asset telemetry', exact: true });
  await expect(panel).toBeVisible();
  const root = '/api/v1/telemetry/assets/FACILITY/' + enc(scope.facilityId) + '/points';
  checkpoint('STATION_SELECT');
  const [pointPage] = await Promise.all([
    read<{ points: Array<{ pointId: string; binding: { id: string } }> }>(at(page, root, 'GET', params)),
    choose(page, 'Regional station', scope.facilityId),
  ]);
  checkpoint('POINT_DISCOVERY');
  const selected = pointPage.points;
  expect(selected.some(item => item.pointId === observation.pointId && item.binding.id === observation.bindingId)).toBe(true);
  expect(selected.some(item => item.pointId === fixture.emptyPointId && Boolean(item.binding.id))).toBe(true);
  checkpoint('POINT_SELECT');
  await choose(page, 'Commissioned point', observation.pointId);
  const latest = async (point: string, age: string) => {
    await panel.getByRole('spinbutton', { name: 'Maximum age (seconds)' }).fill(age);
    const [result] = await Promise.all([
      read<{ status: string; observation?: Observation }>(
        at(page, root + '/' + enc(point) + '/trusted-readings/latest', 'GET', { ...params, maxAgeSeconds: age })),
      panel.getByRole('button', { name: 'Apply threshold' }).click(),
    ]);
    return result;
  };
  checkpoint('FRESH');
  const fresh = await latest(observation.pointId, '3600');
  expect(fresh.status).toBe('FRESH');
  expect(fresh.observation).toMatchObject({
    trustedId: observation.trustedId, sourceId: observation.sourceId, observedAt: observation.observedAt,
    binding: { id: observation.bindingId }, freshness: 'FRESH',
  });
  await expect(panel.getByText(/^FRESH · /)).toBeVisible();
  checkpoint('STALE');
  const stale = await latest(observation.pointId, '1');
  expect(stale.status).toBe('STALE');
  expect(stale.observation?.trustedId === observation.trustedId).toBe(true);
  await expect(panel.getByText(/^STALE · /)).toBeVisible();
  const url = new URL(observation.history, fixture.baseUrl);
  checkpoint('HISTORY');
  // datetime-local has a native default step of 60 seconds. Round the
  // receipt window outwards, retaining both real observations in UTC.
  const from = new Date(Math.floor((Date.parse(url.searchParams.get('from')!) - 1000) / 60_000) * 60_000).toISOString();
  const until = new Date(Math.ceil((Date.parse(url.searchParams.get('until')!) + 1000) / 60_000) * 60_000).toISOString();
  const fromInput = panel.getByLabel('From', { exact: true });
  const untilInput = panel.getByLabel('To', { exact: true });
  await fromInput.fill(from.slice(0, 16));
  await untilInput.fill(until.slice(0, 16));
  expect(await fromInput.evaluate(input => (input as HTMLInputElement).validity.valid)).toBe(true);
  expect(await untilInput.evaluate(input => (input as HTMLInputElement).validity.valid)).toBe(true);
  const [history] = await Promise.all([
    read<{ observations: Observation[] }>(at(page, url.pathname, 'GET', { ...params, from, until, maxAgeSeconds: '1' })),
    panel.getByRole('button', { name: 'History', exact: true }).click(),
  ]);
  const rows = history.observations;
  expect(rows.length).toBeGreaterThanOrEqual(2);
  expect(rows.some(item => item.trustedId === observation.trustedId && item.binding.id === observation.bindingId)).toBe(true);
  await expect.poll(() => panel.getByText(observation.bindingId, { exact: false }).count()).toBeGreaterThanOrEqual(2);
  checkpoint('EMPTY_POINT');
  await choose(page, 'Commissioned point', fixture.emptyPointId);
  checkpoint('UNAVAILABLE');
  const unavailable = await latest(fixture.emptyPointId, '3600');
  expect(unavailable.status).toBe('UNAVAILABLE');
  expect(unavailable.observation == null).toBe(true);
  await expect(panel.getByText(/^UNAVAILABLE · /)).toBeVisible();
  expect(legacy).toBe(0);
}
async function verifyIntegrity(browser: Browser, fixture: Fixture) {
  stage('INTEGRITY');
  await isolated(browser, async page => {
    const item = fixture.integrity;
    const login = await signIn(page, item.actor, fixture.password, false);
    checkpoint('INTEGRITY_RESOURCE');
    const [resources, list] = await Promise.all([
      read<Array<{ resource: string; javaType: string }>>(at(page, '/api/v1/workbench/integrity/resources')),
      read<{ items: Array<{ id: string }> }>(at(page, '/api/v1/workbench/integrity/inspection-findings')),
      navigate(page, '/engineering'),
    ]);
    await expect(page.getByRole('heading', { name: 'Integrity & Maintenance' })).toBeVisible();
    expect(resources.some(row => row.resource === 'inspection-findings' && row.javaType.endsWith('InspectionFindingJpaEntity'))).toBe(true);
    expect(list.items.some(row => row.id === item.findingId)).toBe(true);
    checkpoint('INTEGRITY_DETAIL');
    const [selected] = await Promise.all([
      read<{ id: string; attributes: Record<string, unknown> }>(
        at(page, '/api/v1/workbench/integrity/inspection-findings/' + enc(item.findingId))),
      page.getByRole('button', { name: item.findingId, exact: true }).click(),
    ]);
    expect(selected.id === item.findingId && selected.attributes.topologyAssetId === item.equipmentId).toBe(true);
    const panel = page.getByRole('region', { name: 'Integrity maintenance receipt' });
    checkpoint('INTEGRITY_RECEIPT');
    await panel.getByLabel('Approval ID', { exact: true }).fill(item.approvalId);
    const [receipt] = await Promise.all([
      read<{ approvalId: string; recommendationId: string }>(
        at(page, '/api/v1/integrity/findings/' + enc(item.findingId) + '/maintenance-handoffs/' + enc(item.approvalId))),
      panel.getByRole('button', { name: 'Read approval receipt' }).click(),
    ]);
    expect(receipt).toMatchObject({ approvalId: item.approvalId, recommendationId: item.recommendationId });
    await expect(panel.getByText('Approval ' + item.approvalId, { exact: true })).toBeVisible();
    await expect(panel.getByText('Recommendation ' + item.recommendationId, { exact: true })).toBeVisible();
    const { scope } = fixture.receipt;
    expect(await signedGet(page, fixture, '/api/v1/telemetry/assets/FACILITY/' + enc(scope.facilityId) +
      '/points?companyPartyId=' + enc(scope.companyPartyId), login.accessToken)).toBe(403);
  });
}
async function protectedRead(page: Page, path: string) {
  return page.evaluate(async url => {
    const modulePath = '/src/api/client/hidraAxios.ts';
    const { hidraAxios } = await import(/* @vite-ignore */ modulePath);
    return (await hidraAxios.request({ url, method: 'GET' })).status;
  }, path);
}
async function afterRestart(page: Page, fixture: Fixture) {
  const { scope, limits } = fixture.receipt;
  stage('RELOAD');
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  await page.clock.install();
  const login = await signIn(page, fixture.receipt.roles.primary, fixture.password);
  await selectScope(page, scope.companyPartyId, fixture.primarySystemId);
  const baseline = read<{ receiptId: string }>(at(page, dossier + '/' + enc(scope.pipelineId) + '/baseline', 'GET', { companyPartyId: scope.companyPartyId }));
  await openDossier(page, scope.companyPartyId, scope.pipelineId, 'T35-GZ2-PIPELINE', [scope.siblingPipelineId, scope.foreignPipelineId]);
  expect((await baseline).receiptId === limits.currentBaselineReceiptId).toBe(true);
  stage('RTL');
  await page.getByRole('combobox', { name: 'Language', exact: true }).click();
  await page.getByRole('option', { name: 'AR', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { name: 'ملف خط الأنابيب', exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'اللغة', exact: true }).click();
  await page.getByRole('option', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pipeline dossier', exact: true })).toBeVisible();
  stage('SESSION');
  expect(typeof login.refreshToken === 'string' && login.refreshToken.length === 80).toBe(true);
  const refresh = at(page, identity + '/authentication/refresh', 'POST');
  await page.clock.setSystemTime(Date.parse(login.expiresAt) - 1_000);
  expect(await Promise.all([protectedRead(page, identity + '/me'), protectedRead(page, identity + '/me/permissions')])).toEqual([200, 200]);
  const renewed = await refresh;
  expect(renewed.status()).toBe(200);
  expect(renewed.request().headers().authorization === undefined).toBe(true);
  const replacement = (await renewed.json() as Login).accessToken;
  expect(Boolean(replacement) && replacement !== login.accessToken).toBe(true);
  expect([401, 403]).toContain(await signedGet(page, fixture, identity + '/me', login.accessToken));
  expect(await signedGet(page, fixture, identity + '/me', replacement)).toBe(200);
  const logout = at(page, identity + '/authentication/logout', 'POST');
  await page.getByRole('button', { name: 'Profile', exact: true }).press('Enter');
  await page.getByRole('menuitem', { name: 'Sign out', exact: true }).press('Enter');
  expect((await logout).status()).toBe(204);
  await expect(page).toHaveURL(/\/login$/);
  expect([401, 403]).toContain(await signedGet(page, fixture, identity + '/me', replacement));
}

test('UXR-28 signed integrated Circle 1 native browser phase', async ({ browser }) => {
  const input = process.env.HIDRA_UXR28_FIXTURE_JSON;
  const privateDir = process.env.HIDRA_UXR28_PRIVATE_DIR;
  const phase = process.env.HIDRA_UXR28_PHASE as Phase;
  if (!input || !privateDir || !['regional', 'before-restart', 'after-restart'].includes(phase))
    throw new Error('Private fixture-owned UXR28 execution is required');
  const fixture = JSON.parse(input) as Fixture;
  expect(fixture.baseUrl === process.env.HIDRA_UXR26_API_URL).toBe(true);
  if (phase === 'regional') {
    await regionalPhase(browser, fixture, privateDir);
  } else {
    await isolated(browser, async page => {
      await signIn(page, fixture.receipt.roles.primary, fixture.password);
      await selectScope(page, fixture.receipt.scope.companyPartyId, fixture.primarySystemId);
      await verifyDossier(page, fixture);
      await verifyTelemetry(page, fixture);
      await verifyIntegrity(browser, fixture);
      if (phase === 'after-restart') await afterRestart(page, fixture);
    });
  }
  stage('COMPLETE');
});
