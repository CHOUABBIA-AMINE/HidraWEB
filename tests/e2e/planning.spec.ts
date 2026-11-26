import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/planning/periods', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/periods/{id}', methods: ['GET'], module: 'planning', resource: 'periods', action: 'read', permission: 'planning:periods:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/operational-plans', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/operational-plans/{id}', methods: ['GET'], module: 'planning', resource: 'operational-plans', action: 'read', permission: 'planning:operational-plans:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/revisions', methods: ['GET'], module: 'planning', resource: 'revisions', action: 'read', permission: 'planning:revisions:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/revisions/{id}', methods: ['GET'], module: 'planning', resource: 'revisions', action: 'read', permission: 'planning:revisions:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/revisions/{revisionId}', methods: ['PATCH'], module: 'planning', resource: 'revisions', action: 'update', permission: 'planning:revisions:update', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/targets', methods: ['GET'], module: 'planning', resource: 'targets', action: 'read', permission: 'planning:targets:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/monitoring/deviations', methods: ['GET'], module: 'monitoring', resource: 'deviations', action: 'read', permission: 'monitoring:deviations:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/revisions/{revisionId}/approval', methods: ['GET'], module: 'planning', resource: 'revisions', action: 'read', permission: 'planning:revisions:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/planning/revisions/{revisionId}/approval/actions/{transitionId}/execute', methods: ['POST'], module: 'planning', resource: 'revisions', action: 'execute', permission: 'planning:revisions:execute', enforcementStatus: 'backend-enforced' },
];
routes.push({ ...routes.find(r => r.route === '/api/v1/planning/targets')!, route: '/api/v1/planning/targets/{id}' });
routes.push({ ...routes.find(r => r.route === '/api/v1/planning/revisions/{id}')!, route: '/api/v1/planning/revisions/{revisionId}/submit', methods: ['POST'], permission: 'planning:revisions:execute', action: 'execute' });
routes.push({ route: '/api/v1/workflow/definitions', methods: ['GET'], module: 'workflow', resource: 'definitions', action: 'read', permission: 'workflow:definitions:read', enforcementStatus: 'backend-enforced' });
const effectivePermissions = ['planning:periods:read', 'planning:operational-plans:read', 'planning:revisions:read', 'planning:revisions:update', 'planning:targets:read', 'monitoring:deviations:read', 'planning:revisions:execute', 'planning:revisions:approve', 'workflow:definitions:read'];
const period = { id: 'period-1', code: 'PLN-2026-Q4', nameFr: 'Planification T4 2026', periodStart: '2026-10-01T00:00:00Z', periodEnd: '2026-12-31T23:59:59Z', timeZone: 'Africa/Algiers', status: 'OPEN', periodTypeId: 'QUARTER', createdByActorId: 'planner-1' };
const plan = { id: 'plan-1', periodId: 'period-1', code: 'OP-2026-Q4-NORTH', nameFr: 'Plan Nord T4', topologyScopeType: 'PIPELINE', topologyScopeId: 'pipe-1', topologyScopeCode: 'PL-NORTH', topologyScopeNameSnapshot: 'Pipeline Nord', status: 'DRAFT', currentRevisionId: 'rev-2', approvedRevisionId: 'rev-1', responsibleOrganizationUnitId: 'org-trc', createdByActorId: 'planner-1' };
const revision = { id: 'rev-2', planId: 'plan-1', revisionNumber: 2, revisionCode: 'R02', baseRevisionId: 'rev-1', status: 'SUBMITTED', changeReasonCodeId: 'OPS_CHANGE', changeReasonText: 'Updated throughput assumptions', submittedAt: '2026-09-12T10:00:00Z', submittedByActorId: 'planner-2', workflowInstanceId: 'wf-plan-2', updatedAt: '2026-09-12T10:10:00Z' };
const approval = {
  revisionId: 'rev-2',
  revisionStatus: 'SUBMITTED',
  workflowInstanceId: 'wf-plan-2',
  workflowInstanceStatus: 'IN_PROGRESS',
  currentTaskId: 'task-plan-2',
  currentTaskUpdatedAt: '2026-09-12T10:05:00Z',
  actions: [{ transitionId: 'transition-approve', decision: 'APPROVE', reasonRequired: false, commentRequired: true, requiredPermissionCode: 'planning:revisions:approve', permitted: true }],
};
const target = { id: 'target-1', revisionId: 'rev-2', telemetryPointId: 'point-1', telemetryPointCodeSnapshot: 'PT-001', targetValue: 100, unitId: 'm3/h', status: 'ACTIVE' };
const deviation = { id: 'dev-1', planTargetId: 'target-1', trustedTelemetryReadingId: 'reading-9', telemetryPointId: 'point-1', actualValue: 105, expectedValue: 100, differenceValue: 5, differencePercent: 5, unitId: 'm3/h', severity: 'HIGH', status: 'OPEN', detectedAt: '2026-10-12T10:30:00Z' };

async function mockPlanning(page: Page, mode: 'submitted' | 'approved' | 'draft' = 'submitted') {
  let currentPlan = { ...plan, updatedAt: '2026-09-12T09:30:00Z', status: mode === 'approved' ? 'ACTIVE' : mode === 'draft' ? 'DRAFT' : 'SUBMITTED', approvedRevisionId: mode === 'approved' ? 'rev-2' : 'rev-1' };
  let currentRevision = { ...revision, status: mode === 'approved' ? 'APPROVED' : mode === 'draft' ? 'DRAFT' : 'SUBMITTED',
    workflowInstanceId: mode === 'draft' ? undefined : revision.workflowInstanceId,
    submittedAt: mode === 'draft' ? undefined : revision.submittedAt,
    submittedByActorId: mode === 'draft' ? undefined : revision.submittedByActorId };
  let currentTarget = { ...target, status: mode === 'approved' ? 'ACTIVE' : 'DRAFT', targetTypeId: 'target-type', validFrom: period.periodStart, validTo: period.periodEnd, updatedAt: '2026-09-12T09:55:00Z' };
  let currentApproval = mode === 'approved' ? { ...approval, revisionStatus: 'APPROVED', workflowInstanceStatus: 'COMPLETED', currentTaskId: undefined, currentTaskUpdatedAt: undefined, actions: [] } : { ...approval };
  let submitAttempts = 0;
  const actor = mode === 'draft' ? 'planner-2' : 'reviewer-2';
  let patchAttempts = 0;

  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me', route => route.fulfill({ json: { userId: actor, username: actor, displayName: actor, authenticationName: actor, authenticationType: 'LOCAL', employeeReferenceId: 'employee-1', authenticationAuthorities: [], effectivePermissions } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));
  await page.route('**/api/v1/planning/periods?**', (route) => route.fulfill({ json: { content: [period], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/planning/periods/period-1', (route) => route.fulfill({ json: period }));
  await page.route('**/api/v1/planning/operational-plans?**', (route) => route.fulfill({ json: { content: [currentPlan], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/planning/operational-plans/plan-1', (route) => route.fulfill({ json: currentPlan }));
  await page.route('**/api/v1/planning/revisions?**', (route) => route.fulfill({ json: { content: [currentRevision], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } }));
  await page.route('**/api/v1/planning/revisions/rev-2', async (route) => {
    const request = route.request();
    if (request.method() !== 'PATCH') {
      await route.fulfill({ json: currentRevision });
      return;
    }

    patchAttempts += 1;
    const body = await request.postDataJSON();
    if (patchAttempts === 1) {
      expect(body).toEqual({
        expectedUpdatedAt: '2026-09-12T10:10:00Z',
        changeReasonCodeId: 'OPS_REBASE',
        changeReasonText: 'First stale attempt',
      });
      currentRevision = {
        ...currentRevision,
        changeReasonCodeId: 'SERVER_CHANGE',
        changeReasonText: 'Changed by another planner',
        updatedAt: '2026-09-12T10:20:00Z',
      };
      await route.fulfill({
        status: 409,
        contentType: 'application/problem+json',
        json: { status: 409, title: 'Conflict', detail: 'Refetch the revision before retrying.', code: 'PLANNING_REVISION_CONFLICT' },
      });
      return;
    }

    expect(body).toEqual({
      expectedUpdatedAt: '2026-09-12T10:20:00Z',
      changeReasonCodeId: 'OPS_REBASE',
      changeReasonText: 'Reviewed after refetch',
    });
    currentRevision = {
      ...currentRevision,
      changeReasonCodeId: 'OPS_REBASE',
      changeReasonText: 'Reviewed after refetch',
      updatedAt: '2026-09-12T10:25:00Z',
    };
    await route.fulfill({ json: currentRevision });
  });
  await page.route('**/api/v1/planning/targets?**', async (route) => {
    const requestUrl = new URL(route.request().url());
    expect(requestUrl.searchParams.get('revisionId')).toBe('rev-2');
    await route.fulfill({ json: { content: [currentTarget], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } });
  });
  await page.route('**/api/v1/planning/targets/target-1', route => route.fulfill({ json: currentTarget }));
  await page.route('**/api/v1/workflow/definitions?**', route => {
    const params = new URL(route.request().url()).searchParams;
    expect(params.get('targetModule')).toBe('planning');
    expect(params.get('targetId')).toBe('rev-2');
    expect(params.get('targetTypeId')).toBe('type-id');
    expect(params.get('workflowPurposeId')).toBe('purpose-id');
    expect(params.get('targetLocator')).toBe('');
    return route.fulfill({ json: [{ id: 'def-1', version: 1, nameFr: 'Revue indépendante', targetModule: 'planning', targetTypeId: 'type-id', workflowPurposeId: 'purpose-id', firstStepId: 'step-1', assignmentChoices: [{ actorId: 'reviewer-2', displayName: 'Reviewer Two' }, { actorId: actor, displayName: 'Self' }] }] });
  });
  await page.route('**/api/v1/planning/revisions/rev-2/submit', async route => {
    submitAttempts++;
    expect(route.request().postDataJSON()).toEqual({ expectedPlanUpdatedAt: currentPlan.updatedAt, expectedRevisionUpdatedAt: currentRevision.updatedAt, definitionId: 'def-1', definitionVersion: 1, targetTypeId: 'type-id', workflowPurposeId: 'purpose-id', reviewerActorId: 'reviewer-2' });
    currentPlan = { ...currentPlan, status: 'SUBMITTED', updatedAt: '2026-09-12T10:30:00Z' };
    currentRevision = { ...currentRevision, status: 'SUBMITTED', updatedAt: '2026-09-12T10:30:00Z', workflowInstanceId: 'wf-plan-2', submittedAt: '2026-09-12T10:30:00Z', submittedByActorId: actor };
    currentApproval = { ...approval, actions: approval.actions.map(a => ({ ...a, permitted: false })) };
    await route.fulfill({ json: { revisionId: 'rev-2', revisionStatus: 'SUBMITTED', planUpdatedAt: currentPlan.updatedAt, revisionUpdatedAt: currentRevision.updatedAt, workflowInstanceId: 'wf-plan-2', workflowTaskId: currentApproval.currentTaskId, workflowTaskUpdatedAt: currentApproval.currentTaskUpdatedAt } });
  });
  await page.route('**/api/v1/monitoring/deviations?**', async (route) => {
    const requestUrl = new URL(route.request().url());
    expect(requestUrl.searchParams.get('planTargetId')).toBe('target-1');
    expect(requestUrl.searchParams.get('page')).toBe('0');
    expect(requestUrl.searchParams.get('size')).toBe('50');
    await route.fulfill({ json: { content: [deviation], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false } });
  });
  await page.route('**/api/v1/planning/revisions/rev-2/approval', (route) => route.fulfill({ json: currentApproval }));
  await page.route('**/api/v1/planning/revisions/rev-2/approval/actions/transition-approve/execute', async (route) => {
    const request = route.request();
    expect(request.method()).toBe('POST');
    expect(await request.postDataJSON()).toEqual({
      expectedTaskUpdatedAt: '2026-09-12T10:05:00Z',
      commentText: 'Approved in browser test.',
    });
    currentPlan = { ...currentPlan, status: 'ACTIVE', approvedRevisionId: 'rev-2' };
    currentRevision = { ...currentRevision, status: 'APPROVED', approvedByActorId: actor } as typeof currentRevision;
    currentTarget = { ...currentTarget, status: 'ACTIVE' };
    currentApproval = { ...approval, revisionStatus: 'APPROVED', workflowInstanceStatus: 'COMPLETED', currentTaskId: undefined, currentTaskUpdatedAt: undefined, actions: [] };
    await route.fulfill({ json: { revisionId: 'rev-2', revisionStatus: 'APPROVED', workflowInstanceId: 'wf-plan-2', workflowInstanceStatus: 'COMPLETED', transitionId: 'transition-approve', decision: 'APPROVE', executedAt: '2026-09-12T10:06:00Z' } });
  });

  return { patchAttempts: () => patchAttempts, submitAttempts: () => submitAttempts };
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('planner');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openRevision(page: Page) {
  await page.getByRole('button', { name: 'Planification' }).click();
  await page.getByRole('tab', { name: 'Operational plans' }).click();
  await expect(page.getByText('OP-2026-Q4-NORTH')).toBeVisible();
  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByRole('heading', { name: 'Revision history' })).toBeVisible();
  await page.getByRole('button', { name: 'Open revision' }).click();
}

test('HWEB-010-04 executes only backend-published revision approval actions with the authoritative task version', async ({ page }) => {
  await mockPlanning(page);
  await signIn(page);
  await openRevision(page);
  await expect(page.getByRole('heading', { name: 'Revision approval' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open workflow context' })).toHaveAttribute('href', '/work/tasks?instanceId=wf-plan-2');
  await expect(page.getByRole('link', { name: 'Open topology context' })).toHaveAttribute('href', '/network?query=PL-NORTH');
  await expect(page.getByText('task-plan-2')).toBeVisible();
  await page.getByRole('button', { name: 'APPROVE' }).click();
  await page.getByLabel('Comment').fill('Approved in browser test.');
  await page.getByRole('button', { name: 'Execute APPROVE' }).click();
  await expect(page.getByText('APPROVE · revision APPROVED')).toBeVisible();
});

test('HWEB-010-05 requests and renders monitoring-owned planned-vs-actual values by exact planTargetId', async ({ page }) => {
  await mockPlanning(page, 'approved');
  await signIn(page);
  await openRevision(page);
  await expect(page.getByRole('heading', { name: 'Planned vs actual' })).toBeVisible();
  await page.getByLabel('Plan target').click();
  await page.getByRole('option', { name: /target-1 · PT-001 · 100 m3\/h/ }).click();
  const comparison = page.getByRole('table', { name: 'Planned versus actual deviations' });
  await expect(comparison).toContainText('105');
  await expect(comparison).toContainText('100');
  await expect(comparison).toContainText('5');
  await expect(comparison).toContainText('m3/h');
  await expect(comparison).toContainText('HIGH');
  await expect(comparison).toContainText('OPEN');
  await expect(comparison).toContainText('reading-9');
});

test('HWEB-010-06 refetches after stale revision conflict and retries only with the refreshed backend token', async ({ page }) => {
  const mock = await mockPlanning(page, 'draft');
  await signIn(page);
  await openRevision(page);

  await expect(page.getByRole('heading', { name: 'Revision metadata update' })).toBeVisible();
  await expect(page.getByText('Authoritative version: 2026-09-12T10:10:00Z')).toBeVisible();
  await page.getByLabel('Change reason code').fill('OPS_REBASE');
  await page.getByLabel('Change reason', { exact: true }).fill('First stale attempt');
  await page.getByRole('button', { name: 'Save revision metadata' }).click();

  await expect(page.getByText(/rejected a stale revision/i)).toBeVisible();
  await expect(page.getByText('Authoritative version: 2026-09-12T10:20:00Z')).toBeVisible();
  expect(mock.patchAttempts()).toBe(1);

  await page.getByLabel('Change reason code').fill('OPS_REBASE');
  await page.getByLabel('Change reason', { exact: true }).fill('Reviewed after refetch');
  await page.getByRole('button', { name: 'Save revision metadata' }).click();

  await expect(page.getByText(/New version: 2026-09-12T10:25:00Z/)).toBeVisible();
  expect(mock.patchAttempts()).toBe(2);
});

test('UXR-29 submits a current draft once using discovered independent reviewer and both owner tokens', async ({ page }) => {
  const mock = await mockPlanning(page, 'draft');
  await signIn(page);
  await openRevision(page);
  await page.getByLabel('ID type cible configuré').fill('type-id');
  await page.getByLabel('ID finalité workflow configurée').fill('purpose-id');
  await page.getByRole('button', { name: 'Lire le projet et les processus autorisés' }).click();
  await page.getByLabel('Processus de revue').click();
  await page.getByRole('option', { name: 'Revue indépendante · 1' }).click();
  await page.getByLabel('Réviseur indépendant').click();
  await expect(page.getByRole('option', { name: 'Self' })).toHaveCount(0);
  await page.getByRole('option', { name: 'Reviewer Two' }).click();
  await expect(page.getByRole('button', { name: 'Soumettre la révision' })).toBeDisabled();
  await page.getByRole('checkbox', { name: /Je confirme la soumission/ }).check();
  await page.getByRole('button', { name: 'Soumettre la révision' }).click();
  await expect(page.getByText('Soumission enregistrée et vérifiée par HidraAPI.')).toBeVisible();
  await openRevision(page);
  await expect(page.getByText('Status: SUBMITTED').last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'APPROVE' })).toHaveCount(0);
  expect(mock.submitAttempts()).toBe(1);
});
