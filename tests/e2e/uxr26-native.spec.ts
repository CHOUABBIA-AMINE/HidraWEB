import { expect, test, type Page } from '@playwright/test';
import type { PressureRestrictionRequest, PressureRestrictionSubmission } from '../../src/api/generated/topology/model';

interface Fixture {
  baseUrl: string;
  password: string;
  scopeRegistryId: string;
  receipt: {
    roles: Record<'author' | 'reviewer' | 'primary', string>;
    scope: { companyPartyId: string; pipelineId: string };
    currentPublication: { revisionId: string };
  };
}

async function openSession(page: Page, username: string, password: string, target: string) {
  await page.goto(target);
  await page.getByLabel(/^Username(?:\s*\*)?$/).fill(username);
  await page.getByLabel(/^Password(?:\s*\*)?$/).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

async function openDossier(page: Page, companyPartyId: string, pipelineId: string, scopeRegistryId: string) {
  await page.getByRole('button', { name: /Operational context/ }).click();
  await page.getByRole('textbox', { name: 'Company ID' }).fill(companyPartyId);
  await page.getByRole('combobox', { name: 'Assigned resource' }).click();
  await page.getByRole('option').and(page.locator(`[data-value="${scopeRegistryId}"]`)).click();
  await page.getByRole('button', { name: 'Verify and apply' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
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

const response = (page: Page, path: string, method: string) => page.waitForResponse(
  result => new URL(result.url()).pathname.endsWith(path) && result.request().method() === method,
);

test('UXR-26 verifies separate signed author, reviewer and publisher in Chromium', async ({ browser }) => {
  const fixtureJson = process.env.HIDRA_UXR26_FIXTURE_JSON;
  if (!fixtureJson) throw new Error('Requires the private, test-owned synthetic browser input.');
  const fixture = JSON.parse(fixtureJson) as Fixture;
  expect(fixture.scopeRegistryId).toMatch(/^\d+$/);
  expect(fixture.baseUrl).toBe(process.env.HIDRA_UXR26_API_URL);
  const { roles, scope, currentPublication } = fixture.receipt;
  expect(new Set([roles.author, roles.reviewer, roles.primary]).size).toBe(3);
  const contexts = await Promise.all(Array.from({ length: 5 }, () => browser.newContext()));
  try {
    const [author, firstReviewer, secondReviewer, publisher, readback] = await Promise.all(contexts.map(context => context.newPage()));
    const reviewers = [firstReviewer, secondReviewer];
    await openSession(author, roles.author, fixture.password, '/overview');
    await openDossier(author, scope.companyPartyId, scope.pipelineId, fixture.scopeRegistryId);
    const root = `/api/v1/topology/operating-constraints/pipelines/${scope.pipelineId}/restriction-requests`;
    const condition = 'T38-NOMINAL';
    await author.getByLabel('Restriction condition').fill(condition);
    const stream = response(author, root + '/stream', 'GET');
    await author.getByRole('button', { name: 'Read stream version' }).click();
    expect((await stream).status()).toBe(200);
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
      await pick(author, 'Restriction candidate', new RegExp(candidate.candidateId!));
      await author.getByRole('button', { name: 'Discover review definitions' }).click();
      await pick(author, 'Review definition', 'Synthetic GZ2 review');
      await pick(author, 'Independent reviewer', 'Synthetic GZ2 reviewer');
      const instance = response(author, '/workflow/instances', 'POST');
      await author.getByRole('button', { name: 'Start restriction review' }).click();
      expect((await instance).status()).toBe(200);
      const task = response(author, '/workflow/tasks', 'POST');
      await author.getByRole('button', { name: 'Assign restriction review' }).click();
      const result = await task;
      expect(result.status()).toBe(200);
      const taskId: string = (await result.json()).id;
      const url = `/work/tasks?taskId=${encodeURIComponent(taskId)}`;
      await openSession(reviewer, roles.reviewer, fixture.password, url);
      await expect(reviewer.getByRole('heading', { name: 'Exact pressure restriction proposal' })).toBeVisible();
      await expect(reviewer.getByText(`Request · ${requestId}`, { exact: true })).toBeVisible();
      if (candidate.kind === 'REVISION') await expect(reviewer.getByText(/Proposed upper pressure · 53 bar/)).toBeVisible();
      await reviewer.getByRole('button', { name: 'APPROVE', exact: true }).click();
      await expect(reviewer.getByRole('button', { name: 'Action: APPROVE' })).toBeDisabled();
      await reviewer.getByRole('checkbox', { name: 'I confirm this decision after reviewing the current task.' }).check();
      await reviewer.getByRole('button', { name: 'Action: APPROVE' }).click();
      await expect(reviewer.getByText('APPROVE · APPROVED')).toBeVisible();
    }
    await openSession(publisher, roles.primary, fixture.password, '/overview');
    await openDossier(publisher, scope.companyPartyId, scope.pipelineId, fixture.scopeRegistryId);
    await publisher.getByLabel('Restriction request ID').fill(requestId);
    await publisher.getByRole('button', { name: 'Read publication inputs' }).click();
    await expect(publisher.getByText(/Eligible approvals · 2/)).toBeVisible();
    await expect(publisher.getByRole('button', { name: 'Publish restriction' })).toBeDisabled();
    await publisher.getByRole('checkbox', { name: 'Confirm publishing this exact restriction request' }).check();
    await publisher.getByRole('button', { name: 'Publish restriction' }).click();
    await expect(publisher.getByText(new RegExp(`Publication receipt · ${requestId}`))).toBeVisible();
    await openSession(readback, roles.primary, fixture.password, '/overview');
    await openDossier(readback, scope.companyPartyId, scope.pipelineId, fixture.scopeRegistryId);
    await readback.getByLabel('Restriction request ID').fill(requestId);
    await readback.getByRole('button', { name: 'Read publication inputs' }).click();
    await expect(readback.getByText(new RegExp(`Publication receipt · ${requestId}`))).toBeVisible();
    await readback.getByLabel('Condition code', { exact: true }).fill(condition);
    await readback.getByLabel('Effective instant (UTC, ISO 8601)', { exact: true }).fill(instant);
    await readback.getByRole('button', { name: 'Read operating limits' }).click();
    await expect(readback.getByText(/Qualified pipeline limit · 53 bar/)).toBeVisible();
    await author.getByRole('button', { name: 'Read decision evidence' }).click();
    await expect(author.getByText(/Approval · .* · Audit ·/)).toHaveCount(2);

    const authorization = await submitted.request().headerValue('authorization');
    expect(authorization).toMatch(/^Bearer /);
    const stale = await author.request.post(fixture.baseUrl + root, {
      headers: { Authorization: authorization ?? '' }, data: { ...body, requestId: crypto.randomUUID() },
    });
    expect(stale.status()).toBe(409);
    const publisherToken = await publisher.request.post(fixture.baseUrl + '/api/v1/identity/authentication/login', {
      data: { providerType: 'LOCAL', principal: roles.primary, credentials: fixture.password },
    });
    expect(publisherToken.status()).toBe(200);
    const denied = await publisher.request.get(fixture.baseUrl + root + '/' + requestId + '/evidence?' +
      new URLSearchParams({ companyPartyId: scope.companyPartyId }), {
      headers: { Authorization: `Bearer ${(await publisherToken.json()).accessToken}` },
    });
    expect(denied.status()).toBe(404);
  } finally {
    await Promise.all(contexts.map(context => context.close()));
  }
});
