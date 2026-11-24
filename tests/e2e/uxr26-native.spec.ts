import { expect, test, type Page } from '@playwright/test';
import type { PressureRestrictionRequest, PressureRestrictionSubmission } from '../../src/api/generated/topology/model';

interface Fixture {
  baseUrl: string;
  password: string;
  scopeRegistryId: string;
  receipt: {
    roles: Record<'author' | 'reviewer' | 'primary', string>;
    scope: { companyPartyId: string; foreignCompanyPartyId: string; pipelineId: string };
    currentPublication: { revisionId: string; streamVersion: number };
    workflowBinding: { definitionId: string };
  };
}

const webOrigin = 'http://127.0.0.1:5173';
const stage = (name: string) => { process.stdout.write(`UXR26_STAGE=${name}\n`); };
const status = (operation: 'LOGIN' | 'PRINCIPAL' | 'EFFECTIVE_PERMISSIONS' | 'PERMISSION_CATALOG' |
  'PERMISSION_ROUTES' | 'DISCOVERY' | 'FOREIGN_DISCOVERY' | 'T33', code: number) => {
  process.stdout.write(`UXR26_HTTP=${operation}:${code}\n`);
};

async function openSession(page: Page, username: string, password: string, target: string) {
  await page.goto(new URL(target, webOrigin).href);
  await page.getByLabel(/^Username(?:\s*\*)?$/).fill(username);
  await page.getByLabel(/^Password(?:\s*\*)?$/).fill(password);
  const observe = async (operation: Parameters<typeof status>[0], path: string, method: string) => {
    const result = await response(page, path, method);
    status(operation, result.status());
    expect(result.status()).toBe(200);
    return result;
  };
  const [loginResponse, principal, permissions] = await Promise.all([
    observe('LOGIN', '/identity/authentication/login', 'POST'),
    observe('PRINCIPAL', '/identity/me', 'GET'),
    observe('EFFECTIVE_PERMISSIONS', '/identity/me/permissions', 'GET'),
    observe('PERMISSION_CATALOG', '/security/permissions/catalog', 'GET'),
    observe('PERMISSION_ROUTES', '/security/permissions/routes', 'GET'),
    page.getByRole('button', { name: 'Sign in', exact: true }).click(),
  ]);
  // No tokens, identities, grants or response bodies are printed to CI.
  expect((await loginResponse.json()).userId === username).toBe(true);
  const current = await principal.json();
  expect(current.userId === username && Boolean(current.employeeReferenceId)).toBe(true);
  const effective: string[] = await permissions.json();
  expect(effective.includes('security:permissions:read')).toBe(true);
  expect(effective.includes('*')).toBe(false);
  await expect(page).toHaveURL(new URL(target, webOrigin).href);
}

async function openDossier(page: Page, companyPartyId: string, pipelineId: string, scopeRegistryId: string, foreignCompanyPartyId?: string) {
  await page.getByRole('button', { name: /Operational context/ }).click();
  const dialog = page.getByRole('dialog');
  const company = dialog.getByRole('textbox', { name: 'Company ID' });
  const resource = dialog.getByRole('combobox', { name: 'Assigned resource' });
  const discover = dialog.getByRole('button', { name: 'Discover authorized resources' });
  await expect(resource).toBeDisabled();
  const discoveryResponse = (companyId: string) => page.waitForResponse(result => {
    const url = new URL(result.url());
    return url.pathname === '/api/v1/identity/me/regional-access/scopes' &&
      url.searchParams.get('companyPartyId') === companyId && result.request().method() === 'GET';
  });
  if (foreignCompanyPartyId) {
    await company.fill(foreignCompanyPartyId);
    const foreign = discoveryResponse(foreignCompanyPartyId);
    await discover.click();
    const denied = await foreign;
    status('FOREIGN_DISCOVERY', denied.status());
    expect(denied.status()).toBe(200);
    expect(await denied.json()).toEqual([]);
    await expect(dialog.getByRole('alert')).toContainText('Context unavailable or not authorized.');
    await expect(resource).toBeDisabled();
  }
  await company.fill(companyPartyId);
  await expect(resource).toBeDisabled();
  const discovery = discoveryResponse(companyPartyId);
  await discover.click();
  const discovered = await discovery;
  status('DISCOVERY', discovered.status());
  expect(discovered.status()).toBe(200);
  const scopes = await discovered.json() as Array<{ id: number; type: string; targetId: string }>;
  const exact = scopes.find(scope => String(scope.id) === scopeRegistryId);
  expect(exact?.type).toBe('PIPELINE_SYSTEM');
  expect(exact?.targetId).toBeTruthy();
  await expect(resource).toBeEnabled();
  await resource.click();
  await page.getByRole('option').and(page.locator(`[data-value="${scopeRegistryId}"]`)).click();
  const check = response(page, '/identity/me/regional-access/PIPELINE_SYSTEM/' + encodeURIComponent(exact!.targetId), 'GET');
  await dialog.getByRole('button', { name: 'Verify and apply' }).click();
  const verified = await check;
  status('T33', verified.status());
  expect(verified.status()).toBe(200);
  expect(await verified.json()).toMatchObject({ permitted: true, companyPartyId,
    resourceKind: 'PIPELINE_SYSTEM', resourceId: exact!.targetId });
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button', { name: 'Network', exact: true }).click();
  await page.getByRole('textbox', { name: 'Regional search' }).fill('T35-GZ2-PIPELINE');
  await page.getByRole('button', { name: 'Search this scope' }).click();
  await page.getByRole('button', { name: 'T35-GZ2-PIPELINE', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`regionalEntityId=${encodeURIComponent(pipelineId)}`));
  await expect(page.getByRole('heading', { name: 'Pressure restriction requests' })).toBeVisible();
}

async function pick(page: Page, label: string, option: string | RegExp) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: option }).click();
}

async function pickById(page: Page, label: string, id: string) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option').and(page.locator(`[data-value="${id}"]`)).click();
}

const response = (page: Page, path: string, method: string) => page.waitForResponse(
  result => new URL(result.url()).pathname.endsWith(path) && result.request().method() === method,
);

test('UXR-26 verifies separate signed author, reviewer and publisher in Chromium', async ({ browser }) => {
  const fixtureJson = process.env.HIDRA_UXR26_FIXTURE_JSON;
  if (!fixtureJson) throw new Error('Requires the private, test-owned synthetic browser input.');
  const fixture = JSON.parse(fixtureJson) as Fixture;
  expect(fixture.scopeRegistryId).toMatch(/^\d+$/);
  expect(fixture.baseUrl).toBe(process.env.HIDRA_UXR26_API_URL);
  const { roles, scope, currentPublication, workflowBinding } = fixture.receipt;
  expect(new Set([roles.author, roles.reviewer, roles.primary]).size).toBe(3);
  const contexts = await Promise.all(Array.from({ length: 5 }, () => browser.newContext({ baseURL: webOrigin, viewport: { width: 1280, height: 900 }, locale: 'en-US', timezoneId: 'UTC' })));
  let administrativeRequests = 0;
  for (const context of contexts) context.on('request', request => {
    if (new URL(request.url()).pathname === '/api/v1/organization/responsibilities') administrativeRequests++;
  });
  try {
    const [author, firstReviewer, secondReviewer, publisher, readback] = await Promise.all(contexts.map(context => context.newPage()));
    const reviewers = [firstReviewer, secondReviewer];
    stage('AUTHOR_LOGIN');
    await openSession(author, roles.author, fixture.password, '/overview');
    stage('AUTHOR_SCOPE');
    await openDossier(author, scope.companyPartyId, scope.pipelineId, fixture.scopeRegistryId, scope.foreignCompanyPartyId);
    const root = `/api/v1/topology/operating-constraints/pipelines/${scope.pipelineId}/restriction-requests`;
    const condition = 'T38-NOMINAL';
    stage('AUTHOR_STREAM');
    await author.getByLabel('Restriction condition').fill(condition);
    const stream = response(author, root + '/stream', 'GET');
    await author.getByRole('button', { name: 'Read stream version' }).click();
    const streamResponse = await stream;
    expect(streamResponse.status()).toBe(200);
    expect((await streamResponse.json()).expectedVersion).toBe(currentPublication.streamVersion);
    await expect(author.getByText(`Stream version ${currentPublication.streamVersion}`, { exact: true })).toBeVisible();
    stage('AUTHOR_SUBMIT');
    await pick(author, 'Restriction change', 'Replacement');
    await author.getByLabel('Predecessor revision ID').fill(currentPublication.revisionId);
    const instant = new Date().toISOString();
    await author.getByLabel('Restriction effective at (UTC ISO)', { exact: false }).first().fill(instant);
    await author.getByLabel('Proposed upper pressure').fill('53');
    await author.getByLabel('Pressure unit').fill('bar');
    const submission = response(author, root, 'POST');
    await author.getByRole('button', { name: 'Submit restriction proposal' }).click();
    const submitted = await submission;
    expect(submitted.status()).toBe(200);
    const body: PressureRestrictionSubmission = submitted.request().postDataJSON();
    const proposal: PressureRestrictionRequest = await submitted.json();
    expect(proposal.candidates).toHaveLength(2);
    const requestId = proposal.requestId!;
    for (const [index, candidate] of proposal.candidates!.entries()) {
      const reviewer = reviewers[index];
      stage(`REVIEW_${index + 1}_ASSIGN`);
      await pickById(author, 'Restriction candidate', candidate.candidateId!);
      await author.getByRole('button', { name: 'Discover review definitions' }).click();
      await pickById(author, 'Review definition', workflowBinding.definitionId);
      await pickById(author, 'Independent reviewer', roles.reviewer);
      const instance = response(author, '/workflow/instances', 'POST');
      await author.getByRole('button', { name: 'Start restriction review' }).click();
      expect((await instance).status()).toBe(200);
      const task = response(author, '/workflow/tasks', 'POST');
      await author.getByRole('button', { name: 'Assign restriction review' }).click();
      const result = await task;
      expect(result.status()).toBe(200);
      const taskId: string = (await result.json()).id;
      const url = `/work/tasks?taskId=${encodeURIComponent(taskId)}`;
      stage(`REVIEW_${index + 1}_LOGIN`);
      await openSession(reviewer, roles.reviewer, fixture.password, url);
      await expect(reviewer.getByRole('heading', { name: 'Exact pressure restriction proposal' })).toBeVisible();
      await expect(reviewer.getByText(`Request · ${requestId}`, { exact: true })).toBeVisible();
      if (candidate.kind === 'REVISION') await expect(reviewer.getByText(/Proposed upper pressure · 53 bar/)).toBeVisible();
      stage(`REVIEW_${index + 1}_DECISION`);
      await reviewer.getByRole('button', { name: 'APPROVE', exact: true }).click();
      await expect(reviewer.getByRole('button', { name: 'Action: APPROVE' })).toBeDisabled();
      await reviewer.getByRole('checkbox', { name: 'I confirm this decision after reviewing the current task.' }).check();
      await reviewer.getByRole('button', { name: 'Action: APPROVE' }).click();
      await expect(reviewer.getByText('APPROVE · APPROVED')).toBeVisible();
    }
    stage('PUBLISHER_LOGIN');
    await openSession(publisher, roles.primary, fixture.password, '/overview');
    stage('PUBLISHER_SCOPE');
    await openDossier(publisher, scope.companyPartyId, scope.pipelineId, fixture.scopeRegistryId);
    stage('PUBLISHER_PUBLISH');
    await publisher.getByLabel('Restriction request ID').fill(requestId);
    await publisher.getByRole('button', { name: 'Read publication inputs' }).click();
    await expect(publisher.getByText(/Eligible approvals · 2/)).toBeVisible();
    await expect(publisher.getByRole('button', { name: 'Publish restriction' })).toBeDisabled();
    await publisher.getByRole('checkbox', { name: 'Confirm publishing this exact restriction request' }).check();
    await publisher.getByRole('button', { name: 'Publish restriction' }).click();
    await expect(publisher.getByText(new RegExp(`Publication receipt · ${requestId}`))).toBeVisible();
    stage('READBACK_LOGIN');
    await openSession(readback, roles.primary, fixture.password, '/overview');
    stage('READBACK_SCOPE');
    await openDossier(readback, scope.companyPartyId, scope.pipelineId, fixture.scopeRegistryId);
    await readback.getByLabel('Restriction request ID').fill(requestId);
    await readback.getByRole('button', { name: 'Read publication inputs' }).click();
    await expect(readback.getByText(new RegExp(`Publication receipt · ${requestId}`))).toBeVisible();
    stage('READBACK_LIMIT');
    await readback.getByLabel('Condition code', { exact: true }).fill(condition);
    await readback.getByLabel('Effective instant (UTC, ISO 8601)', { exact: true }).fill(instant);
    await readback.getByRole('button', { name: 'Read operating limits' }).click();
    await expect(readback.getByText(/Qualified pipeline limit · 53 bar/)).toBeVisible();
    stage('AUDIT_READBACK');
    await author.getByRole('button', { name: 'Read decision evidence' }).click();
    await expect(author.getByText(/Approval · .* · Audit ·/)).toHaveCount(2);

    stage('STALE_CONFLICT');
    const authorization = await submitted.request().headerValue('authorization');
    expect(authorization).toMatch(/^Bearer /);
    const stale = await author.request.post(fixture.baseUrl + root, {
      headers: { Authorization: authorization ?? '' }, data: { ...body, requestId: crypto.randomUUID() },
    });
    expect(stale.status()).toBe(409);
    stage('MASKED_DENIAL');
    const publisherToken = await publisher.request.post(fixture.baseUrl + '/api/v1/identity/authentication/login', {
      data: { providerType: 'LOCAL', principal: roles.primary, credentials: fixture.password },
    });
    expect(publisherToken.status()).toBe(200);
    const denied = await publisher.request.get(fixture.baseUrl + root + '/' + requestId + '/evidence?' +
      new URLSearchParams({ companyPartyId: scope.companyPartyId }), {
      headers: { Authorization: `Bearer ${(await publisherToken.json()).accessToken}` },
    });
    expect(denied.status()).toBe(404);
    expect(administrativeRequests).toBe(0);
    stage('COMPLETE');
  } finally {
    await Promise.all(contexts.map(context => context.close()));
  }
});
