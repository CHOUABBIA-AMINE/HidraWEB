import { expect, test, type Page } from '@playwright/test';
import type {
  PressureRestrictionDecisionEvidence,
  PressureRestrictionPublicationDecisionReference,
  PressureRestrictionPublicationInputs,
  PressureRestrictionRequest,
  PressureRestrictionSubmission,
  QualifiedOperatingConstraintView,
} from '../../src/api/generated/topology/model';
import type { TaskView, WorkflowTransitionExecutionResponse, ExecuteWorkflowTransitionRequest } from '../../src/api/generated/workflow/model';

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
  'PERMISSION_ROUTES' | 'DISCOVERY' | 'FOREIGN_DISCOVERY' | 'T33' |
  'REVIEW_INBOX' | 'REVIEW_TASK' | 'REVIEW_INSTANCE' | 'REVIEW_ACTIONS' | 'REVIEW_TIMELINE' |
  'REVIEW_PROPOSAL' | 'REVIEW_EXECUTE' | 'PUBLICATION_INPUTS' | 'PUBLICATION' |
  'LIMIT_READBACK' | 'DECISION_EVIDENCE' | 'REVIEW_TARGET' | 'REVIEW_DEFINITIONS' |
  'REVIEW_START' | 'REVIEW_ASSIGN', code: number) => {
  process.stdout.write(`UXR26_HTTP=${operation}:${code}\n`);
};

const check = (name: 'COMMAND_MATCH' | 'READBACK_MATCH' | 'READBACK_VERSION' |
  'READBACK_ACTOR' | 'UI_SUCCESS' | 'UI_UNVERIFIED' | 'BROWSER_ERROR', passed: boolean) => {
  process.stdout.write(`UXR26_CHECK=${name}:${passed ? 1 : 0}\n`);
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
    // Observe only fixed endpoint categories and status codes, never identifiers,
    // response bodies, raw errors or bearer material. Covers later gates too.
    for (const reviewer of reviewers) reviewer.on('pageerror', () => check('BROWSER_ERROR', true));
    for (const reviewer of reviewers) reviewer.on('response', result => {
      const path = new URL(result.url()).pathname;
      const method = result.request().method();
      if (method === 'GET') {
        if (path === '/api/v1/workflow/tasks') status('REVIEW_INBOX', result.status());
        else if (/^\/api\/v1\/workflow\/tasks\/[^/]+$/.test(path)) status('REVIEW_TASK', result.status());
        else if (/^\/api\/v1\/workflow\/tasks\/[^/]+\/available-actions$/.test(path)) status('REVIEW_ACTIONS', result.status());
        else if (/^\/api\/v1\/workflow\/instances\/[^/]+$/.test(path)) status('REVIEW_INSTANCE', result.status());
        else if (/^\/api\/v1\/workflow\/instances\/[^/]+\/timeline$/.test(path)) status('REVIEW_TIMELINE', result.status());
        else if (/^\/api\/v1\/topology\/operating-constraints\/pressure-restriction-review-proposals\/[^/]+$/.test(path)) status('REVIEW_PROPOSAL', result.status());
      } else if (method === 'POST' && /^\/api\/v1\/workflow\/tasks\/[^/]+\/transitions\/[^/]+\/execute$/.test(path)) {
        status('REVIEW_EXECUTE', result.status());
      }
    });
    for (const page of [author, publisher, readback]) page.on('response', result => {
      const path = new URL(result.url()).pathname;
      const method = result.request().method();
      if (method === 'GET' && path === '/api/v1/workflow/definitions/pressure-restriction-target') status('REVIEW_TARGET', result.status());
      else if (method === 'GET' && path === '/api/v1/workflow/definitions') status('REVIEW_DEFINITIONS', result.status());
      else if (method === 'POST' && path === '/api/v1/workflow/instances') status('REVIEW_START', result.status());
      else if (method === 'POST' && path === '/api/v1/workflow/tasks') status('REVIEW_ASSIGN', result.status());
      else if (method === 'GET' && path.endsWith('/publication-inputs')) status('PUBLICATION_INPUTS', result.status());
      else if (method === 'POST' && path.endsWith('/publication')) status('PUBLICATION', result.status());
      else if (method === 'GET' && path.endsWith('/evidence')) status('DECISION_EVIDENCE', result.status());
      else if (method === 'GET' && /^\/api\/v1\/topology\/operating-constraints\/pipelines\/[^/]+$/.test(path)) status('LIMIT_READBACK', result.status());
    });
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
    const approvals = new Map<string, PressureRestrictionPublicationDecisionReference>();
    for (const [index, candidate] of proposal.candidates!.entries()) {
      const reviewer = reviewers[index];
      stage(`REVIEW_${index + 1}_SELECT_CANDIDATE`);
      await pickById(author, 'Restriction candidate', candidate.candidateId!);
      stage(`REVIEW_${index + 1}_DISCOVER`);
      await author.getByRole('button', { name: 'Discover review definitions' }).click();
      await pickById(author, 'Review definition', workflowBinding.definitionId);
      await pickById(author, 'Independent reviewer', roles.reviewer);
      stage(`REVIEW_${index + 1}_START`);
      const instance = response(author, '/workflow/instances', 'POST');
      await author.getByRole('button', { name: 'Start restriction review' }).click();
      const started = await instance;
      expect(started.status()).toBe(200);
      const startedInstance = await started.json();
      expect(Boolean(startedInstance.id) && startedInstance.targetId === candidate.candidateId &&
        startedInstance.definitionId === workflowBinding.definitionId).toBe(true);
      stage(`REVIEW_${index + 1}_ASSIGN`);
      const task = response(author, '/workflow/tasks', 'POST');
      await author.getByRole('button', { name: 'Assign restriction review' }).click();
      const result = await task;
      expect(result.status()).toBe(200);
      const assigned = await result.json();
      const taskId: string = assigned.id;
      expect(Boolean(taskId) && assigned.instanceId === startedInstance.id &&
        assigned.assignedActorId === roles.reviewer && assigned.status === 'OPEN').toBe(true);
      await expect(author.getByText(`Assigned task · ${taskId}`, { exact: true })).toBeVisible();
      const url = `/work/tasks?taskId=${encodeURIComponent(taskId)}`;
      stage(`REVIEW_${index + 1}_LOGIN`);
      const exactProposal = reviewer.waitForResponse(result => {
        const address = new URL(result.url());
        return address.pathname === '/api/v1/topology/operating-constraints/pressure-restriction-review-proposals/' +
          encodeURIComponent(candidate.candidateId!) && address.searchParams.get('taskId') === taskId &&
          address.searchParams.get('targetLocator') === candidate.workflowLocator && result.request().method() === 'GET';
      });
      // Attach a rejection handler immediately to avoid an unhandled rejection if
      // session navigation itself fails before the protected read is issued.
      const proposalResult = exactProposal.then(result => ({ result }), () => ({ result: undefined }));
      await openSession(reviewer, roles.reviewer, fixture.password, url);
      const { result: reviewed } = await proposalResult;
      expect(Boolean(reviewed), 'Exact owner proposal GET must be issued for the assigned task').toBe(true);
      expect(reviewed!.status()).toBe(200);
      const reviewedProposal = await reviewed!.json();
      expect(reviewedProposal.candidateId === candidate.candidateId && reviewedProposal.requestId === requestId).toBe(true);
      await expect(reviewer.getByRole('heading', { name: 'Exact pressure restriction proposal' })).toBeVisible();
      await expect(reviewer.getByText(`Request · ${requestId}`, { exact: true })).toBeVisible();
      if (candidate.kind === 'REVISION') await expect(reviewer.getByText(/Proposed upper pressure · 53 bar/)).toBeVisible();
      stage(`REVIEW_${index + 1}_DECISION`);
      await reviewer.getByRole('button', { name: 'APPROVE', exact: true }).click();
      await expect(reviewer.getByRole('button', { name: 'Action: APPROVE' })).toBeDisabled();
      await reviewer.getByRole('checkbox', { name: 'I confirm this decision after reviewing the current task.' }).check();
      // Observe the actual UI-issued command and its subsequent task readback.
      // A 200 status alone does not prove the readback predicate or the banner.
      const taskPath = '/api/v1/workflow/tasks/' + encodeURIComponent(taskId);
      let commandObserved = false;
      const execution = reviewer.waitForResponse(result => {
        const path = new URL(result.url()).pathname;
        if (result.request().method() !== 'POST' || !path.startsWith(taskPath + '/transitions/') ||
          !path.endsWith('/execute')) return false;
        commandObserved = true;
        return true;
      }).then(result => ({ result }), () => ({ result: undefined }));
      const readbackResult = reviewer.waitForResponse(result =>
        commandObserved && result.request().method() === 'GET' &&
        new URL(result.url()).pathname === taskPath,
      ).then(result => ({ result }), () => ({ result: undefined }));
      await reviewer.getByRole('button', { name: 'Action: APPROVE' }).click();
      const { result: executed } = await execution;
      expect(Boolean(executed), 'The exact review command must be issued by the browser').toBe(true);
      expect(executed!.status()).toBe(200);
      const command = executed!.request().postDataJSON() as ExecuteWorkflowTransitionRequest;
      const decision = await executed!.json() as WorkflowTransitionExecutionResponse;
      const commandMatch = decision.taskId === taskId && decision.instanceId === startedInstance.id &&
        decision.decision === 'APPROVE' && decision.taskStatus === 'APPROVED' &&
        decision.instanceStatus === 'COMPLETED' && Boolean(decision.actionId);
      check('COMMAND_MATCH', commandMatch);
      expect(commandMatch).toBe(true);
      approvals.set(candidate.candidateId!, {
        candidateId: candidate.candidateId, instanceId: decision.instanceId, taskId, actionId: decision.actionId,
      });
      stage(`REVIEW_${index + 1}_READBACK`);
      const { result: persistedResponse } = await readbackResult;
      expect(Boolean(persistedResponse), 'The frontend must read the task after the command').toBe(true);
      expect(persistedResponse!.status()).toBe(200);
      const persisted = await persistedResponse!.json() as TaskView;
      const readbackMatch = persisted.id === taskId && persisted.instanceId === decision.instanceId &&
        persisted.status === decision.taskStatus;
      const readbackVersion = Boolean(persisted.updatedAt && command.expectedTaskUpdatedAt &&
        persisted.updatedAt !== command.expectedTaskUpdatedAt);
      const readbackActor = persisted.completedByActorId === roles.reviewer && Boolean(persisted.completedAt);
      check('READBACK_MATCH', readbackMatch);
      check('READBACK_VERSION', readbackVersion);
      check('READBACK_ACTOR', readbackActor);
      expect(readbackMatch && readbackVersion && readbackActor).toBe(true);
      const success = reviewer.getByText('APPROVE · APPROVED', { exact: true });
      try {
        await expect(success).toBeVisible();
      } finally {
        check('UI_SUCCESS', await success.isVisible().catch(() => false));
        check('UI_UNVERIFIED', await reviewer.getByText(
          'Command submitted, but the persisted state could not be verified. Refresh the task before proceeding.',
          { exact: true }).isVisible().catch(() => false));
      }
      // The success banner is durable task readback, but post-success query
      // invalidation may still be running. Wait for the real completion control
      // before releasing this actor's context and starting another assignment.
      const closeReview = reviewer.getByRole('button', { name: 'Close', exact: true });
      await expect(closeReview).toBeEnabled({ timeout: 90_000 });
      await expect(reviewer.getByRole('heading', { name: 'Exact pressure restriction proposal' })).toHaveCount(0);
      await reviewer.context().close();
      stage(`REVIEW_${index + 1}_DONE`);
    }
    stage('PUBLISHER_LOGIN');
    await openSession(publisher, roles.primary, fixture.password, '/overview');
    stage('PUBLISHER_SCOPE');
    await openDossier(publisher, scope.companyPartyId, scope.pipelineId, fixture.scopeRegistryId);
    stage('PUBLISHER_PUBLISH');
    await publisher.getByLabel('Restriction request ID').fill(requestId);
    const [inputsResponse] = await Promise.all([
      response(publisher, root + '/' + requestId + '/publication-inputs', 'GET'),
      publisher.getByRole('button', { name: 'Read publication inputs' }).click(),
    ]);
    expect(inputsResponse.status()).toBe(200);
    expect(new URL(inputsResponse.url()).searchParams.get('companyPartyId') === scope.companyPartyId).toBe(true);
    const inputs = await inputsResponse.json() as PressureRestrictionPublicationInputs;
    expect(inputs.requestId === requestId && inputs.expectedVersion === currentPublication.streamVersion &&
      !inputs.publication).toBe(true);
    const references = inputs.decisions ?? [];
    expect(references).toHaveLength(2);
    expect(new Set(references.map(item => item.candidateId)).size).toBe(2);
    expect(references.every(item => {
      const approved = approvals.get(item.candidateId!);
      return approved !== undefined && approved.taskId === item.taskId &&
        approved.instanceId === item.instanceId && approved.actionId === item.actionId;
    })).toBe(true);
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
    const [persistedInputsResponse] = await Promise.all([
      response(readback, root + '/' + requestId + '/publication-inputs', 'GET'),
      readback.getByRole('button', { name: 'Read publication inputs' }).click(),
    ]);
    expect(persistedInputsResponse.status()).toBe(200);
    const persistedInputs = await persistedInputsResponse.json() as PressureRestrictionPublicationInputs;
    const receipt = persistedInputs.publication;
    expect(receipt?.requestId === requestId && Boolean(receipt.revisionId) &&
      receipt.streamVersion === currentPublication.streamVersion + 1).toBe(true);
    await expect(readback.getByText(new RegExp(`Publication receipt · ${requestId}`))).toBeVisible();
    stage('READBACK_LIMIT');
    const readLimits = readback.getByRole('button', { name: 'Read operating limits', exact: true });
    const limitsForm = readback.locator('form').filter({ has: readLimits });
    await limitsForm.getByRole('textbox', { name: /^Condition code(?:\s*\*)?$/ }).fill(condition);
    await limitsForm.getByRole('textbox', { name: /^Effective instant \(UTC, ISO 8601\)(?:\s*\*)?$/ }).fill(instant);
    const [limitResponse] = await Promise.all([
      response(readback, '/api/v1/topology/operating-constraints/pipelines/' + encodeURIComponent(scope.pipelineId), 'GET'),
      readLimits.click(),
    ]);
    expect(limitResponse.status()).toBe(200);
    const limitQuery = new URL(limitResponse.url()).searchParams;
    expect(limitQuery.get('companyPartyId') === scope.companyPartyId &&
      limitQuery.get('conditionCode') === condition && limitQuery.get('effectiveAt') === instant).toBe(true);
    const limit = await limitResponse.json() as QualifiedOperatingConstraintView;
    expect(limit.status === 'QUALIFIED' && limit.scopeType === 'PIPELINE' && limit.pipelineId === scope.pipelineId &&
      limit.conditionCode === condition && limit.revisionId === receipt?.revisionId).toBe(true);
    expect(limit.upperPressure).toBe(53);
    expect(limit.pressureUnit).toBe('bar');
    await expect(readback.getByText(/^Qualified pipeline limit · 53 bar(?: ·|$)/)).toBeVisible();
    stage('AUDIT_READBACK');
    const [ownerEvidenceResponse] = await Promise.all([
      response(author, root + '/' + requestId + '/evidence', 'GET'),
      author.getByRole('button', { name: 'Read decision evidence' }).click(),
    ]);
    expect(ownerEvidenceResponse.status()).toBe(200);
    const ownerEvidence = await ownerEvidenceResponse.json() as PressureRestrictionDecisionEvidence;
    await expect(author.getByText(/Approval · .* · Audit ·/)).toHaveCount(2);

    stage('STALE_CONFLICT');
    const authorization = await submitted.request().headerValue('authorization');
    expect(authorization).toMatch(/^Bearer /);
    const stale = await author.request.post(fixture.baseUrl + root, {
      headers: { Authorization: authorization ?? '' }, data: { ...body, requestId: crypto.randomUUID() },
    });
    expect(stale.status()).toBe(409);
    // UXR-27: reuse the exact signed C1 fixture to exercise the independent Audit
    // workspace, without granting generic workbench access or adding a mock.
    async function auditTrace(page: Page) {
      await page.evaluate(() => {
        window.history.pushState({}, '', '/administration/audit');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await expect(page.getByRole('heading', { name: 'Pressure decision trace' })).toBeVisible();
      await page.getByRole('textbox', { name: /^Evidence company ID(?:\s*\*)?$/ }).fill(scope.companyPartyId);
      await page.getByRole('textbox', { name: /^Evidence pipeline ID(?:\s*\*)?$/ }).fill(scope.pipelineId);
      await page.getByRole('textbox', { name: /^Evidence restriction request ID(?:\s*\*)?$/ }).fill(requestId);
      const [result] = await Promise.all([
        response(page, root + '/' + requestId + '/evidence', 'GET'),
        page.getByRole('button', { name: 'Read pressure decision trace' }).click(),
      ]);
      return result;
    }
    const auditTraceResponse = await auditTrace(author);
    expect(auditTraceResponse.status()).toBe(200);
    const trace = await auditTraceResponse.json() as PressureRestrictionDecisionEvidence;
    expect(JSON.stringify(trace) === JSON.stringify(ownerEvidence)).toBe(true);
    expect(trace.publication?.revisionId === receipt?.revisionId).toBe(true);
    expect(trace.decisions?.length).toBe(2);
    for (const witness of trace.decisions ?? []) {
      expect(Boolean(witness.auditEventId && witness.actionId)).toBe(true);
      await expect(author.getByText('Audit witness · ' + witness.auditEventId, { exact: true })).toBeVisible();
    }
    stage('MASKED_DENIAL');
    const deniedTrace = await auditTrace(publisher);
    expect(deniedTrace.status()).toBe(404);
    await expect(publisher.getByText('Audit evidence unavailable or not authorized.', { exact: true })).toBeVisible();
    await expect(publisher.getByRole('group', { name: 'Pressure decision witnesses' })).toHaveCount(0);
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
