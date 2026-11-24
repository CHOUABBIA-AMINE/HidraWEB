import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';

const scopeBase = '/api/v1/audit/companies/{companyId}/facilities/{facilityId}';
const pressureRoute = '/api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/evidence';
const routes = [
  { route: '/api/v1/workbench/{module}/resources', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/search', methods: ['POST'], module: 'workbench', resource: 'resources', action: 'search', permission: 'workbench:resources:search', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/audit/exports', methods: ['POST'], module: 'audit', resource: 'exports', action: 'execute', permission: 'audit:exports:execute', enforcementStatus: 'backend-enforced' },
  { route: pressureRoute, methods: ['GET'], module: 'topology', resource: 'operating-constraints', action: 'read', permission: 'topology:operating-constraints:read', enforcementStatus: 'backend-enforced' },
  ...[['/events','GET'], ['/exports','POST'], ['/exports/{exportId}','GET'], ['/exports/{exportId}/content','GET']].map(([suffix, method]) => ({
    route: scopeBase + suffix, methods: [method], module: 'audit', resource: 'companies', action: 'read', permission: 'audit:companies:read', enforcementStatus: 'native-owner-delegated',
  })),
];

const descriptor = {
  module: 'audit',
  resource: 'audit-event',
  entityName: 'AuditEvent',
  javaType: 'dz.sh.hidra.modules.audit.infrastructure.persistence.entity.AuditEventJpaEntity',
  tableName: 'hidra_audit_event',
  idField: 'id',
  searchableFields: ['actionCode', 'actorDisplayNameSnapshot', 'sourceModule', 'targetType', 'targetId', 'correlationId'],
  listEndpoint: '/api/v1/workbench/audit/audit-event',
  detailEndpoint: '/api/v1/workbench/audit/audit-event/{id}',
  searchEndpoint: '/api/v1/workbench/audit/audit-event/search',
};

async function mockAudit(page: Page, grants = ['workbench:resources:read', 'audit:exports:execute']) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: grants }));
  await page.route('**/api/v1/workbench/audit/resources', (route) => route.fulfill({ json: [descriptor] }));
  await page.route('**/api/v1/workbench/audit/audit-event?**', (route) => {
    const url = new URL(route.request().url());
    const q = url.searchParams.get('q');
    route.fulfill({
      json: {
        module: 'audit',
        resource: 'audit-event',
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
        items: [{
          module: 'audit',
          resource: 'audit-event',
          id: 'audit-1',
          attributes: {
            occurredAt: '2026-09-13T11:00:00Z',
            actorDisplayNameSnapshot: 'Operator A',
            actionCode: q ? `SEARCH:${q}` : 'APPROVE',
            sourceModule: 'workflow',
            targetType: 'TELEMETRY_READING',
            targetId: 'reading-42',
            operation: 'APPROVE',
            eventStatus: 'SEALED',
            correlationId: 'corr-1',
          },
        }],
      },
    });
  });
  await page.route('**/api/v1/workbench/audit/audit-event/audit-1', (route) => route.fulfill({
    json: {
      module: 'audit',
      resource: 'audit-event',
      id: 'audit-1',
      attributes: {
        actionCode: 'APPROVE',
        sourceModule: 'workflow',
        targetId: 'reading-42',
        correlationId: 'corr-1',
      },
    },
  }));
  await page.route('**/api/v1/audit/exports', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({
      requestedByActorId: 'e2e-playwright-user',
      requestedByDisplayNameSnapshot: 'Playwright User',
      purposeId: 'investigation',
      filterJson: '{"sourceModule":"workflow"}',
      format: 'CSV',
      workflowInstanceId: 'wf-1',
    });
    await route.fulfill({
      json: {
        id: 'export-1',
        requestedByActorId: 'e2e-playwright-user',
        purposeId: 'investigation',
        format: 'CSV',
        status: 'REQUESTED',
        recordCount: null,
        requestedAt: '2026-09-13T11:05:00Z',
        completedAt: null,
      },
    });
  });
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('audit-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openAuditWorkspace(page: Page) {
  await page.evaluate(() => {
    window.history.pushState({}, '', '/administration/audit');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

test('HWEB-014-01 searches runtime audit evidence and submits only the exact export-request contract', async ({ page }) => {
  await mockAudit(page);
  await signIn(page);
  await openAuditWorkspace(page);

  await expect(page.getByRole('heading', { name: 'Audit evidence' })).toBeVisible();
  await expect(page.getByText('Operator A', { exact: true })).toBeVisible();

  await page.getByLabel('Search audit evidence').fill('corr-1');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('SEARCH:corr-1')).toBeVisible();

  await expect(page.getByLabel('Requested by actor ID')).toHaveValue('e2e-playwright-user');
  await expect(page.getByLabel('Requested by actor ID')).toBeDisabled();
  await expect(page.getByLabel('Requested by display name snapshot')).toHaveValue('Playwright User');
  await page.getByLabel('Purpose ID').fill('investigation');
  await page.getByLabel('Format').fill('CSV');
  await page.getByLabel('Filter JSON').fill('{"sourceModule":"workflow"}');
  await page.getByLabel('Workflow instance ID').fill('wf-1');
  await page.getByRole('button', { name: 'Request export' }).click();

  await expect(page.getByText(/Export request export-1 recorded with status REQUESTED/)).toBeVisible();
  await expect(page.getByRole('button', { name: /download/i })).toHaveCount(0);
});

test('HWEB-014-01 fails closed for export when the exact POST grant is absent', async ({ page }) => {
  await mockAudit(page, ['workbench:resources:read']);
  await signIn(page);
  await openAuditWorkspace(page);

  await expect(page.getByText('Your current HidraAPI grants do not allow audit export requests.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Request export' })).toBeDisabled();
});

test('HWEB-014-01 fails closed when generic audit read grants are absent', async ({ page }) => {
  await mockAudit(page, ['audit:exports:execute']);
  await signIn(page);
  await openAuditWorkspace(page);

  await expect(page.getByText('Your current HidraAPI grants do not allow audit evidence reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Audit evidence' })).toHaveCount(0);
});

test('UXR-27 exact trace uses the published correlation filter, opens matching detail and clears previous trace', async ({ page }) => {
  await mockAudit(page, ['workbench:resources:read', 'workbench:resources:search']);
  await page.route('**/api/v1/workbench/audit/audit-event/search', async route => {
    expect(route.request().postDataJSON()).toEqual({ filters: { correlationId: 'corr-1' }, page: 0, size: 50 });
    await route.fulfill({ json: { module: 'audit', resource: 'audit-event', page: 0, size: 50, totalPages: 1, totalElements: 1,
      items: [{ module: 'audit', resource: 'audit-event', id: 'audit-1',
        attributes: { correlationId: 'corr-1', actionCode: 'EXACT TRACE', sourceModule: 'workflow' } }] } });
  });
  await signIn(page); await openAuditWorkspace(page);
  await page.getByLabel('Exact correlation ID').fill('corr-1');
  await page.getByRole('button', { name: 'Find exact trace' }).click();
  const traceCell = page.getByRole('cell', { name: 'EXACT TRACE', exact: true });
  const traceRow = page.getByRole('row').filter({ has: traceCell });
  await expect(traceCell).toBeVisible();
  await expect(traceRow).toHaveCount(1);
  await traceRow.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Audit event detail' })).toBeVisible();
  const detail = page.locator('pre').filter({ hasText: /"correlationId": "corr-1"/ });
  await expect(detail).toBeVisible();
  await expect(detail).toHaveText(JSON.stringify({
    actionCode: 'APPROVE', sourceModule: 'workflow', targetId: 'reading-42', correlationId: 'corr-1',
  }, null, 2));
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Audit event detail' })).toHaveCount(0);
  await expect(detail).toHaveCount(0);
  await expect(page.getByLabel('Exact correlation ID')).toHaveValue('');
  await expect(traceCell).toHaveCount(0);
  await expect(page.getByRole('cell', { name: 'Operator A', exact: true })).toBeVisible();
});

const auditId = 'a021e8b0-2de0-4272-87cb-74357a27ef96';
const exactField = (page: Page, name: string) => page.getByRole('textbox', { name: new RegExp('^' + name + '(?:\\s*\\*)?$') });

test('UXR-27 pressure owner evidence works without generic Audit rights and masks denial', async ({ page }) => {
  await mockAudit(page, ['topology:operating-constraints:read']);
  let generic = 0;
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/v1/workbench/audit')) generic++; });
  await page.route('**/api/v1/topology/operating-constraints/pipelines/pipeline-1/restriction-requests/*/evidence?**', async route => {
    const url = new URL(route.request().url());
    expect(url.pathname).toContain(auditId);
    expect(url.searchParams.get('sectionId')).toBe('section-1');
    if (url.searchParams.get('companyPartyId') !== 'company-1') {
      await route.fulfill({ status: 404, json: { detail: 'do not disclose this' } }); return;
    }
    await route.fulfill({ json: {
      publication: { requestId: auditId, revisionId: 'revision-1', streamVersion: 3 },
      decisions: [{ candidateId: 'candidate-1', instanceId: 'instance-1', taskId: 'task-1',
        actionId: 'action-1', auditEventId: 'audit-witness-1', reviewerId: 'reviewer-1', decidedAt: '2026-11-24T12:00:00Z' }],
    } });
  });
  await signIn(page); await openAuditWorkspace(page);
  await expect(page.getByRole('heading', { name: 'Audit evidence' })).toHaveCount(0);
  await exactField(page, 'Evidence company ID').fill('company-1');
  await exactField(page, 'Evidence pipeline ID').fill('pipeline-1');
  await page.getByLabel('Evidence section ID (optional)', { exact: true }).fill('section-1');
  await exactField(page, 'Evidence restriction request ID').fill(auditId);
  await page.getByRole('button', { name: 'Read pressure decision trace' }).click();
  await expect(page.getByText('Audit witness · audit-witness-1', { exact: true })).toBeVisible();
  await exactField(page, 'Evidence company ID').fill('foreign');
  await expect(page.getByText('Audit witness · audit-witness-1', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Read pressure decision trace' }).click();
  await expect(page.getByText('Audit evidence unavailable or not authorized.')).toBeVisible();
  await expect(page.getByText('do not disclose this')).toHaveCount(0);
  expect(generic).toBe(0);
});

test('UXR-27 scoped Risk page, exact idempotency key, manifest read and frozen download', async ({ page }) => {
  await mockAudit(page, ['audit:scoped-evidence:read', 'audit:scoped-evidence:export']);
  const base = '/api/v1/audit/companies/company-1/facilities/facility-1';
  const from = '2026-11-24T00:00:00Z', to = '2026-11-24T23:00:00Z';
  const eventType = 'RISK_ASSESSMENT_APPROVED';
  const purpose = 'GZ2_SYNTHETIC_ASSURANCE';
  const bytes = '{"synthetic":true}';
  const digest = createHash('sha256').update(bytes).digest();
  const manifest = { companyId: 'company-1', facilityId: 'facility-1', exportId: auditId,
    status: 'COMPLETED', format: 'GZ2_AUDIT_EVIDENCE_JSON_V1', purpose, eventType, from, to,
    eventCount: 1, byteLength: Buffer.byteLength(bytes), sha256: digest.toString('hex'), completedAt: to };
  let manifestReads = 0, downloads = 0, generic = 0;
  let corrupt = false;
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/v1/workbench/audit')) generic++; });
  await page.route('**' + base + '/events?**', async route => {
    const query = new URL(route.request().url()).searchParams;
    expect(query.get('eventType')).toBe(eventType);
    expect(query.get('from')).toBe(from);
    expect(query.get('to')).toBe(to);
    expect(query.get('limit')).toBe('25');
    const cursor = query.get('cursor');
    expect([null, 'v1.abc']).toContain(cursor);
    await route.fulfill({ json: { items: [{ eventId: cursor ? 'event-2' : 'event-1',
      eventType, operation: 'APPROVE', targetId: 'risk-1', workflowActionId: 'action-1', occurredAt: from }],
      nextCursor: cursor ? null : 'v1.abc' } });
  });
  await page.route('**' + base + '/exports', async route => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({ from, to, eventType, purpose, requestKey: 'stable-key' });
    await route.fulfill({ status: 201, json: manifest });
  });
  await page.route('**' + base + '/exports/' + auditId, async route => {
    manifestReads++;
    await route.fulfill({ json: manifest });
  });
  await page.route('**' + base + '/exports/' + auditId + '/content', async route => {
    downloads++;
    await route.fulfill({ contentType: 'application/json', body: corrupt ? '{"synthetic":null}' : bytes,
      headers: { 'Content-Disposition': 'attachment; filename="gz2-audit-' + auditId + '.json"',
        'Content-Digest': 'sha-256=:' + digest.toString('base64') + ':' } });
  });
  await signIn(page); await openAuditWorkspace(page);
  await expect(page.getByRole('heading', { name: 'Scoped Risk audit evidence' })).toBeVisible();
  await exactField(page, 'Audit company ID').fill('company-1');
  await exactField(page, 'Audit facility ID').fill('facility-1');
  await exactField(page, 'Audit from \\(UTC\\)').fill(from);
  await exactField(page, 'Audit to \\(UTC\\)').fill(to);
  await page.getByRole('button', { name: 'Search scoped Risk events' }).click();
  await expect(page.getByText('Audit event · event-1', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next Risk events' }).click();
  await expect(page.getByText('Audit event · event-2', { exact: true })).toBeVisible();
  await page.getByLabel('Export request key').fill('stable-key');
  await page.getByRole('button', { name: 'Create scoped Risk export' }).click();
  await expect(page.getByText(/Export recorded/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download scoped Risk export' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Read scoped export manifest' }).click();
  await expect(page.getByText('Owner SHA-256 · ' + manifest.sha256)).toBeVisible();
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download scoped Risk export' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('gz2-audit-' + auditId + '.json');
  expect(await download.failure()).toBeNull();
  expect(manifestReads).toBe(2); expect(downloads).toBe(1); expect(generic).toBe(0);
  corrupt = true;
  await page.getByRole('button', { name: 'Download scoped Risk export' }).click();
  await expect(page.getByText('Audit evidence could not be verified or loaded.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download scoped Risk export' })).toHaveCount(0);
  expect(manifestReads).toBe(3); expect(downloads).toBe(2);
  await exactField(page, 'Audit company ID').fill('foreign');
  await expect(page.getByText('Owner SHA-256 · ' + manifest.sha256)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Download scoped Risk export' })).toHaveCount(0);
});
